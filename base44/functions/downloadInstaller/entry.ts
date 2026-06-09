import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let downloadUrl = null;
  let fileName = 'VoxVPN-Setup.exe';

  try {
    const base44 = createClientFromRequest(req);
    const downloads = await base44.asServiceRole.entities.Download.filter({ platform: 'Windows', is_active: true });
    const latest = downloads?.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))?.[0];
    if (latest?.file_url) downloadUrl = latest.file_url;
    if (latest?.name) fileName = latest.name.replace(/[^a-zA-Z0-9.\-_]/g, '_') + '.exe';
  } catch (_) {}

  if (!downloadUrl) {
    downloadUrl = 'https://voxvpn.net/downloads/VoxVPN-Setup-v2.0.exe';
    fileName = 'VoxVPN-Setup-v2.0.exe';
  }

  // Redirect browser directly to the file — CDN serves it natively
  return Response.redirect(downloadUrl, 302);
});