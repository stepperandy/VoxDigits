import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripe = await import('npm:stripe@14.0.0');
    const stripeClient = new stripe.default(Deno.env.get('STRIPE_SECRET_KEY'));

    // Look up the subscription for the stripe subscription ID
    const subs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: user.email });
    const activeSub = subs.find(s => s.status === 'active');

    let customerId = null;

    // If we have a stripe subscription ID, get the customer from Stripe
    if (activeSub?.stripe_subscription_id) {
      const stripeSub = await stripeClient.subscriptions.retrieve(activeSub.stripe_subscription_id);
      customerId = stripeSub.customer;
    }

    // If no stripe customer found, try to find by email
    if (!customerId) {
      const customers = await stripeClient.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    if (!customerId) {
      return Response.json({ error: 'No Stripe customer found for this account.' }, { status: 404 });
    }

    const session = await stripeClient.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${Deno.env.get('APP_URL')}/dashboard`,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Stripe portal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});