import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

const APP_ID = Deno.env.get('BASE44_APP_ID');
const APP_BASE_URL = `https://app--${APP_ID}.base44.app`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { email, password, device_id } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Email and password are required.',
      }), { status: 400, headers: CORS });
    }

    console.log(`[vpnLogin] Login attempt for: ${email}`);

    // Step 1: Authenticate against Base44 auth endpoint
    const authRes = await fetch(`${APP_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const authText = await authRes.text();
    let authData = null;
    try { authData = JSON.parse(authText); } catch {}

    console.log(`[vpnLogin] Auth status: ${authRes.status}, body: ${authText.slice(0, 300)}`);

    if (!authRes.ok) {
      // Return the actual error message from the auth system so we can debug
      const authMsg = authData?.message || authData?.detail || authText.slice(0, 200);
      console.log(`[vpnLogin] Auth failed for ${email}: ${authMsg}`);
      return new Response(JSON.stringify({
        success: false,
        message: authMsg || 'Invalid email or password.',
        debug_status: authRes.status,
      }), { status: 401, headers: CORS });
    }

    const token = authData?.access_token || authData?.token || null;
    if (!token) {
      console.log(`[vpnLogin] Auth OK but no token in response: ${authText.slice(0, 300)}`);
      return new Response(JSON.stringify({
        success: false,
        message: 'Authentication succeeded but no token returned. Please contact support.',
      }), { status: 500, headers: CORS });
    }

    const authUser = authData?.user || null;
    const userEmail = authUser?.email || email;
    console.log(`[vpnLogin] Auth success for ${userEmail}, token obtained`);

    // Step 2: Check subscription
    const subs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: userEmail });
    let activeSub = subs?.find(s => ['active', 'trial'].includes(s.status)) || subs?.[0] || null;

    console.log(`[vpnLogin] Found ${subs?.length || 0} subscriptions for ${userEmail}`);

    // Auto-create pending record if none exists
    if (!activeSub) {
      activeSub = await base44.asServiceRole.entities.VPNSubscription.create({
        user_email: userEmail,
        plan: 'Free Trial',
        status: 'pending_payment',
        billing_cycle: 'trial',
        start_date: new Date().toISOString(),
        renewal_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        max_devices: 1,
        price: 0,
        notes: 'Auto-created on first login attempt.',
      });
    }

    console.log(`[vpnLogin] Subscription status: ${activeSub.status}, plan: ${activeSub.plan}`);

    // Block pending_payment
    if (activeSub.status === 'pending_payment') {
      return new Response(JSON.stringify({
        success: false,
        message: 'Your trial is reserved. Please subscribe at voxvpn.net to activate VPN access.',
      }), { status: 403, headers: CORS });
    }

    // Check expiry
    if (activeSub.renewal_date && new Date(activeSub.renewal_date) < new Date()) {
      await base44.asServiceRole.entities.VPNSubscription.update(activeSub.id, { status: 'expired' });
      return new Response(JSON.stringify({
        success: false,
        message: `Subscription expired on ${new Date(activeSub.renewal_date).toLocaleDateString()}. Please renew at voxvpn.net.`,
      }), { status: 403, headers: CORS });
    }

    // Device lock
    if (device_id) {
      const deviceTag = `device:${device_id}`;
      const notes = activeSub.notes || '';
      const lockedMatch = notes.match(/device:([^\s\n]+)/);
      const lockedDevice = lockedMatch ? lockedMatch[1] : null;

      if (lockedDevice && lockedDevice !== device_id) {
        return new Response(JSON.stringify({
          success: false,
          message: 'This subscription is already active on another device. Contact support to transfer your license.',
        }), { status: 403, headers: CORS });
      }

      if (!lockedDevice) {
        const allSubs = await base44.asServiceRole.entities.VPNSubscription.filter({});
        const conflict = allSubs.find(s => s.id !== activeSub.id && (s.notes || '').includes(deviceTag));
        if (conflict) {
          return new Response(JSON.stringify({
            success: false,
            message: 'This device is already linked to another VoxVPN account.',
          }), { status: 403, headers: CORS });
        }
        await base44.asServiceRole.entities.VPNSubscription.update(activeSub.id, {
          notes: (notes ? notes + '\n' : '') + deviceTag,
        });
      }
    }

    const expiresAt = activeSub.renewal_date
      ? new Date(activeSub.renewal_date).toISOString().split('T')[0]
      : null;

    console.log(`[vpnLogin] Success for ${userEmail} — plan: ${activeSub.plan}, expires: ${expiresAt}`);

    return new Response(JSON.stringify({
      success: true,
      token,
      email: userEmail,
      subscription_status: activeSub.status,
      plan: activeSub.plan,
      expires_at: expiresAt,
    }), { status: 200, headers: CORS });

  } catch (error) {
    console.error('[vpnLogin] Unexpected error:', error.message, error.stack);
    return new Response(JSON.stringify({
      success: false,
      message: 'Server error: ' + error.message,
    }), { status: 500, headers: CORS });
  }
});