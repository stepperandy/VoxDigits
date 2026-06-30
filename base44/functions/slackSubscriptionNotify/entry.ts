import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);

    const event = body.event;
    const eventType = event?.type; // 'create' or 'update'
    const sub = body.data;
    const oldData = body.old_data;

    if (!sub) {
      return Response.json({ ok: false, reason: 'No subscription data' });
    }

    // ── Determine the notification message ──
    let messageText = null;

    if (eventType === 'create') {
      // New plan signup
      const priceLabel = sub.price != null ? `$${sub.price}` : 'N/A';
      messageText = `🎉 *New Subscription Signup!*\n• Email: ${sub.user_email}\n• Plan: ${sub.plan}\n• Billing: ${sub.billing_cycle || 'N/A'}\n• Price: ${priceLabel}`;
    } else if (eventType === 'update') {
      // Renewal: status returns to active from a non-active state, OR renewal_date is pushed forward
      const becameActive = sub.status === 'active' && oldData?.status !== 'active';
      const renewalExtended = sub.renewal_date && oldData?.renewal_date &&
        new Date(sub.renewal_date) > new Date(oldData.renewal_date);

      if (becameActive || renewalExtended) {
        const priceLabel = sub.price != null ? `$${sub.price}` : 'N/A';
        messageText = `🔄 *Subscription Renewed!*\n• Email: ${sub.user_email}\n• Plan: ${sub.plan}\n• New Renewal: ${sub.renewal_date ? new Date(sub.renewal_date).toLocaleDateString() : 'N/A'}\n• Price: ${priceLabel}`;
      }
    }

    if (!messageText) {
      return Response.json({ ok: true, reason: 'No relevant change' });
    }

    // ── Post to Slack ──
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('slack');

    // Find #general or the first available public channel
    const channelsRes = await fetch('https://slack.com/api/conversations.list?limit=50&exclude_archived=true&types=public_channel', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const channelsData = await channelsRes.json();
    const channel = channelsData.channels?.find((c: any) => c.name === 'general') || channelsData.channels?.[0];

    if (!channel) {
      return Response.json({ ok: false, reason: 'No Slack channel found' });
    }

    const postRes = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel: channel.id, text: messageText }),
    });
    const postData = await postRes.json();

    return Response.json({ ok: postData.ok, channel: channel.name });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});