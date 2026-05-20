import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * expireSubscriptions — runs daily via scheduled automation.
 * Finds all active/trial subscriptions whose renewal_date has passed
 * and marks them as 'expired', disconnecting linked devices.
 */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  try {
    const base44 = createClientFromRequest(req);

    // Allow admin users or scheduled automation (no auth header)
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403, headers: CORS });
    }

    const now = new Date();

    // Fetch all active and trial subscriptions
    const activeSubs = await base44.asServiceRole.entities.VPNSubscription.filter({ status: 'active' });
    const trialSubs = await base44.asServiceRole.entities.VPNSubscription.filter({ status: 'trial' });
    const allSubs = [...activeSubs, ...trialSubs];

    let expiredCount = 0;
    let devicesDeactivated = 0;

    for (const sub of allSubs) {
      if (!sub.renewal_date) continue;
      const renewalDate = new Date(sub.renewal_date);
      if (renewalDate < now) {
        // Mark subscription expired
        await base44.asServiceRole.entities.VPNSubscription.update(sub.id, { status: 'expired' });
        expiredCount++;
        console.log(`[expireSubscriptions] expired sub id=${sub.id} user=${sub.user_email} renewal_date=${sub.renewal_date}`);

        // Deactivate all linked devices for this subscription
        const devices = await base44.asServiceRole.entities.LinkedDevice.filter({ subscription_id: sub.id });
        for (const device of devices) {
          if (device.status === 'active') {
            await base44.asServiceRole.entities.LinkedDevice.update(device.id, { status: 'inactive' });
            devicesDeactivated++;
          }
        }
      }
    }

    console.log(`[expireSubscriptions] done. expired=${expiredCount} devices_deactivated=${devicesDeactivated}`);

    return Response.json({
      success: true,
      expired_subscriptions: expiredCount,
      devices_deactivated: devicesDeactivated,
      checked_at: now.toISOString(),
    }, { headers: CORS });

  } catch (error) {
    console.error('[expireSubscriptions] error:', error.message);
    return Response.json({ success: false, error: error.message }, { status: 500, headers: CORS });
  }
});