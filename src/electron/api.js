/**
 * VoxVPN Shield Agent — Direct HTTP API client
 * Connects to the shared VoxVPN/VoxShield SaaS backend.
 * All requests go to Base44 backend functions via production endpoints.
 */

const BASE = 'https://api.base44.com/api/apps/69c84f61d5543b54fe26e1e5/functions';

async function request(fn, body = {}, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}/${fn}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  // downloadVpnConfig returns raw .ovpn bytes — handle separately
  if (fn === 'downloadVpnConfig') {
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || `Request failed (${res.status})`);
    }
    return res.text();
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || data?.message || `Request failed (${res.status})`);
  return data;
}

export const api = {
  // Auth — shared login with voxvpn.net / VoxShield dashboard
  login: (email, password, device_id, device_name, device_type = 'windows') =>
    request('authLogin', { email, password, device_id, device_name, device_type }),

  // Subscription status — controls VPN access
  validateSubscription: (token) =>
    request('validateSubscription', {}, token),

  // Servers — list from backend
  getServers: (token, device_id) =>
    request('getVpnServersForUser', { device_id }, token),

  recommendServer: (token, device_id) =>
    request('recommendServer', { device_id }, token),

  // Config
  downloadConfig: (token, device_id, server_id, proto = 'udp') =>
    request('downloadVpnConfig', { device_id, server_id, platform: 'windows', proto }, token),

  // Session lifecycle
  sessionStart: (token, device_id, server_id) =>
    request('connectSessionStart', { device_id, server_id }, token),

  sessionEnd: (token, device_id, server_id, bytes_sent = 0, bytes_received = 0, duration_seconds = 0) =>
    request('connectSessionEnd', { device_id, server_id, bytes_sent, bytes_received, duration_seconds }, token),

  heartbeat: (token, device_id, server_id) =>
    request('heartbeatPing', { device_id, server_id }, token),

  // Device management — admin can block/remove from VoxShield dashboard
  revokeDevice: (token, device_id) =>
    request('revokeDeviceSession', { device_id }, token),

  // Signup — creates account, then user must purchase a plan at voxvpn.net/pricing
  register: (full_name, email, password) =>
    request('emailSignup', { full_name, email, password }),

  // Password
  forgotPassword: (email) =>
    request('forgotPassword', { email }),

  // Version check
  latestVersion: () =>
    request('latestVersion', { platform: 'Windows' }),

  // Speed test
  runSpeedTest: (token, device_id) =>
    request('runSpeedTest', { device_id }, token),

  // DNS filtering — fetch blocklist from VoxShield client config
  getDnsConfig: async (token) => {
    try {
      // Try fetching the user's client DNS filter configuration
      const res = await fetch(`${BASE}/getDnsFilterConfig`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);
      return data;
    } catch {
      // Fallback: built-in malware + phishing blocklist
      return {
        categories: { block_malware: true, block_phishing: true, block_adult: false, block_gambling: false, block_social_media: false, block_streaming: false },
        blocklist: [
          'malware-c2.evil.com', 'phishing-login.fake-bank.com', 'suspicious-download.xyz',
          'trojan-download.net', 'phishing-portal.fake.com', 'malware-payload.malicious.org',
        ],
      };
    }
  },

  // Security logging — send events to VoxShield backend
  logSecurityEvent: (token, event_type, message, severity = 'info', device_name = null) => {
    if (!token) return Promise.resolve();
    return fetch(`${BASE}/logSecurityEvent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ event_type, message, severity, device_name }),
    }).catch(() => {});
  },

  // Installer URL (fallback)
  INSTALLER_URL: 'https://voxvpn.net/download',
};