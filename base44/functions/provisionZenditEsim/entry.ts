import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { email, plan, orderId } = body;

    if (!email || !plan || !orderId) {
      return Response.json({ error: 'Missing email, plan, or orderId' }, { status: 400 });
    }

    const zenditApiKey = Deno.env.get('ZENDIT_API_KEY');
    if (!zenditApiKey) {
      console.error('ZENDIT_API_KEY not set');
      return Response.json({ error: 'Zendit not configured' }, { status: 500 });
    }

    // Call Zendit API to provision eSIM
    const zenditRes = await fetch('https://api.zendit.io/v1/esim/provision', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${zenditApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_email: email,
        plan: plan,
        order_id: orderId,
        auto_activate: true,
      }),
    });

    if (!zenditRes.ok) {
      const zenditError = await zenditRes.text();
      console.error('Zendit API error:', zenditError);
      return Response.json({ error: 'Zendit provisioning failed' }, { status: 500 });
    }

    const zenditData = await zenditRes.json();

    // Log provisioning in database for tracking
    try {
      await base44.asServiceRole.entities.ZenditEsimOrder.create({
        user_email: email,
        order_id: orderId,
        plan: plan,
        zendit_order_id: zenditData.order_id || null,
        zendit_iccid: zenditData.iccid || null,
        status: 'provisioned',
        provisioned_at: new Date().toISOString(),
      });
    } catch (dbErr) {
      console.warn('Could not log Zendit order:', dbErr.message);
    }

    // Send eSIM activation email to user
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: '📱 Your VoxZen eSIM is ready!',
        body: `Your VoxZen eSIM has been provisioned and is ready to activate.\n\nICCID: ${zenditData.iccid || 'N/A'}\nOrder ID: ${zenditData.order_id || orderId}\n\nVisit your account to download your eSIM profile and get connected.`,
      });
    } catch (emailErr) {
      console.warn('Could not send eSIM email:', emailErr.message);
    }

    return Response.json({
      success: true,
      zendit_order_id: zenditData.order_id,
      iccid: zenditData.iccid,
    });
  } catch (error) {
    console.error('Zendit provisioning error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});