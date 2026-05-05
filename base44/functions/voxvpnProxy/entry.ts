import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const BASE_URL = (Deno.env.get('VOXVPN_API_URL') || 'http://192.168.1.42:5000').replace(/\/$/, '');

// Rate limiting cache
const requestLog = new Map();
const RATE_LIMIT = 100; // requests per minute
const WINDOW = 60000; // 1 minute

function checkRateLimit(key) {
  const now = Date.now();
  const userLog = requestLog.get(key) || [];
  const recentRequests = userLog.filter(t => now - t < WINDOW);
  
  if (recentRequests.length >= RATE_LIMIT) {
    return false;
  }
  
  recentRequests.push(now);
  requestLog.set(key, recentRequests);
  return true;
}

Deno.serve(async (req) => {
  const startTime = Date.now();
  let action = '';
  
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action: reqAction, ...params } = await req.json();
    action = reqAction;

    // Rate limiting check
    if (!checkRateLimit(user.email)) {
      return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Route map: action → { method, path }
    const routes = {
      'health':        { method: 'GET',  path: '/' },
      'servers':       { method: 'GET',  path: '/servers' },
      'auto-fastest':  { method: 'GET',  path: '/auto-fastest' },
      'register':      { method: 'POST', path: '/register' },
      'login':         { method: 'POST', path: '/login' },
      'check-access':  { method: 'POST', path: '/check-access' },
      'connect':       { method: 'POST', path: '/connect' },
      'disconnect':    { method: 'POST', path: '/disconnect' },
    };

    const route = routes[action];
    if (!route) {
      return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    const fetchOptions = {
      method: route.method,
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '1',
        'User-Agent': 'VoxVPN-Backend/1.0',
      },
      signal: AbortSignal.timeout(15000), // 15s timeout
    };

    if (route.method === 'POST') {
      fetchOptions.body = JSON.stringify(params);
    }

    const res = await fetch(`${BASE_URL}${route.path}`, fetchOptions);
    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    // Log slow requests
    const duration = Date.now() - startTime;
    if (duration > 5000) {
      console.warn(`Slow ${action} request: ${duration}ms for ${user.email}`);
    }

    return Response.json(data, { status: res.status });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`VoxVPN proxy error [${action}]: ${error.message} (${duration}ms)`);
    
    // Network timeout
    if (error.name === 'AbortError') {
      return Response.json({ error: 'Request timeout' }, { status: 504 });
    }
    
    return Response.json({ error: error.message }, { status: 500 });
  }
});