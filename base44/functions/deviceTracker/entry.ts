import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { registerDeviceAndClaimCredits, FREE_CREDITS } from '../../shared/freeCredits.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

export default async function (req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401, headers: CORS });

    const body = await req.json().catch(() => ({}));
    const { action, fingerprint, user_email, ip_address, user_agent } = body;
    const targetEmail = (user_email || user.email || '').toLowerCase();

    if (!fingerprint) return Response.json({ error: 'Device fingerprint required' }, { status: 400, headers: CORS });

    const devices = await base44.asServiceRole.entities.DeviceFingerprint.filter({ fingerprint });
    const device = devices && devices[0];

    // ── check_eligibility: can this device still claim its one-time free credits? ──
    if (action === 'check_eligibility') {
      if (!device) return Response.json({ eligible: true, reason: 'new_device' });
      if (device.status === 'blocked') return Response.json({ eligible: false, reason: 'device_blocked' });
      if (device.free_credits_claimed && device.user_email && device.user_email !== targetEmail) {
        return Response.json({
          eligible: false,
          reason: 'free_credits_already_claimed',
          existing_account: device.user_email,
        });
      }
      return Response.json({ eligible: true, reason: 'device_known' });
    }

    // ── check_login: is this device allowed to sign in as targetEmail? ──
    if (action === 'check_login') {
      if (!device) return Response.json({ allowed: true, reason: 'new_device' });
      if (device.status === 'blocked') return Response.json({ allowed: false, reason: 'device_blocked' });
      if (device.free_credits_claimed && device.user_email && device.user_email !== targetEmail) {
        return Response.json({
          allowed: false,
          reason: 'device_linked_to_other_account',
          existing_account: device.user_email,
        });
      }
      if (device.user_email === targetEmail) {
        await base44.asServiceRole.entities.DeviceFingerprint.update(device.id, {
          last_seen_at: new Date().toISOString(),
          ip_address: ip_address || device.ip_address,
          user_agent: user_agent || device.user_agent,
        });
      }
      return Response.json({ allowed: true });
    }

    // ── claim_free_credits: bind device to account and grant the 25 credits ──
    if (action === 'claim_free_credits' || action === 'register') {
      try {
        const result = await registerDeviceAndClaimCredits(
          base44.asServiceRole,
          targetEmail,
          fingerprint,
          ip_address,
          user_agent,
        );
        return Response.json({ success: true, ...result });
      } catch (e) {
        const friendly = {
          device_blocked: 'This device has been blocked. Please contact support.',
          free_credits_already_claimed: 'This device has already used its free credits on another account and cannot register a new one.',
          already_claimed: 'Free credits have already been claimed on this account.',
        }[e.message] || e.message;
        return Response.json({ success: false, error: friendly }, { status: 403, headers: CORS });
      }
    }

    return Response.json({ error: 'Unknown action', free_credits: FREE_CREDITS }, { status: 400, headers: CORS });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: CORS });
  }
}