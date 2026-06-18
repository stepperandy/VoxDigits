import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { platform, status, source, error_message } = body;

    if (!platform || !status) {
      return Response.json({ error: 'platform and status are required' }, { status: 400, headers: corsHeaders });
    }

    // Try to get user email (optional — public page users may not be logged in)
    let user_email = null;
    try {
      const user = await base44.auth.me();
      if (user?.email) user_email = user.email;
    } catch {}

    await base44.asServiceRole.entities.DownloadEvent.create({
      platform,
      status,
      source: source || 'dashboard',
      ...(user_email && { user_email }),
      ...(error_message && { error_message }),
    });

    return Response.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});