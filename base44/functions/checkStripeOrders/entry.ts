import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Plan → max devices mapping
const PLAN_DEVICES = {
  'Basic': 1,
  'Standard': 3,
  'Premium': 5,
  'Advanced': 10,
  'Enterprise': 999,
};

async function syncSubscription(base44, customerEmail, plan, stripeSubscriptionId, status, billingCycle) {
  const subs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: customerEmail });
  const existing = subs.find(s => s.stripe_subscription_id === stripeSubscriptionId) || subs[0];

  const renewalDate = new Date();
  if (billingCycle === 'yearly') {
    renewalDate.setFullYear(renewalDate.getFullYear() + 1);
  } else {
    renewalDate.setMonth(renewalDate.getMonth() + 1);
  }

  const subData = {
    user_email: customerEmail,
    plan: plan || existing?.plan || 'Basic',
    status: status,
    billing_cycle: billingCycle || existing?.billing_cycle || 'monthly',
    stripe_subscription_id: stripeSubscriptionId,
    renewal_date: renewalDate.toISOString(),
    max_devices: PLAN_DEVICES[plan || existing?.plan || 'Basic'] || 1,
    price: 0,
  };

  if (existing) {
    await base44.asServiceRole.entities.VPNSubscription.update(existing.id, subData);
    console.log(`Updated subscription for ${customerEmail}: ${status}`);
  } else {
    await base44.asServiceRole.entities.VPNSubscription.create(subData);
    console.log(`Created subscription for ${customerEmail}: ${status}`);
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const stripe = await import('npm:stripe@14.0.0');
    const stripeClient = new stripe.default(Deno.env.get('STRIPE_SECRET_KEY'));

    // Poll for recent checkout sessions (last hour)
    const oneHourAgo = Math.floor(Date.now() / 1000) - 3600;
    const sessions = await stripeClient.checkout.sessions.list({
      limit: 100,
      created: { gte: oneHourAgo },
      status: 'complete',
    });

    console.log(`Checking ${sessions.data.length} recent checkout sessions`);

    for (const session of sessions.data) {
      const { plan, billing, email } = session.metadata || {};
      const customerEmail = email || session.customer_email;

      if (!customerEmail) {
        console.warn(`Skipping session ${session.id}: no email`);
        continue;
      }

      try {
        // Sync subscription record
        await syncSubscription(
          base44,
          customerEmail,
          plan,
          session.subscription,
          'active',
          billing || 'monthly'
        );

        // Provision VPN credentials
        const provisionRes = await base44.asServiceRole.functions.invoke('provisionVpnUser', {
          email: customerEmail,
          plan: plan || 'Basic',
          orderId: session.id,
          platform: 'windows',
          deviceName: 'Windows Device',
        });

        const provisionData = provisionRes?.data || {};

        // Send setup email
        await base44.asServiceRole.functions.invoke('sendBuyerSetups', {
          email: customerEmail,
          orderId: session.id,
          plan: plan || 'Basic',
          serverRegion: provisionData.serverRegion || 'Auto-selected',
          vpnIp: provisionData.vpnIp || 'Assigned',
          configUrl: provisionData.configUrl || null,
        });

        console.log(`Processed session ${session.id} for ${customerEmail}`);
      } catch (err) {
        console.error(`Error processing session ${session.id}:`, err.message);
      }
    }

    return Response.json({ processed: sessions.data.length });
  } catch (error) {
    console.error('Check Stripe Orders error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});