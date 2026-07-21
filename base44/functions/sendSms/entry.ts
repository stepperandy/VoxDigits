import { createClientFromRequest } from 'npm:@base44/sdk@0.8.39';
import {
  resolveSenderNumber,
  getTwilioCredentials,
  sendSmsViaTwilio,
  normalizeE164,
  SenderResolutionError,
} from '../../shared/twilioSender.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { from, to, message } = await req.json();

    if (!to || !message) {
      return Response.json(
        { success: false, error: 'Missing required fields: to, message' },
        { status: 400 }
      );
    }

    // ── Normalize destination to E.164 ──
    const destCheck = normalizeE164(to);
    if (!destCheck.isValid) {
      console.error(`[sendSms] Invalid destination "${to}": ${destCheck.error}`);
      return Response.json(
        { success: false, error: `Invalid destination number: ${destCheck.error}` },
        { status: 400 }
      );
    }
    const toE164 = destCheck.normalized;

    // ── Resolve sender: use the customer's active assigned VirtualNumber ──
    // If the caller provided a `from`, we validate it belongs to them.
    // If not, we auto-resolve from their active numbers.
    let senderNumber = null;

    if (from) {
      // Validate the provided `from` belongs to this user (tenant isolation)
      const fromCheck = normalizeE164(from);
      if (!fromCheck.isValid) {
        return Response.json(
          { success: false, error: `Invalid sender number: ${fromCheck.error}` },
          { status: 400 }
        );
      }
      const fromDigits = fromCheck.normalized.replace(/\D/g, '');

      let userNumbers = await base44.asServiceRole.entities.VirtualNumber.filter({
        userId: user.id,
        status: 'active',
      });
      if (!userNumbers || userNumbers.length === 0) {
        userNumbers = await base44.asServiceRole.entities.VirtualNumber.filter({
          customer_email: user.email,
          status: 'active',
        });
      }

      const match = (userNumbers || []).find((n) => {
        const nd = (n.phone_number || n.number || '').replace(/\D/g, '');
        return nd === fromDigits || nd.endsWith(fromDigits) || fromDigits.endsWith(nd);
      });

      if (!match) {
        console.error(
          `[sendSms] TENANT VIOLATION: user ${user.email} attempted to send from ${from} which is not assigned to them`
        );
        return Response.json(
          { success: false, error: 'You do not own this virtual number' },
          { status: 403 }
        );
      }

      if (match.sms_enabled === false) {
        return Response.json(
          { success: false, error: 'This virtual number does not have SMS capability enabled' },
          { status: 403 }
        );
      }

      senderNumber = match.phone_number || match.number;
    } else {
      // Auto-resolve from the user's active SMS-capable numbers
      const resolved = await resolveSenderNumber(base44.asServiceRole, user, { requireSms: true });
      senderNumber = resolved.resolvedNumber;
    }

    console.log(`[sendSms] Sending SMS from ${senderNumber} to ${toE164}`);

    // ── Check wallet balance and get SMS rate ──
    const userBalance = user.credits || 0;
    let smsRate = 0.03;
    try {
      const rateRes = await base44.asServiceRole.functions.invoke('billingEngine', {
        action: 'get_rate',
        user_email: user.email,
        category: 'sms',
        call_type: 'outbound',
        country_code: 'US',
      });
      smsRate = rateRes?.sell_price || 0.03;
    } catch (e) {
      console.warn('[sendSms] Rate lookup failed, using default:', e.message);
    }

    if (userBalance < smsRate) {
      console.warn(`[sendSms] Insufficient balance for ${user.email}: has $${userBalance}, needs $${smsRate}`);
      return Response.json(
        {
          success: false,
          error: 'Insufficient balance. Please add calling & SMS credit to send messages.',
          balance: userBalance,
          required: smsRate,
        },
        { status: 402 }
      );
    }

    // ── Get Twilio credentials (server-side only) ──
    const { accountSid, authToken } = getTwilioCredentials();

    // ── Send via Twilio: Messaging Service SID + explicit From ──
    const result = await sendSmsViaTwilio(accountSid, authToken, senderNumber, toE164, message);

    // ── Log to Message entity ──
    try {
      await base44.asServiceRole.entities.Message.create({
        user_email: user.email,
        our_number: senderNumber,
        from_number: senderNumber,
        to_number: toE164,
        body: message,
        direction: 'outbound',
        status: 'sent',
        provider_message_id: result.messageSid,
      });
    } catch (logErr) {
      console.error('[sendSms] Failed to log message:', logErr.message);
    }

    // ── Charge user for SMS ──
    try {
      await base44.asServiceRole.functions.invoke('billingEngine', {
        action: 'charge',
        user_email: user.email,
        amount: smsRate,
        category: 'sms',
        description: `SMS from ${senderNumber} to ${toE164}`,
        reference_id: result.messageSid,
      });
    } catch (chargeErr) {
      console.error('[sendSms] Charge failed:', chargeErr.message);
    }

    console.log(`[sendSms] SMS sent successfully, SID: ${result.messageSid}`);
    return Response.json({
      success: true,
      message_sid: result.messageSid,
    });
  } catch (error) {
    if (error instanceof SenderResolutionError) {
      const status = error.code === 'AUTH_REQUIRED' ? 401 : 403;
      return Response.json({ success: false, error: error.message, code: error.code }, { status });
    }
    console.error('[sendSms] Error:', error.message);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});