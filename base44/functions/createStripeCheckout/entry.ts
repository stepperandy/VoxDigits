import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { plan, priceId } = body;

    if (!plan || !priceId) {
      return Response.json({ error: 'Missing plan or priceId' }, { status: 400 });
    }

    const stripe = await import('npm:stripe@14.0.0');
    const stripeClient = new stripe.default(Deno.env.get('STRIPE_SECRET_KEY'));

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${Deno.env.get('APP_URL')}/setup?token={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get('APP_URL')}/#pricing`,
      customer_email: user.email,
      metadata: {
        plan: plan,
        user_id: user.id,
        email: user.email,
      },
    });

    return Response.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});