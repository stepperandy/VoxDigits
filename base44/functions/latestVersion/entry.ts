import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * latestVersion — returns the latest desktop app version info.
 * V2.0.0 is the current production release (replaces V1.5).
 * Download is served via GitHub Releases.
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

const V2_RELEASE = {
  version: '2.0.0',
  name: 'VoxVPN Desktop V2.0',
  description: 'VoxVPN Desktop V2.0 — Direct Base44 authentication, OS-encrypted token storage, heartbeat enforcement.',
  download_url: 'https://github.com/stepperandy/voxvpn/releases/download/v2.0.0/VoxVPN-Setup-v2.0.exe',
  released_at: '2026-05-17T00:00:00.000Z',
  platform: 'Windows',
  is_free: false,
  mandatory: true,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  try {
    const base44 = createClientFromRequest(req);

    // platform can come from query param or body
    const url = new URL(req.url);
    let platform = url.searchParams.get('platform');
    if (!platform && req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      platform = body.platform;
    }
    platform = platform || 'Windows';

    // Try to find an active Download record override first
    const downloads = await base44.asServiceRole.entities.Download.filter({
      platform,
      is_active: true,
    });

    if (downloads && downloads.length > 0) {
      const latest = downloads.sort((a, b) =>
        new Date(b.updated_date) - new Date(a.updated_date)
      )[0];

      return new Response(JSON.stringify({
        success: true,
        platform: latest.platform,
        version: latest.version || V2_RELEASE.version,
        name: latest.name,
        description: latest.description,
        download_url: latest.file_url || V2_RELEASE.download_url,
        mandatory: latest.notes?.includes('mandatory') || V2_RELEASE.mandatory,
        is_free: latest.is_free,
        price: latest.price,
        payment_link: latest.payment_link || null,
        released_at: latest.updated_date,
      }), { status: 200, headers: CORS });
    }

    // Fallback: return hardcoded V2.0 release
    return new Response(JSON.stringify({
      success: true,
      ...V2_RELEASE,
    }), { status: 200, headers: CORS });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500, headers: CORS });
  }
});