// Browsers cannot establish a device-wide VPN tunnel.
export class VoxVpnPluginWeb {
  async connect() { throw new Error('Install a VPN client and import your profile to connect.'); }
  async disconnect() { throw new Error('Disconnect in the VPN application that owns the tunnel.'); }
  async getStatus() { return { state: 'UNAVAILABLE', connected: false, supported: false }; }
  async addListener() { return { remove() {} }; }
}
