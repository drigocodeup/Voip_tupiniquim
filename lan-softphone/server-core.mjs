import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import os from "node:os";
import dgram from "node:dgram";
import crypto from "node:crypto";
import { WebSocketServer } from "ws";

export function startServer(port) {
  const root = join(fileURLToPath(new URL(".", import.meta.url)), "public");
  const rooms = new Map();
  const instanceId = crypto.randomUUID();
  const instanceName = process.env.COMUNICACESS_NAME || os.hostname();
  const peers = new Map();
  const discoveryPort = 39555;
  const discovery = dgram.createSocket({ type: "udp4", reuseAddr: true });
  const localAddresses = Object.values(os.networkInterfaces()).flat().filter((item) => item && item.family === "IPv4" && !item.internal).map((item) => item.address);
  const announcement = () => Buffer.from(JSON.stringify({ type: "comunicacess-presence", id: instanceId, name: instanceName, port, addresses: localAddresses, seenAt: Date.now() }));
  const announce = () => discovery.send(announcement(), 0, announcement().length, discoveryPort, "255.255.255.255");
  discovery.on("message", (raw, remote) => {
    try {
      const peer = JSON.parse(raw.toString());
      if (peer.type !== "comunicacess-presence" || peer.id === instanceId) return;
      peers.set(peer.id, { id: peer.id, name: peer.name || remote.address, host: peer.addresses?.[0] || remote.address, port: Number(peer.port), lastSeen: Date.now() });
    } catch { /* Ignore unrelated LAN datagrams. */ }
  });
  discovery.bind(discoveryPort, "0.0.0.0", () => { discovery.setBroadcast(true); announce(); });
  const announcementTimer = setInterval(announce, 5000);
  const pruneTimer = setInterval(() => { for (const [id, peer] of peers) if (Date.now() - peer.lastSeen > 15000) peers.delete(id); }, 5000);
  const contentTypes = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
  };

  const server = http.createServer(async (request, response) => {
    if (request.url === "/api/me") {
      response.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      response.end(JSON.stringify({ id: instanceId, name: instanceName, host: localAddresses[0] || "127.0.0.1", port }));
      return;
    }
    if (request.url === "/api/peers") {
      response.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      response.end(JSON.stringify([...peers.values()]));
      return;
    }
    const requested = request.url === "/" ? "/index.html" : request.url;
    const relative = normalize(decodeURIComponent(requested.split("?")[0])).replace(/^([.][.][/\\])+/, "");
    const filePath = join(root, relative);
    if (!filePath.startsWith(root)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }
    try {
      const body = await readFile(filePath);
      response.writeHead(200, { "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream" });
      response.end(body);
    } catch {
      response.writeHead(404);
      response.end("Not found");
    }
  });

  const websocket = new WebSocketServer({ server });
  const send = (socket, message) => {
    if (socket.readyState === socket.OPEN) socket.send(JSON.stringify(message));
  };
  const broadcast = (room, sender, message) => {
    for (const peer of room.peers) if (peer !== sender) send(peer.socket, message);
  };

  websocket.on("connection", (socket) => {
    let membership;
    socket.on("message", (raw) => {
      let message;
      try { message = JSON.parse(raw.toString()); }
      catch { send(socket, { type: "error", message: "Mensagem invalida." }); return; }
      if (message.type === "join") {
        const roomCode = String(message.room || "").trim().toUpperCase();
        const displayName = String(message.name || "Participante").trim().slice(0, 40);
        if (!/^[A-Z0-9-]{4,20}$/.test(roomCode)) {
          send(socket, { type: "error", message: "Use um codigo de sala com 4 a 20 caracteres." });
          return;
        }
        const room = rooms.get(roomCode) || { peers: new Set() };
        if (room.peers.size >= 2) { send(socket, { type: "error", message: "Esta sala ja tem dois participantes." }); return; }
        membership = { roomCode, peer: { socket, displayName } };
        room.peers.add(membership.peer);
        rooms.set(roomCode, room);
        send(socket, { type: "joined", room: roomCode, participants: room.peers.size });
        if (room.peers.size === 2) broadcast(room, membership.peer, { type: "peer-joined", name: displayName });
        return;
      }
      if (!membership) { send(socket, { type: "error", message: "Entre em uma sala primeiro." }); return; }
      const room = rooms.get(membership.roomCode);
      if (room && ["offer", "answer", "ice", "hangup"].includes(message.type)) {
        broadcast(room, membership.peer, { ...message, name: membership.peer.displayName });
      }
    });
    socket.on("close", () => {
      if (!membership) return;
      const room = rooms.get(membership.roomCode);
      if (!room) return;
      room.peers.delete(membership.peer);
      broadcast(room, membership.peer, { type: "peer-left", name: membership.peer.displayName });
      if (room.peers.size === 0) rooms.delete(membership.roomCode);
    });
  });

  server.listen(port, "0.0.0.0", () => {
    console.log(`LAN Softphone disponivel em http://localhost:${port}`);
    const addresses = Object.values(os.networkInterfaces()).flat().filter((item) => item && item.family === "IPv4" && !item.internal).map((item) => item.address);
    for (const address of addresses) console.log(`Acesso pela rede local: http://${address}:${port}`);
  });
  return server;
}
