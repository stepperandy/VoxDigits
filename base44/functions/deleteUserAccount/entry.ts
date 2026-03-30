import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Cancel Stripe subscription if one exists
    const subscriptions = await base44.asServiceRole.entities.VPNSubscription.filter({
      user_email: user.email,
    });

    if (subscriptions.length > 0) {
      const sub = subscriptions[0];

      if (sub.stripe_subscription_id) {
        const stripe = await import('npm:stripe@14.0.0');
        const stripeClient = new stripe.default(Deno.env.get('STRIPE_SECRET_KEY'));
        await stripeClient.subscriptions.cancel(sub.stripe_subscription_id);
      }

      // Delete subscription record
      await base44.asServiceRole.entities.VPNSubscription.delete(sub.id);
    }

    // Delete linked devices
    const devices = await base44.asServiceRole.entities.LinkedDevice.filter({
      subscription_id: subscriptions[0]?.id,
    });
    for (const device of devices) {
      await base44.asServiceRole.entities.LinkedDevice.delete(device.id);
    }

    // Delete user record
    await base44.asServiceRole.entities.User.delete(user.id);

    return Response.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});