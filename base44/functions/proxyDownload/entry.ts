import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });

    const body = await req.json().catch(() => ({}));
    const { url, filename } = body;

    if (!url) return Response.json({ error: 'No URL provided' }, { status: 400, headers: corsHeaders });

    const fileRes = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      redirect: 'follow',
    });

    if (!fileRes.ok) {
      return Response.json({ error: `Upstream fetch failed: ${fileRes.status}` }, { status: 502, headers: corsHeaders });
    }

    const contentType = fileRes.headers.get('content-type') || 'application/octet-stream';
    const safeFilename = filename || 'VoxVPN-installer';

    return new Response(fileRes.body, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
      },
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
});