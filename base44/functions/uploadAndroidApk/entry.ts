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
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403, headers: corsHeaders });
    }

    // Fetch APK from GitHub releases (use GET to follow redirects)
    const apkUrl = 'https://github.com/Vauth/vox/releases/download/v1.2/Vox-Windows-x64.exe';
    const apkRes = await fetch(apkUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'User-Agent': 'VoxVPN-Uploader/1.0' },
    });
    
    if (!apkRes.ok) {
      return Response.json({ 
        error: 'Failed to fetch APK from GitHub', 
        status: apkRes.status 
      }, { status: 502, headers: corsHeaders });
    }

    // Get the binary data as ArrayBuffer
    const apkBuffer = await apkRes.arrayBuffer();

    // Upload to Base44 private storage - convert to Blob-like format
    const uploadRes = await base44.asServiceRole.integrations.Core.UploadPrivateFile({
      file: new Blob([apkBuffer], { type: 'application/vnd.android.package-archive' }),
    });

    if (!uploadRes?.file_uri) {
      throw new Error('Upload failed - no file_uri returned');
    }

    // Update the Download entity with the new file_uri
    const downloads = await base44.asServiceRole.entities.Download.filter({ platform: 'Android' });
    const androidDownload = downloads?.[0];

    if (androidDownload) {
      await base44.asServiceRole.entities.Download.update(androidDownload.id, {
        file_url: uploadRes.file_uri,
        notes: '[SECURE] Base44 storage - APK uploaded from voxvpn.net',
        name: 'VoxVPN-V1.0.apk',
        version: '1.0',
      });
    }

    return Response.json({ 
      success: true, 
      file_uri: uploadRes.file_uri,
      message: 'APK uploaded successfully to Base44 storage'
    }, { headers: corsHeaders });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});