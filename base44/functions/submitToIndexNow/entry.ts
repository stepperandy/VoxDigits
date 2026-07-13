import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const INDEXNOW_KEY = 'b3e7f9a2c4d8401e9f6b2a5d8c3e7f9a';
const INDEXNOW_HOST = 'voxvpn.net';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { urls } = body;

    if (!Array.isArray(urls) || urls.length === 0) {
      return Response.json({ error: 'urls array is required' }, { status: 400 });
    }

    // Limit to 10,000 URLs per IndexNow spec
    const urlList = urls.slice(0, 10000).map((u) => {
      if (u.startsWith('http')) return u;
      return `https://${INDEXNOW_HOST}${u.startsWith('/') ? '' : '/'}${u}`;
    });

    const payload = {
      host: INDEXNOW_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${INDEXNOW_HOST}/${INDEXNOW_KEY}.txt`,
      urlList,
    };

    // Submit to all IndexNow-partner endpoints in parallel
    const endpoints = [
      'https://api.indexnow.org/indexnow',
      'https://www.bing.com/indexnow',
      'https://yandex.com/indexnow',
      'https://searchadvisor.naver.com/indexnow',
      'https://searchseznam.cz/indexnow',
    ];

    const results = await Promise.all(
      endpoints.map(async (endpoint) => {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify(payload),
          });
          return { endpoint, status: res.status, ok: res.ok };
        } catch (err) {
          return { endpoint, status: 0, ok: false, error: err.message };
        }
      })
    );

    return Response.json({
      submitted: urlList.length,
      key: INDEXNOW_KEY,
      keyLocation: payload.keyLocation,
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});