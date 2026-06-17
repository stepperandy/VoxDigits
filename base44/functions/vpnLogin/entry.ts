import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

const APP_ID = Deno.env.get('BASE44_APP_ID');
const APP_BASE_URL = `https://app--${APP_ID}.base44.app`;

async function tryPasswordLogin(email, password) {
  const res = await fetch(`${APP_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch {}
  console.log('[vpnLogin] auth attempt status:', res.status, text.slice(0, 300));
  return { ok: res.ok, status: res.status, data, text };
}

function getServiceToken(req) {
  return (
    req.headers.get('x-service-token') ||
    req.headers.get('base44-service-token') ||
    req.headers.get('x-base44-service-token') ||
    Deno.env.get('BASE44_SERVICE_TOKEN') ||
    null
  );
}

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

    // Step 1: Try password login
    let attempt = await tryPasswordLogin(email, password);
    let token = null;
    let authUser = null;

    if (attempt.ok) {
      token = attempt.data?.access_token || attempt.data?.token || null;
      authUser = attempt.data?.user || null;

    } else {
      const errLower = attempt.text.toLowerCase();
      const isWrongPassword = errLower.includes('invalid email or password') || errLower.includes('invalid credentials');
      const isUnverified = errLower.includes('verif') || errLower.includes('confirm');

      if (isWrongPassword) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Invalid email or password.',
        }), { status: 401, headers: CORS });
      }

      // Handle unverified email — auto-verify using service token OTP method
      if (isUnverified) {
        const users = await base44.asServiceRole.entities.User.filter({ email });
        if (!users || users.length === 0) {
          return new Response(JSON.stringify({ success: false, message: 'Invalid email or password.' }), { status: 401, headers: CORS });
        }

        const userId = users[0].id;

        await fetch(`${APP_BASE_URL}/api/auth/resend-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const serviceToken = getServiceToken(req);
        if (serviceToken) {
          const userRes = await fetch(`${APP_BASE_URL}/api/entities/User/${userId}`, {
            headers: { 'Authorization': `Bearer ${serviceToken}`, 'X-App-Id': APP_ID },
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            const otpCode = userData.otp_code || null;
            if (otpCode) {
              await fetch(`${APP_BASE_URL}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp_code: otpCode }),
              });
            }
          }
        }

        attempt = await tryPasswordLogin(email, password);
        if (!attempt.ok) {
          return new Response(JSON.stringify({
            success: false,
            message: 'Login failed. Please verify your email first.',
          }), { status: 401, headers: CORS });
        }

        token = attempt.data?.access_token || attempt.data?.token || null;
        authUser = attempt.data?.user || users[0];

      } else {
        return new Response(JSON.stringify({
          success: false,
          message: attempt.data?.message || attempt.data?.detail || 'Login failed.',
        }), { status: 401, headers: CORS });
      }
    }

    if (!token) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Authentication failed. Please try again.',
      }), { status: 500, headers: CORS });
    }

    // Step 2: Check active subscription
    const userEmail = authUser?.email || email;
    const subs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: userEmail });
    let activeSub = subs?.find(s => ['active', 'trial'].includes(s.status)) || subs?.[0] || null;

    // Auto-create a pending_payment record for users who signed up via social/Google (no subscription yet)
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

    // Block pending_payment — trial window exists but user must pay first
    if (activeSub.status === 'pending_payment') {
      return new Response(JSON.stringify({
        success: false,
        message: 'Your 5-day trial is reserved. Please subscribe or make a payment at voxvpn.net to activate VPN access.',
      }), { status: 403, headers: CORS });
    }

    // Step 3: Check expiry
    if (activeSub.renewal_date && new Date(activeSub.renewal_date) < new Date()) {
      await base44.asServiceRole.entities.VPNSubscription.update(activeSub.id, { status: 'expired' });
      return new Response(JSON.stringify({
        success: false,
        message: `Subscription expired on ${new Date(activeSub.renewal_date).toLocaleDateString()}. Please renew at voxvpn.net.`,
      }), { status: 403, headers: CORS });
    }

    // Step 4: Device lock — one subscription = one device
    if (device_id) {
      const deviceTag = `device:${device_id}`;
      const notes = activeSub.notes || '';

      // Extract the locked device from subscription notes (first `device:` entry)
      const lockedMatch = notes.match(/device:([^\s\n]+)/);
      const lockedDevice = lockedMatch ? lockedMatch[1] : null;

      if (lockedDevice && lockedDevice !== device_id) {
        // A different device is already locked to this subscription — block it
        return new Response(JSON.stringify({
          success: false,
          message: 'This subscription is already active on another device. Each subscription allows only one device. Contact support to transfer your license.',
        }), { status: 403, headers: CORS });
      }

      // Also block if this device_id is tagged on a DIFFERENT user's subscription
      if (!lockedDevice) {
        const allSubs = await base44.asServiceRole.entities.VPNSubscription.filter({});
        const conflict = allSubs.find(s => s.id !== activeSub.id && (s.notes || '').includes(deviceTag));
        if (conflict) {
          return new Response(JSON.stringify({
            success: false,
            message: 'This device is already linked to another VoxVPN account.',
          }), { status: 403, headers: CORS });
        }
        // First login — lock this device to the subscription
        await base44.asServiceRole.entities.VPNSubscription.update(activeSub.id, {
          notes: (notes ? notes + '\n' : '') + deviceTag,
        });
      }
    }

    const expiresAt = activeSub.renewal_date
      ? new Date(activeSub.renewal_date).toISOString().split('T')[0]
      : null;

    return new Response(JSON.stringify({
      success: true,
      token,
      email: userEmail,
      subscription_status: activeSub.status,
      plan: activeSub.plan,
      expires_at: expiresAt,
    }), { status: 200, headers: CORS });

  } catch (error) {
    console.error('[vpnLogin] error:', error.message);
    return new Response(JSON.stringify({
      success: false,
      message: 'Server error: ' + error.message,
    }), { status: 500, headers: CORS });
  }
});