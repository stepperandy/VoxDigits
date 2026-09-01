/* eslint-disable no-undef */
const { app, BrowserWindow, ipcMain, safeStorage, Tray, Menu, nativeImage, shell } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const os = require('os');

const APP_VERSION = '3.0.0';
const APP_NAME = 'VoxVPN Shield Agent';
const BASE44_APP_ID = '69c84f61d5543b54fe26e1e5';
const BASE_FN = `https://api.base44.com/api/apps/${BASE44_APP_ID}/functions`;

let mainWindow = null;
let tray = null;
let openvpnProcess = null;
let isQuitting = false;

// DNS filtering state
let dnsFilterActive = false;
let dnsBlocklist = [];

// ─── Secure token store (encrypted via OS keychain) ───────────────────────────
const TOKEN_FILE = path.join(app.getPath('userData'), 'voxvpn_shield.enc');

function saveToken(token) {
  if (!token) return;
  if (safeStorage.isEncryptionAvailable()) {
    const enc = safeStorage.encryptString(token);
    fs.writeFileSync(TOKEN_FILE, enc);
  } else {
    fs.writeFileSync(TOKEN_FILE, token, 'utf8');
  }
}

function loadToken() {
  if (!fs.existsSync(TOKEN_FILE)) return null;
  const raw = fs.readFileSync(TOKEN_FILE);
  if (safeStorage.isEncryptionAvailable()) {
    try { return safeStorage.decryptString(raw); } catch { return null; }
  }
  return raw.toString('utf8');
}

function clearToken() {
  if (fs.existsSync(TOKEN_FILE)) fs.unlinkSync(TOKEN_FILE);
}

// ─── Auto-start with Windows ───────────────────────────────────────────────────
const AUTOSTART_KEY = 'VoxVPNShieldAgent';

function enableAutoStart() {
  if (process.platform !== 'win32') return;
  const exePath = process.execPath;
  const regCmd = `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${AUTOSTART_KEY}" /t REG_SZ /d "\"${exePath}\" --minimized" /f`;
  exec(regCmd, () => {});
}

function disableAutoStart() {
  if (process.platform !== 'win32') return;
  exec(`reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${AUTOSTART_KEY}" /f`, () => {});
}

function isAutoStartEnabled() {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') return resolve(false);
    exec(`reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${AUTOSTART_KEY}"`, (err, stdout) => {
      resolve(!err && stdout.includes(AUTOSTART_KEY));
    });
  });
}

// ─── DNS Filtering via Windows hosts file ──────────────────────────────────────
const HOSTS_FILE = 'C:\\Windows\\System32\\drivers\\etc\\hosts';
const HOSTS_MARKER_START = '# === VoxVPN Shield DNS Filter Start ===';
const HOSTS_MARKER_END = '# === VoxVPN Shield DNS Filter End ===';

function applyDnsFiltering(domains) {
  if (process.platform !== 'win32') return false;
  try {
    let content = '';
    if (fs.existsSync(HOSTS_FILE)) {
      content = fs.readFileSync(HOSTS_FILE, 'utf8');
    }
    // Remove existing VoxVPN block
    const startIdx = content.indexOf(HOSTS_MARKER_START);
    const endIdx = content.indexOf(HOSTS_MARKER_END);
    if (startIdx !== -1 && endIdx !== -1) {
      content = content.substring(0, startIdx).trimEnd() + '\n' + content.substring(endIdx + HOSTS_MARKER_END.length).trimStart();
    }
    // Add new blocklist
    if (domains.length > 0) {
      const blockLines = domains.map(d => `0.0.0.0 ${d}`).join('\n');
      content += `\n${HOSTS_MARKER_START}\n${blockLines}\n${HOSTS_MARKER_END}\n`;
    }
    fs.writeFileSync(HOSTS_FILE, content, 'utf8');
    // Flush DNS cache
    exec('ipconfig /flushdns', () => {});
    dnsFilterActive = true;
    dnsBlocklist = domains;
    return true;
  } catch (err) {
    return false;
  }
}

