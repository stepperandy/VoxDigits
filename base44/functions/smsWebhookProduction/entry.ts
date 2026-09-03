/**
 * Twilio inbound SMS webhook (legacy production).
 * PUBLIC endpoint — called by Twilio, NO Base44 user authentication.
 *
 * Compliance:
 *  - Parses application/x-www-form-urlencoded body
 *  - Returns HTTP 200 promptly with valid TwiML
 *  - All DB operations in try/catch — exceptions never prevent 200 response
 *  - Logs From, To, Body (no secrets)
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { normalizeE164 } from '../../shared/twilioSender.ts';

const EMPTY_TWIML = '<?xml version="1.0" encoding="UTF-8"?><Response/>';

const twimlResponse = () => new Response(EMPTY_TWIML, {
  status: 200,
  headers: { 'Content-Type': 'text/xml; charset=UTF-8' },
});

async function getSmsRouting(toNumber, base44) {
  try {
    const toCheck = normalizeE164(toNumber);
    const toNorm = toCheck.normalized || toNumber;

    let numbers = await base44.asServiceRole.entities.VirtualNumber.filter({ phone_number: toNorm });
    if (numbers && numbers.length > 0 && (numbers[0].customer_email || numbers[0].userId)) {
      console.log(`[smsWebhookProduction] Found by phone_number: ${toNorm}`);
      return { userEmail: numbers[0].customer_email, userId: numbers[0].userId };
    }

    numbers = await base44.asServiceRole.entities.VirtualNumber.filter({ number: toNorm });
    if (numbers && numbers.length > 0) {
      console.log(`[smsWebhookProduction] Found by number (legacy): ${toNorm}`);
      return { userEmail: numbers[0].customer_email, userId: numbers[0].userId };
    }

    // Fallback: no plus prefix
    const toNoPlus = toNorm.replace(/^\+/, '');
    numbers = await base44.asServiceRole.entities.VirtualNumber.filter({ phone_number: toNoPlus });
    if (numbers && numbers.length > 0) {
      console.log(`[smsWebhookProduction] Found by phone_number (no plus): ${toNoPlus}`);
      return { userEmail: numbers[0].customer_email, userId: numbers[0].userId };
    }

    // Last resort: scan by digits
    const toDigits = toNorm.replace(/\D/g, '');
    const allNums = await base44.asServiceRole.entities.VirtualNumber.list('-created_date', 200);
    numbers = (allNums || []).filter((n) => {
      const nd = (n.phone_number || n.number || '').replace(/\D/g, '');
      return nd === toDigits || nd.endsWith(toDigits) || toDigits.endsWith(nd);
    });
    if (numbers && numbers.length > 0) {
      console.log(`[smsWebhookProduction] Found by digit scan: ${toDigits}`);
      return { userEmail: numbers[0].customer_email, userId: numbers[0].userId };
    }

    console.warn(`[smsWebhookProduction] No VirtualNumber found for ${toNumber}`);
    return null;
  } catch (err) {
    console.error('[smsWebhookProduction] SMS routing lookup error:', err.message);
    return null;
  }
}

Deno.serve(async (req) => {
  let from = '';
  let to = '';
  let body = '';
  let messageSid = '';

  try {
    const base44 = createClientFromRequest(req);

    // ── Parse application/x-www-form-urlencoded body ──
    const text = await req.text();
    const params = new URLSearchParams(text);

    from = params.get('From') || '';
    to = params.get('To') || '';
    body = params.get('Body') || '';
    messageSid = params.get('MessageSid') || params.get('SmsSid') || '';

    console.log(`[smsWebhookProduction] Inbound: From=${from} To=${to} Sid=${messageSid}`);

    const routing = await getSmsRouting(to, base44);

    // ── Log inbound SMS (dedup by SID) ──
    if (routing && (routing.userEmail || routing.userId)) {
      let userEmail = routing.userEmail;
      if (!userEmail && routing.userId) {
        try {
          const users = await base44.asServiceRole.entities.User.filter({ id: routing.userId });
          userEmail = users?.[0]?.email;
        } catch (e) {
          console.warn('[smsWebhookProduction] Could not fetch user email:', e.message);
        }
      }

      if (userEmail) {
        try {
          const existing = messageSid
            ? await base44.asServiceRole.entities.Message.filter({ provider_message_id: messageSid })
            : null;
          if (!existing || existing.length === 0) {
            await base44.asServiceRole.entities.Message.create({
              user_email: userEmail,
              from_number: from,
              to_number: to,
              our_number: to,
              body: body,
              direction: 'inbound',
              status: 'delivered',
              provider_message_id: messageSid,
            });
            console.log(`[smsWebhookProduction] SMS logged: ${from} → ${to} for ${userEmail}`);
          } else {
            console.log(`[smsWebhookProduction] Duplicate SID ${messageSid}, skipping`);
          }
        } catch (logErr) {
          console.error('[smsWebhookProduction] SMS logging error:', logErr.message);
        }
      }
    }

    // ── Always return 200 with valid TwiML ──
    return twimlResponse();
  } catch (error) {
    console.error(`[smsWebhookProduction] Error: From=${from} To=${to} — ${error.message}`);
    return twimlResponse();
  }
});