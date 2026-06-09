import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Admin-only: generate a signed URL for a private file URI (for testing in admin panel)
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
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403, headers: corsHeaders });
    }

    const { file_uri } = await req.json();
    if (!file_uri) return Response.json({ error: 'file_uri required' }, { status: 400, headers: corsHeaders });

    const result = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
      file_uri,
      expires_in: 300,
    });

    return Response.json({ signed_url: result.signed_url }, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});