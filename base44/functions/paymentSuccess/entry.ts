import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PLAN_DEVICES = {
  'Basic': 1, 'Standard': 3, 'Premium': 5, 'Advanced': 10, 'Enterprise': 999,
  'Free Trial': 1, 'Pro Monthly': 3, 'Pro Annual': 5,
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, plan, billing_cycle } = await req.json();

    if (!email || !plan) {
      return Response.json({ success: false, message: 'Missing email or plan' }, { status: 400 });
    }

    const billingCycle = billing_cycle || 'monthly';
    const renewalDate = new Date();
    if (billingCycle === 'yearly') {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    } else {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    }

    const existing = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: email });
    const existingSub = existing?.[0] || null;

    // If user had a pending_payment trial, activate it (5-day trial starts now on first payment)
    const isFirstPaymentOnTrial = existingSub?.status === 'pending_payment' && existingSub?.plan === 'Free Trial';
    const trialRenewalDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

    const subData = {
      plan,
      status: isFirstPaymentOnTrial ? 'trial' : 'active',
      billing_cycle: isFirstPaymentOnTrial ? 'trial' : billingCycle,
      renewal_date: isFirstPaymentOnTrial ? trialRenewalDate.toISOString() : renewalDate.toISOString(),
      max_devices: PLAN_DEVICES[plan] || 1,
      start_date: existingSub?.start_date || new Date().toISOString(),
    };

    if (existingSub) {
      await base44.asServiceRole.entities.VPNSubscription.update(existingSub.id, subData);
    } else {
      await base44.asServiceRole.entities.VPNSubscription.create({ user_email: email, ...subData });
    }

    // ── Renewal-confirmation email ──
    // Sent only when an existing subscription is renewed (not a first-time trial activation).
    // Covers business clients who renew through the explicit payment-success path.
    const isRenewal = existingSub && !isFirstPaymentOnTrial;
    if (isRenewal) {
      const appUrl = Deno.env.get('APP_URL') || 'https://voxvpn.net';
      const cycleLabel = billingCycle === 'yearly' ? '1 year' : '1 month';
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject: '✅ Your VoxShield subscription has been renewed',
          body: `Hello,

Your VoxShield ${plan} plan has been successfully renewed. Your team's VPN, antivirus, and DNS filtering protection continue without interruption.

Plan: ${plan}
Billing cycle: ${billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}
Next renewal: in ${cycleLabel}

👉 Manage your team: ${appUrl}/business/dashboard

If you have any questions, contact support@voxdigits.com.

Thank you for protecting your team with VoxShield,

The VoxShield Team`,
        });
        console.log(`Renewal confirmation email sent to ${email}`);
      } catch (emailErr) {
        console.error('Renewal email failed:', emailErr.message);
      }
    }

    return Response.json({ success: true, message: 'User activated', plan });

  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
});