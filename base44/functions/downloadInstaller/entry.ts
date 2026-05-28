import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Get download URL from DB, fallback to default
  let downloadUrl = 'https://github.com/stepperandy/voxvpn/releases/download/v2.0.0/VoxVPN-Setup-v2.0.exe';

  try {
    const base44 = createClientFromRequest(req);
    const downloads = await base44.asServiceRole.entities.Download.filter({ platform: 'Windows', is_active: true });
    const latest = downloads?.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))?.[0];
    if (latest?.file_url) downloadUrl = latest.file_url;
  } catch (_) {}

  // Fetch with browser-like headers so GitHub/CDN serves the file
  const fileRes = await fetch(downloadUrl, {
    redirect: 'follow',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/octet-stream,*/*',
    },
  });

  if (!fileRes.ok) {
    return Response.json({ error: 'File not available', status: fileRes.status }, { status: 502 });
  }

  return new Response(fileRes.body, {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename="VoxVPN-Setup-v2.0.exe"',
    },
  });
});