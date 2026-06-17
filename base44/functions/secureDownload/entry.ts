import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const base44 = createClientFromRequest(req);

    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    // Parse platform from request body
    const body = await req.json().catch(() => ({}));
    const platform = body.platform || 'Windows'; // 'Windows' or 'Android'

    // For non-admins, verify active subscription with expiry timer
    if (user.role !== 'admin') {
      const subs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: user.email });
      const active = subs?.find(s => ['active', 'trial'].includes(s.status));

      if (!active) {
        return Response.json({ error: 'No active subscription. Please purchase a VoxVPN plan to download.' }, { status: 403, headers: corsHeaders });
      }

      // Enforce subscription timer — block if renewal_date has passed
      if (active.renewal_date && new Date(active.renewal_date) < new Date()) {
        // Mark it expired
        await base44.asServiceRole.entities.VPNSubscription.update(active.id, { status: 'expired' });
        return Response.json({
          error: `Your subscription expired on ${new Date(active.renewal_date).toLocaleDateString()}. Please renew to continue downloading.`,
          expired: true,
          renewal_date: active.renewal_date,
        }, { status: 403, headers: corsHeaders });
      }
    }

    // Get the latest active download entry for this platform
    const downloads = await base44.asServiceRole.entities.Download.filter({
      platform,
      is_active: true,
    });

    // Prefer entries with [SECURE] notes (uploaded to private storage), fall back to any
    const sorted = downloads?.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    const secureEntry = sorted?.find(d => d.notes?.startsWith('[SECURE]')) || sorted?.[0];

    if (!secureEntry?.file_url) {
      return Response.json({ error: 'No installer available' }, { status: 404, headers: corsHeaders });
    }

    const fileUri = secureEntry.file_url;

    const originalName = secureEntry.name || (platform === 'Android' ? 'VoxVPN.apk' : 'VoxVPN-Setup.exe');

    // If it's a private URI (not http), generate a signed URL and return it with filename
    if (!fileUri.startsWith('http')) {
      const signed = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
        file_uri: fileUri,
        expires_in: 300,
      });
      return Response.json({
        url: signed.signed_url,
        filename: originalName,
        version: secureEntry.version,
        expires_in: 300,
      }, { headers: corsHeaders });
    }

    // External URL (GitHub, etc.) — return it directly with proper filename
    return Response.json({
      url: fileUri,
      filename: originalName,
      version: secureEntry.version,
    }, { headers: corsHeaders });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});