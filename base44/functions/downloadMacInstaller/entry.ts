import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * macOS Installer Download Redirect
 * Mirrors the Windows downloadInstaller function.
 *
 * Looks up the latest active macOS Download record and redirects
 * to the file URL (generates a signed URL for private files).
 *
 * No auth required — this is a public download endpoint, matching
 * how the Windows installer is served via direct Firebase Storage URL.
 */
Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const base44 = createClientFromRequest(req);

    // Find the latest active macOS installer
    const downloads = await base44.asServiceRole.entities.Download.filter({ platform: 'macOS', is_active: true });
    const sorted = downloads?.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    const entry = sorted?.find(d => d.notes?.startsWith('[SECURE]')) || sorted?.[0];

    // Fallback URL if no record exists yet
    let downloadUrl = 'https://voxvpn.net/downloads';

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
    console.error('downloadMacInstaller error:', error);
    return Response.redirect('https://voxvpn.net/downloads', 302);
  }
});