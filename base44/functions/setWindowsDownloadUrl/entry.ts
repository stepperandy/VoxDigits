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
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403, headers: corsHeaders });
    }

    const downloadUrl = 'https://github.com/stepperandy/voxvpn/releases/download/v2.0.0/VoxVPN-Setup-v2.0.exe';

    // Get existing Windows download record
    const downloads = await base44.asServiceRole.entities.Download.filter({ platform: 'Windows', is_active: true });
    const existing = downloads?.[0];

    if (existing) {
      // Update existing
      await base44.asServiceRole.entities.Download.update(existing.id, {
        file_url: downloadUrl,
        version: '2.0.0',
        notes: 'GitHub release — direct download',
      });
      return Response.json({ status: 'updated', id: existing.id }, { headers: corsHeaders });
    } else {
      // Create new
      const newRecord = await base44.asServiceRole.entities.Download.create({
        name: 'VoxVPN-Setup-v2.0.exe',
        platform: 'Windows',
        file_url: downloadUrl,
        version: '2.0.0',
        is_active: true,
        is_free: false,
        description: 'VoxVPN Setup for Windows 10/11',
        notes: 'GitHub release — direct download',
      });
      return Response.json({ status: 'created', id: newRecord.id }, { headers: corsHeaders });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});