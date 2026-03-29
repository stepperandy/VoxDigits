import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import QRCode from 'npm:qrcode@1.5.3';

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const token = url.pathname.split('/').pop();
    const os = url.searchParams.get('os');

    if (!token || !os) {
      return Response.json({ error: 'Missing token or OS' }, { status: 400 });
    }

    // Get config data using the token
    const setupRes = await fetch(`${Deno.env.get('APP_URL')}/api/setup/portal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    if (!setupRes.ok) {
      return Response.json({ error: 'Invalid token' }, { status: 404 });
    }

    const setupData = await setupRes.json();
    const profile = (setupData.profiles || []).find(p => p.os === os);

    if (!profile) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Generate QR code pointing to the setup portal with token
    const setupUrl = `${Deno.env.get('APP_URL')}/setup?token=${token}&os=${os}`;
    const qrImage = await QRCode.toDataURL(setupUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2,
    });

    // Convert data URL to binary
    const base64 = qrImage.split(',')[1];
    const binary = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

    return new Response(binary, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});