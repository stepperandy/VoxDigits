/* eslint-disable no-undef */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronVPN', {
  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  close:    () => ipcRenderer.send('window-close'),

  // VPN actions
  connect:       (opts) => ipcRenderer.invoke('vpn-connect', opts),
  disconnect:    ()     => ipcRenderer.invoke('vpn-disconnect'),
  isConnected:   ()     => ipcRenderer.invoke('vpn-is-connected'),

  // Listen for status updates pushed from main process
  onStatus: (cb) => ipcRenderer.on('vpn-status', (_e, s) => cb(s)),
  onLog:    (cb) => ipcRenderer.on('vpn-log',    (_e, l) => cb(l)),

  // Cleanup listeners
  removeAllListeners: (ch) => ipcRenderer.removeAllListeners(ch),
});