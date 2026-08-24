import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';
import { registerDeviceAndClaimCredits } from '../../shared/freeCredits.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

// Stripe expects nested values as bracket-notation form params:
// metadata[email]=x, payment_method_types[0]=card, expand[0]=...
function flatten(obj, prefix, form) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) {
      v.forEach((item, i) => form.append(`${key}[${i}]`, String(item)));
    } else if (typeof v === 'object') {
      flatten(v, key, form);
    } else {
      form.append(key, String(v));
    }
  }
}

async function stripeForm(path, data, method = 'POST') {
  const key = secrets.get('STRIPE_SECRET_KEY');
  const form = new URLSearchParams();
  flatten(data || {}, '', form);
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method,
    headers: { Authorization: `Bearer ${key}` },
    body: method === 'GET' ? undefined : form,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Stripe request failed');
  return json;
}

export default async function (req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401, headers: CORS });

    const body = await req.json().catch(() => ({}));
    const { action, session_id, fingerprint, ip_address, user_agent } = body;
    const email = (body.customer_email || user.email || '').toLowerCase();
    const appUrl = secrets.get('APP_URL') || 'https://voxvpn.net';

    // ── create: open a Stripe Checkout session in setup mode to collect + $0-authorize the card ──
    if (action === 'create' || !action) {
      const existingSubs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: email });
      let customerId = existingSubs?.[0]?.stripe_customer_id;
      if (!customerId) {
        const customer = await stripeForm('customers', { email, description: `VoxVPN — ${email}` });
        customerId = customer.id;
      }

      const session = await stripeForm('checkout/sessions', {
        mode: 'setup',
        customer: customerId,
        customer_email: customerId ? undefined : email,
        payment_method_types: ['card'],
        success_url: `${appUrl}/setup-payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/auth-signup`,
        payment_intent_data: undefined,
        metadata: { email, fingerprint: fingerprint || '' },
      });

      return Response.json({ success: true, url: session.url });
    }

    // ── confirm: after the user returns from Stripe Checkout, save the payment method + grant credits ──
    if (action === 'confirm') {
      if (!session_id) return Response.json({ error: 'session_id required' }, { status: 400, headers: CORS });

      // Retrieve the completed setup session (expand the setup_intent to reach the payment method).
      const session = await stripeForm(`checkout/sessions/${session_id}?expand[0]=setup_intent.payment_method`, {}, 'GET');
      if (session.payment_status !== 'paid' && session.status !== 'complete') {
        return Response.json({ success: false, error: 'Payment setup was not completed.' }, { status: 400, headers: CORS });
      }

      const setupIntent = session.setup_intent || {};
      const paymentMethodId = setupIntent.payment_method?.id || setupIntent.payment_method;
      const customerId = session.customer;

      if (!paymentMethodId) {
        // Fallback: retrieve the setup_intent explicitly.
        const si = await stripeForm(`setup_intents/${setupIntent.id}?expand[0]=payment_method`, {}, 'GET');
        if (!si.payment_method?.id) {
          return Response.json({ success: false, error: 'No payment method found on the completed session.' }, { status: 400, headers: CORS });
        }
      }

      const targetEmail = (session.metadata?.email || email).toLowerCase();
      const fp = session.metadata?.fingerprint || fingerprint || '';

      // Persist the authorized payment method on the user's subscription record.
      const existingSubs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: targetEmail });
      let sub = existingSubs?.[0];
      if (sub) {
        sub = await base44.asServiceRole.entities.VPNSubscription.update(sub.id, {
          stripe_customer_id: customerId,
          payment_method_id: paymentMethodId,
          payment_authorized: true,
        });
      } else {
        sub = await base44.asServiceRole.entities.VPNSubscription.create({
          user_email: targetEmail,
          plan: 'Free Trial',
          status: 'trial',
          billing_cycle: 'trial',
          price: 0,
          start_date: new Date().toISOString(),
          max_devices: 1,
          stripe_customer_id: customerId,
          payment_method_id: paymentMethodId,
          payment_authorized: true,
        });
      }

      // Bind the device + grant the 25 free credits.
      let creditsResult = null;
      if (fp) {
        try {
          creditsResult = await registerDeviceAndClaimCredits(
            base44.asServiceRole,
            targetEmail,
            fp,
            ip_address,
            user_agent,
          );
        } catch (e) {
          // If credits were already claimed, that's fine — keep the payment method on file.
          if (e.message !== 'already_claimed') {
            return Response.json({ success: false, error: e.message }, { status: 403, headers: CORS });
          }
        }
      }

      return Response.json({ success: true, subscription: sub, credits: creditsResult?.credits ?? 25 });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400, headers: CORS });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: CORS });
  }
}