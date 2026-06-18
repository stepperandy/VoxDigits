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
    const { platform } = body;

    if (!platform) return Response.json({ error: 'No platform specified' }, { status: 400, headers: corsHeaders });

    // Verify subscription (non-admins)
    if (user.role !== 'admin') {
      const subs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: user.email });
      const active = subs?.find(s => ['active', 'trial'].includes(s.status));
      if (!active) {
        return Response.json({ error: 'No active subscription.' }, { status: 403, headers: corsHeaders });
      }
      if (active.renewal_date && new Date(active.renewal_date) < new Date()) {
        await base44.asServiceRole.entities.VPNSubscription.update(active.id, { status: 'expired' });
        return Response.json({ error: 'Subscription expired.', expired: true }, { status: 403, headers: corsHeaders });
      }
    }

    // Fetch the download record
    const downloads = await base44.asServiceRole.entities.Download.filter({ platform, is_active: true });
    const entry = downloads?.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))?.[0];

    if (!entry?.file_url) {
      return Response.json({ error: 'No installer available for this platform.' }, { status: 404, headers: corsHeaders });
    }

    const fileUri = entry.file_url;
    const filename = entry.name || (platform === 'Android' ? 'VoxVPN.apk' : 'VoxVPN-Setup.exe');

    // Private storage URI — generate signed URL then stream
    if (!fileUri.startsWith('http')) {
      const signed = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
        file_uri: fileUri,
        expires_in: 120,
      });
      const fileRes = await fetch(signed.signed_url);
      if (!fileRes.ok) throw new Error(`Storage fetch failed: ${fileRes.status}`);
      const contentType = fileRes.headers.get('content-type') || 'application/octet-stream';
      return new Response(fileRes.body, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    // Public/external URL — fetch and stream (follows redirects)
    const fileRes = await fetch(fileUri, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      redirect: 'follow',
    });
    if (!fileRes.ok) throw new Error(`File fetch failed: ${fileRes.status} — check the file URL in Admin > Downloads`);
    const contentType = fileRes.headers.get('content-type') || 'application/octet-stream';
    return new Response(fileRes.body, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
});