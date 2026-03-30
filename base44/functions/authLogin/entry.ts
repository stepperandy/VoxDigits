import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, password } = await req.json().catch(() => ({}));

    if (!email || !password) {
      return Response.json({ error: 'Missing email or password' }, { status: 400 });
    }

    // Authenticate via Base44 auth
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check for active subscription
    const subs = await base44.entities.VPNSubscription.filter({ user_email: user.email });
    const activeSub = subs.find(s => s.status === 'active') || null;

    return Response.json({
      success: true,
      token: req.headers.get('authorization')?.replace('Bearer ', '') || '',
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        role: user.role,
      },
      subscription: activeSub ? {
        plan: activeSub.plan,
        status: activeSub.status,
        renewal_date: activeSub.renewal_date,
        max_devices: activeSub.max_devices,
      } : null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});