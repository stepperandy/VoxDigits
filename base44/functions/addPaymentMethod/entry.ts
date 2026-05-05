import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * addPaymentMethod — add new payment method (card, bank account, etc)
 * Body: { payment_method_id, type, last_digits?, expiry? }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { payment_method_id, type, last_digits, expiry } = body;

    if (!payment_method_id || !type) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Store payment method
    const paymentMethods = user.payment_methods || [];
    paymentMethods.push({
      id: `pm_${Date.now()}`,
      stripe_id: payment_method_id,
      type,
      last_digits,
      expiry,
      created_at: new Date().toISOString(),
      is_default: paymentMethods.length === 0,
    });

    await base44.auth.updateMe({ payment_methods: paymentMethods });

    return Response.json({
      success: true,
      payment_method: paymentMethods[paymentMethods.length - 1],
    });
  } catch (error) {
    console.error('addPaymentMethod error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});