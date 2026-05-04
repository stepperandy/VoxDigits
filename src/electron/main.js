/* eslint-disable no-undef */
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const os = require('os');

let mainWindow = null;
let openvpnProcess = null;

// ─── Window ───────────────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    resizable: false,
    frame: false,
    backgroundColor: '#080c18',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  } else {
    mainWindow.loadURL('http://localhost:5173');
  }

  mainWindow.on('closed', () => {
    stopVpn();
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  stopVpn();
  app.quit();
});

// ─── Window controls ──────────────────────────────────────────────────────────
ipcMain.on('win-minimize', () => mainWindow?.minimize());
ipcMain.on('win-close', () => { stopVpn(); mainWindow?.close(); });

// ─── Find openvpn.exe ─────────────────────────────────────────────────────────
function findOpenvpn() {
  const candidates = [
    'C:\\Program Files\\OpenVPN\\bin\\openvpn.exe',
    'C:\\Program Files (x86)\\OpenVPN\\bin\\openvpn.exe',
    path.join(process.resourcesPath || '', 'openvpn', 'openvpn.exe'),
  ];
  return candidates.find(p => fs.existsSync(p)) || null;
}

// ─── VPN: Connect ─────────────────────────────────────────────────────────────
ipcMain.handle('vpn-connect', async (_e, { ovpnContent }) => {
  stopVpn(); // kill any existing session

  const bin = findOpenvpn();
  if (!bin) {
    return { ok: false, error: 'OpenVPN not found. Please reinstall VoxVPN.' };
  }

  // Write .ovpn to temp
  const tmpFile = path.join(os.tmpdir(), 'voxvpn-active.ovpn');
  const logFile = path.join(os.tmpdir(), 'voxvpn.log');
  fs.writeFileSync(tmpFile, ovpnContent, 'utf8');

  return new Promise((resolve) => {
    openvpnProcess = spawn(bin, ['--config', tmpFile, '--log', logFile], {
      windowsHide: true,
      detached: false,
    });

    let resolved = false;

    const onData = (data) => {
      const line = data.toString();
      mainWindow?.webContents.send('vpn-log', line);

      if (!resolved && line.includes('Initialization Sequence Completed')) {
        resolved = true;
        mainWindow?.webContents.send('vpn-status', 'connected');
        resolve({ ok: true });
      }

      if (!resolved && (line.includes('AUTH_FAILED') || line.includes('TLS Error') || line.includes('SIGTERM'))) {
        resolved = true;
        stopVpn();
        resolve({ ok: false, error: line.trim() });
      }
    };

    openvpnProcess.stdout.on('data', onData);
    openvpnProcess.stderr.on('data', onData);

    openvpnProcess.on('exit', () => {
      openvpnProcess = null;
      fs.unlink(tmpFile, () => {});
      mainWindow?.webContents.send('vpn-status', 'idle');
      if (!resolved) {
        resolved = true;
        resolve({ ok: false, error: 'OpenVPN exited unexpectedly. Check log.' });
      }
    });

    // Timeout after 30s
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve({ ok: false, error: 'Connection timed out after 30 seconds.' });
      }
    }, 30000);
  });
});

// ─── VPN: Disconnect ──────────────────────────────────────────────────────────
ipcMain.handle('vpn-disconnect', () => {
  stopVpn();
  return { ok: true };
});

// ─── VPN: Status ──────────────────────────────────────────────────────────────
ipcMain.handle('vpn-status', () => ({
  connected: openvpnProcess !== null,
}));

// ─── Read last log lines ───────────────────────────────────────────────────────
ipcMain.handle('vpn-get-log', () => {
  const logFile = path.join(os.tmpdir(), 'voxvpn.log');
  try {
    const content = fs.readFileSync(logFile, 'utf8');
    const lines = content.trim().split('\n');
    return lines.slice(-20).join('\n');
  } catch {
    return 'No log available.';
  }
});

// ─── Helper ───────────────────────────────────────────────────────────────────
function stopVpn() {
  if (openvpnProcess) {
    openvpnProcess.kill();
    openvpnProcess = null;
  }
  // Kill any stray openvpn.exe processes (NOT openvpn-gui.exe)
  exec('taskkill /F /IM openvpn.exe', () => {});
}