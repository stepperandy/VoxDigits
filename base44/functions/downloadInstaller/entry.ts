import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const base44 = createClientFromRequest(req);

    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.redirect('https://voxvpn.net/vpn-login', 302);
    }

    // Non-admins must have an active subscription
    if (user.role !== 'admin') {
      const subs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: user.email });
      const active = subs?.find(s => ['active', 'trial'].includes(s.status));
      if (!active) {
        return Response.redirect('https://voxvpn.net/pricing', 302);
      }
    }

    // Find the latest active Windows installer
    const downloads = await base44.asServiceRole.entities.Download.filter({ platform: 'Windows', is_active: true });
    const sorted = downloads?.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    const entry = sorted?.find(d => d.notes?.startsWith('[SECURE]')) || sorted?.[0];

    let downloadUrl = 'https://voxvpn.net/downloads/VoxVPN-Setup-v2.0.exe';

    if (entry?.file_url) {
      const fileUri = entry.file_url;
      if (!fileUri.startsWith('http')) {
        // Private file — generate signed URL
        const signed = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
          file_uri: fileUri,
          expires_in: 300,
        });
        downloadUrl = signed.signed_url;
      } else {
        downloadUrl = fileUri;
      }
    }

    return Response.redirect(downloadUrl, 302);
  } catch (error) {
    // Fallback to known URL on error
    return Response.redirect('https://voxvpn.net/downloads/VoxVPN-Setup-v2.0.exe', 302);
  }
});