function removeDnsFiltering() {
  if (process.platform !== 'win32') return false;
  try {
    if (!fs.existsSync(HOSTS_FILE)) return true;
    let content = fs.readFileSync(HOSTS_FILE, 'utf8');
    const startIdx = content.indexOf(HOSTS_MARKER_START);
    const endIdx = content.indexOf(HOSTS_MARKER_END);
    if (startIdx !== -1 && endIdx !== -1) {
      content = content.substring(0, startIdx).trimEnd() + '\n' + content.substring(endIdx + HOSTS_MARKER_END.length).trimStart();
      fs.writeFileSync(HOSTS_FILE, content, 'utf8');
      exec('ipconfig /flushdns', () => {});
    }
    dnsFilterActive = false;
    dnsBlocklist = [];
    return true;
  } catch (err) {
    return false;
  }
}

// ─── Window ───────────────────────────────────────────────────────────────────
function createWindow(startMinimized = false) {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 680,
    resizable: false,
    frame: false,
    backgroundColor: '#080c18',
    show: !startMinimized,
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

  // Minimize to tray instead of closing
  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ─── Tray icon ────────────────────────────────────────────────────────────────
function createTray() {
  // Use a simple programmatic icon if no .ico file is available
  let trayIcon;
  const iconPath = path.join(process.resourcesPath || __dirname, 'assets', 'tray-icon.png');
  if (fs.existsSync(iconPath)) {
    trayIcon = nativeImage.createFromPath(iconPath);
  } else {
    // Create a minimal 16x16 cyan icon
    trayIcon = nativeImage.createFromBuffer(Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAlwSFlz',
      'AAAAOAAAOAAAFqPCBAAAAipJREFUOI2lkz9IQ1EUxr9zTNqMWkRqEtSiLcSi7CSCkJaCSgvtUmtb',
      'yih6SioNItTWXkRB8EW0iI2E2FoQSqtptk1KO+y5c57nPHu9y32+c8493/vOczPvIyMjIyMjIyMj',
      'I6QSyq3X62pra5NKpYIoShAEpNNpBEEAQAj4vg/A6XQKo6peQgixscpqtYr29nccxwOn0wmv1xtk',
      'WUar1RrAAFiWxXQ6nQ5eANlsFq/XG71eD7VajYED8DwPnU4Hh8MBo9EIsVgMqVQKlUpVYAewLAtv',
      'v5/u7m40NjZCSklPTw+8Lq4BB8dxUKvV0Ol0UCqVbCwBhmFobm7G09MTQghs25ZsAgCbm5tYLBY0',
      'NjaC53msZ8BxnFBSMDQ0BAA4nU4Qi士顿+s/Nz8/T2NjIyorK0ktLS1gWRYbk8kEj8cjrwBgpVIZ',
      'bHx8HKVSiR49eqS6u7tpdHQU0Wg0UQqFQlRUVNBwOMyOj4/p7e2N5vN5JiI6cUP1+/2Ul5dHU1NT',
      'NDg4mOqRTCYTs+PjYwqCgPb29mhpaYnc83K5rP1+/0ft7e1MTk7O8/k8zWazLG9tbU0EAkn8/X2N',
      'RqPkhoeHqYaGBo4fx3H0DzQajf2vP0qlkpqcnJxqbm5O9vb2Ul9fnwzE4/HQ/v5+HeN7vV5Kp9Pi',
      'OOYtLS1VAKQSCmF0dJQ6AxjT09Pp8PCQFQ6HpVQqpZaWlnyG/D+WkZGRkZGRkR9YfwEY1m0N3X0O',
      '8AAAAABJRU5ErkJggg==',
      'base64'
    ));
  }

  tray = new Tray(trayIcon);
  tray.setToolTip(APP_NAME);

  const updateTrayMenu = (vpnConnected = false) => {
    const contextMenu = Menu.buildFromTemplate([
      { label: APP_NAME, enabled: false },
      { type: 'separator' },
      {
        label: vpnConnected ? '● Connected' : '○ Disconnected',
        enabled: false,
      },
      { type: 'separator' },
      {
        label: 'Show Window',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        },
      },
      {
        label: 'Quit',
        click: () => {
          isQuitting = true;
          removeDnsFiltering();
          stopVpn();
          app.quit();
        },
      },
    ]);
    tray.setContextMenu(contextMenu);
  };

  updateTrayMenu(false);

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  return { updateTrayMenu };
}

