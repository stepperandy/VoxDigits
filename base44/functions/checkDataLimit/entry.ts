import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Automated per-customer data usage alerts.
// Runs daily via the "Daily Data Limit Email Notifications" scheduled automation.
// For every eSIM: when usage crosses 80% (warning) or 100% (exhausted) of the
// plan's data limit, send one email and record a UsageAlert (dedupe: one alert
// per user + service + threshold, so customers aren't emailed repeatedly).

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const esims = await base44.asServiceRole.entities.ESim.list();

  // Existing alerts, used to avoid duplicate notifications
  const existingAlerts = await base44.asServiceRole.entities.UsageAlert.list();
  const alreadyAlerted = new Set(
    existingAlerts.map(a => `${a.user_email}|${a.service_id}|${a.alert_type}`)
  );

  const notified = [];

  for (const esim of esims) {
    if (esim.status !== 'active' && esim.status !== 'pending') continue;
    const limitGb = esim.data_gb || 0;
    const usedGb = esim.data_used_gb || 0;
    if (!limitGb || !esim.user_email || !esim.iccid) continue;

    const usagePct = (usedGb / limitGb) * 100;
    const alertType = usagePct >= 100 ? 'data_100' : usagePct >= 80 ? 'data_80' : null;
    if (!alertType) continue;

    const dedupeKey = `${esim.user_email}|${esim.iccid}|${alertType}`;
    if (alreadyAlerted.has(dedupeKey)) continue;

    const serviceName = esim.product_name || `eSIM ${esim.iccid}`;

    if (alertType === 'data_100') {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: esim.user_email,
        subject: `🚨 VoxVPN: Your ${serviceName} data is used up`,
        body: `
Hi there,

You've used 100% of the data on your ${serviceName} (${usedGb.toFixed(1)} GB of ${limitGb} GB).

Your eSIM data is now exhausted. To keep browsing, purchase a new data package from your VoxVPN dashboard.

Stay connected,
The VoxVPN Team
        `.trim(),
      });
    } else {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: esim.user_email,
        subject: `⚠️ VoxVPN: You've used ${Math.round(usagePct)}% of your ${serviceName} data`,
        body: `
Hi there,

You've used ${Math.round(usagePct)}% of the data on your ${serviceName}:
Current usage: ${usedGb.toFixed(1)} GB / ${limitGb} GB

To avoid running out, top up your data package from your VoxVPN dashboard.

Stay connected,
The VoxVPN Team
        `.trim(),
      });
    }

    await base44.asServiceRole.entities.UsageAlert.create({
      user_email: esim.user_email,
      alert_type: alertType,
      service_id: esim.iccid,
      service_name: serviceName,
      current_usage: usedGb,
      limit: limitGb,
      percentage: Math.round(usagePct),
      email_sent: true,
    });

    notified.push({ email: esim.user_email, service: serviceName, type: alertType, pct: Math.round(usagePct) });
  }

  return Response.json({ notified, count: notified.length });
});