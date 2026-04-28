import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const DATA_LIMIT_GB = 50; // default monthly limit per user

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const subscriptions = await base44.asServiceRole.entities.VPNSubscription.filter({ status: 'active' });

  const notified = [];

  for (const sub of subscriptions) {
    const servers = await base44.asServiceRole.entities.VPNServer.list();
    const totalBandwidth = servers.reduce((sum, s) => sum + (s.bandwidth_used_gb || 0), 0);

    // Use a per-subscription threshold based on plan
    const limits = {
      Basic: 30,
      Standard: 75,
      Premium: 150,
      Advanced: 300,
      Enterprise: 1000,
    };
    const limit = limits[sub.plan] || DATA_LIMIT_GB;
    const usagePct = (totalBandwidth / limit) * 100;

    if (usagePct >= 90) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: sub.user_email,
        subject: `⚠️ VoxVPN: You've used ${Math.round(usagePct)}% of your data limit`,
        body: `
Hi there,

You've used approximately ${Math.round(usagePct)}% of your monthly data allowance on your VoxVPN ${sub.plan} plan.

Current usage: ${totalBandwidth.toFixed(1)} GB / ${limit} GB

To avoid service interruption, consider upgrading your plan at https://voxvpn.net/#pricing

Stay protected,
The VoxVPN Team
        `.trim(),
      });
      notified.push(sub.user_email);
    }
  }

  return Response.json({ notified, count: notified.length });
});