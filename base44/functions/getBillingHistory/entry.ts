import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * getBillingHistory — get user's invoices and transactions
 * Returns: { invoices: [], total_spent, next_billing_date }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get subscription
    const subs = await base44.entities.VPNSubscription.filter({ user_email: user.email }, '-created_date', 1);
    if (!subs?.[0]) {
      return Response.json({ invoices: [], total_spent: 0 });
    }

    const sub = subs[0];

    // Simulate invoices (in production, fetch from Stripe)
    const invoices = [];
    const now = new Date();

    // Generate last 12 months of invoices
    for (let i = 0; i < 12; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);

      invoices.push({
        id: `inv_${date.getTime()}`,
        date: date.toISOString(),
        amount: sub.price || 9.99,
        currency: 'USD',
        status: 'paid',
        plan: sub.plan,
        download_url: `/invoices/inv_${date.getTime()}.pdf`,
      });
    }

    const totalSpent = invoices.reduce((sum, inv) => sum + inv.amount, 0);

    return Response.json({
      invoices: invoices.slice(0, 6), // Last 6 months
      total_spent: totalSpent,
      next_billing_date: sub.renewal_date,
      subscription: {
        plan: sub.plan,
        billing_cycle: sub.billing_cycle,
        price: sub.price,
      },
    });
  } catch (error) {
    console.error('getBillingHistory error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});