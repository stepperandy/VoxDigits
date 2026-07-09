/* eslint-disable no-undef */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronVPN', {
  // Window controls — minimize to tray, not close
  minimize: () => ipcRenderer.send('win-minimize'),
  close:    () => ipcRenderer.send('win-close'),

  // VPN actions
  connect:    (ovpnContent) => ipcRenderer.invoke('vpn-connect', { ovpnContent }),
  disconnect: ()            => ipcRenderer.invoke('vpn-disconnect'),
  getStatus:  ()            => ipcRenderer.invoke('vpn-status'),
  getLog:     ()            => ipcRenderer.invoke('vpn-get-log'),

  // Real-time events from main process
  onStatus: (cb) => ipcRenderer.on('vpn-status', (_e, s) => cb(s)),
  onLog:    (cb) => ipcRenderer.on('vpn-log',    (_e, l) => cb(l)),

  // Cleanup
  off: (channel) => ipcRenderer.removeAllListeners(channel),

  // Secure token storage (OS-encrypted via safeStorage)
  saveToken:  (token) => ipcRenderer.invoke('token-save', token),
  loadToken:  ()      => ipcRenderer.invoke('token-load'),
  clearToken: ()      => ipcRenderer.invoke('token-clear'),

  // Auto-start with Windows
  enableAutoStart:  () => ipcRenderer.invoke('autostart-enable'),
  disableAutoStart: () => ipcRenderer.invoke('autostart-disable'),
  getAutoStartStatus: () => ipcRenderer.invoke('autostart-status'),

  // DNS filtering
  applyDnsFilter:  (domains) => ipcRenderer.invoke('dns-apply', domains),
  removeDnsFilter: ()        => ipcRenderer.invoke('dns-remove'),
  getDnsStatus:    ()        => ipcRenderer.invoke('dns-status'),

  // Tray update
  updateTray: (connected) => ipcRenderer.send('tray-update', { connected }),

  // Version / update check
  getVersion:  () => ipcRenderer.invoke('get-version'),
  getAppName:  () => ipcRenderer.invoke('get-app-name'),
  checkUpdate: () => ipcRenderer.invoke('check-update'),
});