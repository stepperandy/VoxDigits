import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { provisionerUrl, provisionerToken, userId, deviceName } = await req.json();

    if (!provisionerUrl || !provisionerToken) {
      return Response.json(
        { error: 'Missing provisionerUrl or provisionerToken' },
        { status: 400 }
      );
    }

    const response = await fetch(`${provisionerUrl}/api/vpn/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provisionerToken}`,
      },
      body: JSON.stringify({
        userId: userId || user.email,
        deviceName: deviceName || 'device',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return Response.json(
        { error: `Provisioner error: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});