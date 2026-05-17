import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * recoverPaidUser — Admin tool to manually provision a user who paid but didn't get setup.
 * Also used by Hubtel payment callback since Hubtel has no webhook.
 * Body: { email, plan, billing_cycle? }
 */

const PLAN_DEVICES = {
  'Basic': 1, 'Standard': 3, 'Premium': 5, 'Advanced': 10, 'Enterprise': 999,
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { email, plan, billing_cycle } = body;

    if (!email || !plan) {
      return Response.json({ error: 'email and plan are required' }, { status: 400 });
    }

    const billingCycle = billing_cycle || 'monthly';
    const renewalDate = new Date();
    if (billingCycle === 'yearly') {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    } else {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    }

    // 1. Create or update subscription record
    const subs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: email });
    const existing = subs?.find(s => s.status === 'active') || subs?.[0];

    if (existing) {
      await base44.asServiceRole.entities.VPNSubscription.update(existing.id, {
        plan,
        status: 'active',
        billing_cycle: billingCycle,
        renewal_date: renewalDate.toISOString(),
        max_devices: PLAN_DEVICES[plan] || 1,
        start_date: existing.start_date || new Date().toISOString(),
      });
      console.log(`Updated subscription for ${email}: ${plan}`);
    } else {
      await base44.asServiceRole.entities.VPNSubscription.create({
        user_email: email,
        plan,
        status: 'active',
        billing_cycle: billingCycle,
        renewal_date: renewalDate.toISOString(),
        start_date: new Date().toISOString(),
        max_devices: PLAN_DEVICES[plan] || 1,
      });
      console.log(`Created subscription for ${email}: ${plan}`);
    }

    // 2. Provision VPN credentials
    const orderId = `manual-recovery-${Date.now()}`;
    const provisionRes = await base44.asServiceRole.functions.invoke('provisionVpnUser', {
      email,
      plan,
      orderId,
      platform: 'windows',
      deviceName: 'Windows Device',
    });

    const provisionData = provisionRes?.data || {};

    // 3. Send setup email
    await base44.asServiceRole.functions.invoke('sendBuyerSetups', {
      email,
      orderId,
      plan,
      serverRegion: provisionData.serverRegion || 'Auto-selected',
      vpnIp: provisionData.vpnIp || 'Assigned',
      configUrl: provisionData.configUrl || null,
      dashboardUrl: `${Deno.env.get('APP_URL')}/dashboard`,
    });

    return Response.json({
      success: true,
      message: `Subscription provisioned and setup email sent to ${email}`,
      plan,
      billing_cycle: billingCycle,
    });

  } catch (error) {
    console.error('recoverPaidUser error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});