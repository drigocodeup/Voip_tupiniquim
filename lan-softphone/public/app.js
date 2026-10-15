const $ = (selector) => document.querySelector(selector);
const joinForm = $("#join-form");
const setup = $("#setup");
const phone = $("#phone");
const dialInput = $("#dial-input");
const callButton = $("#call");
const message = $("#message");
const setupMessage = $("#setup-message");
const status = $("#status");
const roomStatus = $("#room-status");
const peerList = $("#peer-list");
const contactList = $("#contact-list");
const remoteAudio = new Audio();
remoteAudio.autoplay = true;

let socket;
let peer;
let localStream;
let room;
let signalHost = location.host;
let discoveredPeers = [];
let selfInfo;

function chooseCoordinator() {
  const candidates = [selfInfo, ...discoveredPeers].filter(Boolean).sort((left, right) => left.id.localeCompare(right.id));
  const coordinator = candidates[0];
  if (!coordinator) {
    signalHost = location.host;
    return;
  }
  signalHost = coordinator.id === selfInfo?.id ? location.host : `${coordinator.host}:${coordinator.port}`;
  if (!phone.classList.contains("hidden")) return;
  setupMessage.textContent = `Servidor automático: ${coordinator.name}`;
}

function say(text) { message.textContent = text; }
function setStatus(text) { status.textContent = text; }
function send(payload) { socket?.send(JSON.stringify(payload)); }

function selectPeer(selectedHost, name) {
  signalHost = selectedHost;
  document.querySelectorAll(".peer-button").forEach((button) => button.classList.toggle("selected", button.dataset.host === selectedHost));
  setupMessage.textContent = `Servidor selecionado: ${name} (${selectedHost})`;
}

function renderPeers() {
  if (!discoveredPeers.length) {
    peerList.innerHTML = '<span class="discovery-empty">Nenhum outro computador encontrado.</span>';
    if (contactList) contactList.innerHTML = '<span class="discovery-empty">Nenhum dispositivo descoberto.</span>';
    return;
  }
  peerList.innerHTML = discoveredPeers.map((peer) => {
    const host = `${peer.host}:${peer.port}`;
    return `<button type="button" class="peer-button" data-host="${host}" data-name="${peer.name}"><span class="presence"></span><span>${peer.name}</span><span class="peer-address">${host}</span></button>`;
  }).join("");
  peerList.querySelectorAll(".peer-button").forEach((button) => button.addEventListener("click", () => selectPeer(button.dataset.host, button.dataset.name)));
  if (contactList) {
    contactList.innerHTML = discoveredPeers.map((peer) => `<button type="button" class="contact-row" data-host="${peer.host}:${peer.port}"><span class="presence" style="background:#0aaa31"></span><span>${peer.name}</span><span>Online</span></button>`).join("");
    contactList.querySelectorAll(".contact-row").forEach((button) => button.addEventListener("click", () => {
      selectPeer(button.dataset.host, button.children[1].textContent);
      document.querySelector('[data-tab="telephone"]').click();
    }));
  }
}

async function refreshPeers() {
  try {
    const [selfResponse, peersResponse] = await Promise.all([
      fetch("/api/me", { cache: "no-store" }),
      fetch("/api/peers", { cache: "no-store" }),
    ]);
    selfInfo = await selfResponse.json();
    discoveredPeers = await peersResponse.json();
    chooseCoordinator();
    renderPeers();
  } catch {
    peerList.innerHTML = '<span class="discovery-empty">Descoberta indisponível.</span>';
  }
}

function createPeer() {
  peer = new RTCPeerConnection({ iceServers: [] });
  peer.onicecandidate = ({ candidate }) => candidate && send({ type: "ice", candidate });
  peer.ontrack = ({ streams }) => { remoteAudio.srcObject = streams[0]; };
  peer.onconnectionstatechange = () => setStatus(peer.connectionState === "connected" ? "Em chamada" : peer.connectionState);
  localStream?.getTracks().forEach((track) => peer.addTrack(track, localStream));
}

async function startCall() {
  localStream ??= await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  createPeer();
  await peer.setLocalDescription(await peer.createOffer());
  send({ type: "offer", offer: peer.localDescription });
  callButton.disabled = true;
  callButton.textContent = "Chamando...";
  setStatus("Chamando...");
}

async function handleOffer(offer) {
  localStream ??= await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  createPeer();
  await peer.setRemoteDescription(offer);
  await peer.setLocalDescription(await peer.createAnswer());
  send({ type: "answer", answer: peer.localDescription });
  callButton.disabled = true;
  callButton.textContent = "Em chamada";
}

function hangup() {
  peer?.close();
  peer = undefined;
  callButton.disabled = false;
  callButton.textContent = "Chamar";
  setStatus("Online");
  say("");
  send({ type: "hangup" });
}

joinForm.addEventListener("submit", (event) => {
  event.preventDefault();
  room = $("#room").value.trim().toUpperCase();
  socket = new WebSocket(`${location.protocol === "https:" ? "wss" : "ws"}://${signalHost}`);
  socket.addEventListener("open", () => send({ type: "join", room, name: $("#name").value.trim() }));
  socket.addEventListener("message", async ({ data }) => {
    const event = JSON.parse(data);
    if (event.type === "joined") {
      setup.classList.add("hidden");
      phone.classList.remove("hidden");
      roomStatus.textContent = room;
      callButton.disabled = event.participants !== 2;
      setStatus(event.participants === 2 ? "Online" : "Aguardando");
    } else if (event.type === "peer-joined") {
      callButton.disabled = false;
      setStatus("Online");
    } else if (event.type === "offer") await handleOffer(event.offer);
    else if (event.type === "answer" && peer) await peer.setRemoteDescription(event.answer);
    else if (event.type === "ice" && peer) await peer.addIceCandidate(event.candidate);
    else if (event.type === "hangup") hangup();
    else if (event.type === "peer-left") { hangup(); setStatus("Aguardando"); callButton.disabled = true; }
    else if (event.type === "error") setupMessage.textContent = event.message;
  });
  socket.addEventListener("close", () => setStatus("Offline"));
});

document.querySelectorAll("[data-dial]").forEach((button) => button.addEventListener("click", () => { dialInput.value += button.dataset.dial; }));
document.querySelectorAll("[data-action='clear']").forEach((button) => button.addEventListener("click", () => { dialInput.value = ""; }));
document.querySelectorAll("[data-action='recent']").forEach((button) => button.addEventListener("click", () => dialInput.focus()));
callButton.addEventListener("click", () => startCall().catch((error) => say(`Microfone indisponível: ${error.message}`)));
$("#message-button").addEventListener("click", () => say("Mensagens ainda serão adicionadas."));
$("#menu-button").addEventListener("click", () => say("Descoberta automática da rede local ativa."));
document.querySelectorAll(".tab").forEach((tab) => tab.addEventListener("click", () => {
  const target = tab.dataset.tab;
  if (!target) return;
  document.querySelectorAll(".tab").forEach((item) => { item.classList.toggle("active", item === tab); item.setAttribute("aria-selected", item === tab); });
  document.querySelectorAll(".tab-panel").forEach((panel) => { const active = panel.id === target; panel.classList.toggle("active", active); panel.hidden = !active; });
}));

refreshPeers();
setInterval(refreshPeers, 4000);
