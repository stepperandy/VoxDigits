import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const stripe = await import('npm:stripe@14.0.0');
    const stripeClient = new stripe.default(Deno.env.get('STRIPE_SECRET_KEY'));

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return Response.json({ error: 'Missing signature' }, { status: 400 });
    }

    const event = await stripeClient.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { plan, user_id, email } = session.metadata || {};

      // Generate a secure setup token (in production, store in DB)
      const setupToken = crypto.randomUUID();

      // Send welcome email with setup link
      await base44.functions.invoke('sendWelcomeEmail', {
        email: email || session.customer_email,
        orderId: session.id,
        setupToken: setupToken,
      });

      // In production: Create Download records in Base44 for this user
      // and store the setupToken mapping for later retrieval
    }

    return Response.json({ received: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});