const trayManager = { updateTrayMenu: () => {} };

app.whenReady().then(() => {
  const startMinimized = process.argv.includes('--minimized');
  createWindow(startMinimized);
  const t = createTray();
  Object.assign(trayManager, t);
});

app.on('window-all-closed', () => {
  // Don't quit — minimize to tray
});

app.on('before-quit', () => {
  isQuitting = true;
  removeDnsFiltering();
  stopVpn();
});

// ─── Window controls ──────────────────────────────────────────────────────────
ipcMain.on('win-minimize', () => {
  if (mainWindow) mainWindow.hide();
});
ipcMain.on('win-close', () => { if (mainWindow) mainWindow.hide(); });

// ─── Secure token IPC ─────────────────────────────────────────────────────────
ipcMain.handle('token-save',  (_e, token) => { saveToken(token); return true; });
ipcMain.handle('token-load',  ()           => loadToken());
ipcMain.handle('token-clear', ()           => { clearToken(); return true; });

// ─── Auto-start IPC ──────────────────────────────────────────────────────────
ipcMain.handle('autostart-enable',  () => { enableAutoStart(); return true; });
ipcMain.handle('autostart-disable', () => { disableAutoStart(); return true; });
ipcMain.handle('autostart-status',  async () => await isAutoStartEnabled());

// ─── DNS Filtering IPC ─────────────────────────────────────────────────────────
ipcMain.handle('dns-apply',  (_e, domains) => applyDnsFiltering(domains));
ipcMain.handle('dns-remove',  () => removeDnsFiltering());
ipcMain.handle('dns-status',  () => ({ active: dnsFilterActive, blocklist: dnsBlocklist }));

// ─── Version / update check ───────────────────────────────────────────────────
ipcMain.handle('check-update', async () => {
  try {
    const res = await fetch(`${BASE_FN}/latestVersion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform: 'Windows' }),
    });
    const data = await res.json();
    const latest = data?.version || data?.latest_version || null;
    if (!latest) return { hasUpdate: false, current: APP_VERSION };
    const hasUpdate = latest !== APP_VERSION;
    return { hasUpdate, current: APP_VERSION, latest, downloadUrl: data?.download_url || null };
  } catch {
    return { hasUpdate: false, current: APP_VERSION };
  }
});

// ─── App version ──────────────────────────────────────────────────────────────
ipcMain.handle('get-version', () => APP_VERSION);
ipcMain.handle('get-app-name', () => APP_NAME);

// ─── Tray update from renderer ────────────────────────────────────────────────
ipcMain.on('tray-update', (_e, { connected }) => {
  trayManager.updateTrayMenu(connected);
});

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
  stopVpn();

  const bin = findOpenvpn();
  if (!bin) return { ok: false, error: 'OpenVPN not found. Please reinstall VoxVPN Shield Agent.' };

  const tmpFile = path.join(os.tmpdir(), 'voxvpn-shield-active.ovpn');
  const logFile = path.join(os.tmpdir(), 'voxvpn-shield.log');
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
        trayManager.updateTrayMenu(true);
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
      trayManager.updateTrayMenu(false);
      if (!resolved) {
        resolved = true;
        resolve({ ok: false, error: 'OpenVPN exited unexpectedly. Check log.' });
      }
    });

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
  const logFile = path.join(os.tmpdir(), 'voxvpn-shield.log');
  try {
    const content = fs.readFileSync(logFile, 'utf8');
    return content.trim().split('\n').slice(-20).join('\n');
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
  exec('taskkill /F /IM openvpn.exe', () => {});
  trayManager.updateTrayMenu(false);
}