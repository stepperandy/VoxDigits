/**
 * Web fallback for VoxVpnPlugin — used only in browser/Vite preview.
 * Simulates connect/disconnect with a 2s delay so the UI works during development.
 */
export class VoxVpnPluginWeb {
  constructor() {
    this._connected = false;
    this._listeners = [];
  }

  async connect({ config }) {
    await new Promise(r => setTimeout(r, 2000));
    this._connected = true;
    this._emit({ state: 'CONNECTED', connected: true, connecting: false, level: 'LEVEL_CONNECTED', message: `[WEB MOCK] Connected to ${config}` });
    return { state: 'CONNECTED', connected: true, level: 'LEVEL_CONNECTED' };
  }

  async disconnect() {
    await new Promise(r => setTimeout(r, 500));
    this._connected = false;
    this._emit({ state: 'DISCONNECTED', connected: false, connecting: false, level: 'LEVEL_NOTCONNECTED', message: '[WEB MOCK] Disconnected' });
    return { success: true, state: 'DISCONNECTED' };
  }

  async getStatus() {
    return {
      state: this._connected ? 'CONNECTED' : 'DISCONNECTED',
      connected: this._connected,
      level: this._connected ? 'LEVEL_CONNECTED' : 'LEVEL_NOTCONNECTED',
    };
  }

  addListener(eventName, handler) {
    this._listeners.push({ eventName, handler });
    return { remove: () => { this._listeners = this._listeners.filter(l => l.handler !== handler); } };
  }

  _emit(data) {
    this._listeners.filter(l => l.eventName === 'vpnStatus').forEach(l => l.handler(data));
  }
}