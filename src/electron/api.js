const BASE_URL = 'http://localhost:5000';

async function request(method, path, body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || data?.message || `Request failed (${res.status})`);
  return data;
}

export const api = {
  register: (email, password) => request('POST', '/register', { email, password }),
  login:    (email, password) => request('POST', '/login',    { email, password }),
  servers:  ()                => request('GET',  '/servers'),
  connect:  (email, serverId) => request('POST', '/connect',    { user_email: email, server_id: serverId }),
  disconnect:(email)          => request('POST', '/disconnect', { user_email: email }),
};