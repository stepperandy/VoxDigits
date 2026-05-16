import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const { device_id, revoke_all } = await req.json().catch(() => ({}));

    // Get user's subscription
    const subs = await base44.entities.VPNSubscription.filter({ user_email: user.email });
    const activeSub = subs.find(s => ['active', 'trial'].includes(s.status)) || null;

    if (!activeSub) {
      return new Response(JSON.stringify({ success: false, error: 'No active subscription.' }), { status: 404, headers: corsHeaders });
    }

    const devices = await base44.entities.LinkedDevice.filter({
      subscription_id: activeSub.id,
      status: 'active',
    });

    if (revoke_all) {
      // Revoke ALL linked devices
      await Promise.all(devices.map(d =>
        base44.entities.LinkedDevice.update(d.id, { status: 'inactive' })
      ));
      return new Response(JSON.stringify({
        success: true,
        message: `All ${devices.length} device session(s) revoked.`,
        revoked_count: devices.length,
      }), { status: 200, headers: corsHeaders });
    }

    if (!device_id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Provide device_id to revoke a specific device, or revoke_all: true to revoke all.',
      }), { status: 400, headers: corsHeaders });
    }

    // Revoke a specific device by device_id fingerprint
    const target = devices.find(d => d.device_id === device_id || d.id === device_id);
    if (!target) {
      return new Response(JSON.stringify({ success: false, error: 'Device not found.' }), { status: 404, headers: corsHeaders });
    }

    await base44.entities.LinkedDevice.update(target.id, { status: 'inactive' });

    return new Response(JSON.stringify({
      success: true,
      message: `Device "${target.device_name}" session revoked.`,
      revoked_device: {
        id: target.id,
        device_name: target.device_name,
        device_type: target.device_type,
      },
    }), { status: 200, headers: corsHeaders });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: corsHeaders });
  }
});