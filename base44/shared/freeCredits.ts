// Shared logic for the 25-credit free trial, used by deviceTracker,
// setupPaymentAuth, consumeFreeCredit, and connectSessionStart so the logic
// lives in exactly one place. `db` is the caller's base44.asServiceRole client.

import { secrets } from 'base44:runtime';

export const FREE_CREDITS = 25;

const PRICE_MAP = {
  monthly: 'price_standard_monthly',
  yearly: 'price_standard_yearly',
};

async function stripeForm(path, data, method = 'POST') {
  const key = secrets.get('STRIPE_SECRET_KEY');
  const form = new URLSearchParams();
  for (const [k, v] of Object.entries(data || {})) {
    if (v !== undefined && v !== null) form.append(k, String(v));
  }
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method,
    headers: { Authorization: `Bearer ${key}` },
    body: method === 'GET' ? undefined : form,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Stripe request failed');
  return json;
}

export async function registerDeviceAndClaimCredits(db, email, fingerprint, ip, ua) {
  const targetEmail = String(email || '').toLowerCase();
  if (!targetEmail) throw new Error('Email is required');
  if (!fingerprint) throw new Error('Device fingerprint is required');

  const now = new Date().toISOString();
  const devices = await db.entities.DeviceFingerprint.filter({ fingerprint });
  const device = devices && devices[0];

  if (device && device.status === 'blocked') throw new Error('device_blocked');
  if (device && device.free_credits_claimed && device.user_email
      && device.user_email !== targetEmail) {
    throw new Error('free_credits_already_claimed');
  }

  let saved;
  if (device) {
    const linked = Array.isArray(device.linked_accounts) ? [...device.linked_accounts] : [];
    if (!linked.includes(targetEmail)) linked.push(targetEmail);
    saved = await db.entities.DeviceFingerprint.update(device.id, {
      user_email: targetEmail,
      free_credits_claimed: true,
      last_seen_at: now,
      linked_accounts: linked,
      ip_address: ip || device.ip_address,
      user_agent: ua || device.user_agent,
    });
  } else {
    saved = await db.entities.DeviceFingerprint.create({
      fingerprint,
      user_email: targetEmail,
      free_credits_claimed: true,
      status: 'active',
      linked_accounts: [targetEmail],
      first_seen_at: now,
      last_seen_at: now,
      ip_address: ip,
      user_agent: ua,
    });
  }

  const existing = await db.entities.VPNSubscription.filter({ user_email: targetEmail });
  const alreadyClaimed = (existing || []).some(
    s => (s.credits_total || 0) > 0 || s.plan === 'Free Trial',
  );
  if (alreadyClaimed) throw new Error('already_claimed');

  const sub = await db.entities.VPNSubscription.create({
    user_email: targetEmail,
    plan: 'Free Trial',
    status: 'trial',
    billing_cycle: 'trial',
    price: 0,
    start_date: now,
    max_devices: 1,
    credits_remaining: FREE_CREDITS,
    credits_total: FREE_CREDITS,
    credits_used: 0,
  });

  return { device: saved, subscription: sub, credits: FREE_CREDITS };
}

// Consume one credit on a VPN connection. When the credits reach 0 and a card
// was pre-authorized, automatically create a paid subscription (off-session).
export async function consumeCredit(db, email, billingCycle = 'monthly') {
  const targetEmail = String(email || '').toLowerCase();
  const subs = await db.entities.VPNSubscription.filter({ user_email: targetEmail });
  const trial = (subs || []).find(
    s => s.plan === 'Free Trial' && (s.status === 'trial' || s.status === 'active'),
  );
  if (!trial) {
    return { success: false, error: 'No active free trial found.', status: 404 };
  }

  const remaining = Math.max(0, (trial.credits_remaining || 0) - 1);
  const used = (trial.credits_used || 0) + 1;

  let charged = false;
  let chargeError = null;

  if (remaining === 0 && trial.payment_authorized && trial.payment_method_id && trial.stripe_customer_id) {
    try {
      const cycle = billingCycle === 'yearly' ? 'yearly' : 'monthly';
      const sub = await stripeForm('subscriptions', {
        customer: trial.stripe_customer_id,
        'items[0][price]': PRICE_MAP[cycle],
        default_payment_method: trial.payment_method_id,
        off_session: true,
        collection_method: 'charge_automatically',
      });
      await db.entities.VPNSubscription.update(trial.id, {
        credits_remaining: 0,
        credits_used: used,
        status: 'active',
        plan: 'Standard',
        billing_cycle: cycle,
        stripe_subscription_id: sub.id,
        price: cycle === 'yearly' ? 53.88 : 6.99,
        renewal_date: sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : undefined,
      });
      charged = true;
    } catch (e) {
      await db.entities.VPNSubscription.update(trial.id, {
        credits_remaining: 0,
        credits_used: used,
        status: 'pending_payment',
      });
      chargeError = e.message;
    }
  } else {
    await db.entities.VPNSubscription.update(trial.id, {
      credits_remaining: remaining,
      credits_used: used,
    });
  }

  return {
    success: true,
    credits_remaining: remaining,
    credits_used: used,
    credits_total: trial.credits_total || FREE_CREDITS,
    auto_charged: charged,
    charge_error: chargeError,
  };
}