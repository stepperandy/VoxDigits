import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * latestVersion — returns the latest desktop app version info.
 * The active Download record with platform matching the request is returned.
 * Electron app compares its current version and prompts for update if behind.
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
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

    // Fetch latest active download for this platform
    const downloads = await base44.asServiceRole.entities.Download.filter({
      platform,
      is_active: true,
    });

    if (!downloads || downloads.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: `No release found for platform: ${platform}`,
      }), { status: 404, headers: CORS });
    }

    // Pick the most recently updated entry as "latest"
    const latest = downloads.sort((a, b) =>
      new Date(b.updated_date) - new Date(a.updated_date)
    )[0];

    return new Response(JSON.stringify({
      success: true,
      platform: latest.platform,
      version: latest.version || '1.0.0',
      name: latest.name,
      description: latest.description,
      download_url: latest.file_url,
      is_free: latest.is_free,
      price: latest.price,
      payment_link: latest.payment_link || null,
      released_at: latest.updated_date,
    }), { status: 200, headers: CORS });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500, headers: CORS });
  }
});