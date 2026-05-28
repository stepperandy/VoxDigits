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

  // Redirect directly to the download URL — avoids server-side proxy issues with GitHub CDN
  return new Response(null, {
    status: 302,
    headers: {
      ...corsHeaders,
      'Location': downloadUrl,
    },
  });
});