import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const appUrl = Deno.env.get('APP_URL') || 'https://voxvpn.net';

    // Fetch all active and trial subscriptions
    const activeSubscriptions = await base44.asServiceRole.entities.VPNSubscription.filter({ status: 'active' });
    const trialSubscriptions = await base44.asServiceRole.entities.VPNSubscription.filter({ status: 'trial' });
    const subscriptions = [...activeSubscriptions, ...trialSubscriptions];

    const now = new Date();
    let reminded = 0;
    let expired = 0;

    for (const sub of subscriptions) {
      if (!sub.renewal_date || !sub.user_email) continue;

      const renewal = new Date(sub.renewal_date);
      const daysUntilRenewal = Math.ceil((renewal - now) / (1000 * 60 * 60 * 24));

      // ── Auto-expire overdue subscriptions (past renewal date) ──
      if (daysUntilRenewal <= 0) {
        await base44.asServiceRole.entities.VPNSubscription.update(sub.id, { status: 'expired' });
        console.log(`Expired subscription for ${sub.user_email} (was due ${renewal.toDateString()})`);
        expired++;

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: sub.user_email,
          subject: '🔒 Your VoxVPN subscription has expired',
          body: `Hello,

Your VoxVPN ${sub.plan} plan expired on ${renewal.toDateString()}.

Your VPN access has been suspended. To restore access, please renew your subscription:

👉 Renew Now: ${appUrl}/pricing

If you believe this is an error, contact support@voxdigits.com.

The VoxVPN Team`,
        });
        continue;
      }

      // ── Send reminder 3 days before expiry ──
      if (daysUntilRenewal <= 3) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: sub.user_email,
          subject: `⏰ VoxVPN expires in ${daysUntilRenewal} day${daysUntilRenewal !== 1 ? 's' : ''} — renew now`,
          body: `Hello,

Your VoxVPN ${sub.plan} plan expires on ${renewal.toDateString()} (in ${daysUntilRenewal} day${daysUntilRenewal !== 1 ? 's' : ''}).

To keep your VPN access uninterrupted, please renew before it expires:

👉 Renew Now: ${appUrl}/pricing

Plan: ${sub.plan}
Billing: ${sub.billing_cycle === 'yearly' ? 'Yearly' : 'Monthly'}

Questions? Contact support@voxdigits.com

The VoxVPN Team`,
        });

        console.log(`Sent ${daysUntilRenewal}-day expiry reminder to ${sub.user_email}`);
        reminded++;
      }
    }

    return Response.json({ success: true, reminders_sent: reminded, expired_count: expired });
  } catch (error) {
    console.error('Renewal reminder error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});