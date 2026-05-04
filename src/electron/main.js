/* eslint-disable no-undef */
const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const os = require('os');

let mainWindow;
let openvpnProcess = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 680,
    resizable: false,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#080c18',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // In production load built React app; in dev load Vite dev server
  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  } else {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    disconnectVpn();
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  disconnectVpn();
  if (process.platform !== 'darwin') app.quit();
});

// ─── Window controls ──────────────────────────────────────────────────────────
ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-close',    () => { disconnectVpn(); mainWindow?.close(); });

// ─── VPN: Connect ─────────────────────────────────────────────────────────────
ipcMain.handle('vpn-connect', async (_event, { ovpnContent }) => {
  try {
    // Kill any existing VPN session first
    disconnectVpn();

    // Write config to a temp file
    const tmpFile = path.join(os.tmpdir(), 'voxvpn-active.ovpn');
    fs.writeFileSync(tmpFile, ovpnContent, 'utf8');

    // Use the CLI openvpn.exe directly — NOT the GUI (openvpn-gui.exe)
    // Standard install path for OpenVPN Community Edition
    const candidates = [
      'C:\\Program Files\\OpenVPN\\bin\\openvpn.exe',
      'C:\\Program Files (x86)\\OpenVPN\\bin\\openvpn.exe',
      path.join(process.resourcesPath || '', 'openvpn', 'openvpn.exe'),
    ];
    const openvpnBin = candidates.find(p => fs.existsSync(p)) || 'openvpn';

    openvpnProcess = spawn(openvpnBin, [
      '--config', tmpFile,
      '--log',    path.join(os.tmpdir(), 'voxvpn.log'),
    ], {
      windowsHide: true,   // ← no window, no GUI takeover
      detached: false,
    });

    openvpnProcess.stdout.on('data', (data) => {
      const line = data.toString();
      if (mainWindow) mainWindow.webContents.send('vpn-log', line);
      if (line.includes('Initialization Sequence Completed')) {
        mainWindow?.webContents.send('vpn-status', 'connected');
      }
    });

    openvpnProcess.stderr.on('data', (data) => {
      const line = data.toString();
      if (mainWindow) mainWindow.webContents.send('vpn-log', line);
      // Some builds write the "Completed" line to stderr
      if (line.includes('Initialization Sequence Completed')) {
        mainWindow?.webContents.send('vpn-status', 'connected');
      }
    });

    openvpnProcess.on('exit', () => {
      openvpnProcess = null;
      fs.unlink(tmpFile, () => {});
      mainWindow?.webContents.send('vpn-status', 'idle');
    });

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

// ─── VPN: Disconnect ──────────────────────────────────────────────────────────
ipcMain.handle('vpn-disconnect', async () => {
  disconnectVpn();
  return { ok: true };
});

function disconnectVpn() {
  if (openvpnProcess) {
    openvpnProcess.kill();
    openvpnProcess = null;
  }
  // Also kill any stray openvpn.exe processes
  if (process.platform === 'win32') {
    exec('taskkill /F /IM openvpn.exe', () => {});
  }
}

// ─── VPN status query ─────────────────────────────────────────────────────────
ipcMain.handle('vpn-is-connected', () => ({ connected: openvpnProcess !== null }));