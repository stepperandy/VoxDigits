// Points to the real VoxVPN backend (same server used by the web app).
// In production Electron builds, replace this with the actual server URL or
// read it from an environment variable / config file bundled with the app.
const BASE_URL = (window.__VOXVPN_API_URL__ || 'http://localhost:5000').replace(/\/$/, '');

async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || data?.message || `Request failed (${res.status})`);
  return data;
}

export const api = {
  // Auth — no token needed
  login:       (email, password)         => request('POST', '/login',        { email, password }),

  // All authenticated calls pass the token
  checkAccess: (token, email)            => request('POST', '/check-access', { user_email: email }, token),
  servers:     (token)                   => request('GET',  '/servers',      null, token),
  connect:     (token, email, serverId)  => request('POST', '/connect',      { user_email: email, server_id: serverId }, token),
  disconnect:  (token, email)            => request('POST', '/disconnect',   { user_email: email }, token),
};