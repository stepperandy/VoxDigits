import { getVpnPlugin } from './vpnNativePlugin';
export const STATES = { IDLE: 'idle', CONNECTING: 'connecting', CONNECTED: 'connected', DISCONNECTED: 'disconnected', FAILED: 'failed' };
export async function connectToVpn() {
  throw new Error('Direct connection is not configured. Download a profile from /vpn-servers and import it into a VPN client.');
}
export async function disconnectVpn() { return (await getVpnPlugin()).disconnect(); }
export async function getVpnStatus() { return (await getVpnPlugin()).getStatus(); }
