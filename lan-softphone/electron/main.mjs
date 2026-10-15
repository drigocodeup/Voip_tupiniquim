import { app, BrowserWindow, dialog } from "electron";
import { createServer } from "node:net";
import { startServer } from "../server-core.mjs";

app.disableHardwareAcceleration();

let window;
let localPort;

async function findFreePort() {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const port = probe.address().port;
      probe.close(() => resolve(port));
    });
  });
}

async function startLocalServer() {
  localPort = await findFreePort();
  startServer(localPort);
}

async function createWindow() {
  await startLocalServer();
  window = new BrowserWindow({
    width: 270,
    height: 500,
    minWidth: 240,
    minHeight: 430,
    resizable: true,
    backgroundColor: "#e8e8e8",
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });
  await window.loadURL(`http://localhost:${localPort}`);
  window.on("closed", () => { window = undefined; });
}

app.whenReady().then(createWindow).catch((error) => {
  dialog.showErrorBox("ComunicaCess", `NÃ£o foi possÃ­vel iniciar o servidor local: ${error.message}`);
  app.quit();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
