/**
 * Twilio inbound SMS webhook (production).
 * PUBLIC endpoint — called by Twilio, NO Base44 user authentication.
 *
 * Compliance:
 *  - Parses application/x-www-form-urlencoded body
 *  - Returns HTTP 200 promptly with valid TwiML
 *  - Uses inline TwiML <Message> for auto-replies (no blocking API calls)
 *  - All DB operations in try/catch — exceptions never prevent 200 response
 *  - Logs MessageSid, To, From, Body (no secrets)
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { normalizeE164 } from '../../shared/twilioSender.ts';

const EMPTY_TWIML = '<?xml version="1.0" encoding="UTF-8"?><Response/>';

const twimlResponse = (body = '') => new Response(body || EMPTY_TWIML, {
  status: 200,
  headers: { 'Content-Type': 'text/xml; charset=UTF-8' },
});

Deno.serve(async (req) => {
  let from = '';
  let to = '';
  let messageBody = '';
  let messageSid = '';
  let messageStatus = '';

  try {
    const base44 = createClientFromRequest(req);

    // ── Parse application/x-www-form-urlencoded body ──
    const text = await req.text();
    const params = new URLSearchParams(text);

    from          = params.get('From') || '';
    to            = params.get('To') || '';
    messageBody   = params.get('Body') || '';
    messageSid    = params.get('MessageSid') || params.get('SmsSid') || '';
    messageStatus = params.get('MessageStatus') || params.get('SmsStatus') || '';

    // ── Status callbacks (no Body): return 200 immediately ──
    if (messageStatus && !messageBody) {
      console.log(`[twilioSmsWebhook] Status callback: Sid=${messageSid} Status=${messageStatus}`);
      return twimlResponse();
    }

    if (!from || !to) {
      console.warn(`[twilioSmsWebhook] Missing From or To`);
      return twimlResponse();
    }

    console.log(`[twilioSmsWebhook] Inbound: From=${from} To=${to} Sid=${messageSid} Body="${messageBody?.substring(0, 50)}"`);

    // ── Find the VirtualNumber owner — tenant isolation ──
    const toCheck = normalizeE164(to);
    const toNorm = toCheck.normalized || to;

    let numbers = null;
    try {
      numbers = await base44.asServiceRole.entities.VirtualNumber.filter({ phone_number: toNorm });
      if (!numbers || numbers.length === 0) {
        numbers = await base44.asServiceRole.entities.VirtualNumber.filter({ number: toNorm });
      }
      if (!numbers || numbers.length === 0) {
        const toNoPlus = toNorm.replace(/^\+/, '');
        numbers = await base44.asServiceRole.entities.VirtualNumber.filter({ phone_number: toNoPlus });
      }
      if (!numbers || numbers.length === 0) {
        const toNoPlus = toNorm.replace(/^\+/, '');
        numbers = await base44.asServiceRole.entities.VirtualNumber.filter({ number: toNoPlus });
      }
      // Last resort: scan all and match by digits
      if (!numbers || numbers.length === 0) {
        const toDigits = toNorm.replace(/\D/g, '');
        const allNums = await base44.asServiceRole.entities.VirtualNumber.list('-created_date', 200);
        numbers = (allNums || []).filter((n) => {
          const nd = (n.phone_number || n.number || '').replace(/\D/g, '');
          return nd === toDigits || nd.endsWith(toDigits) || toDigits.endsWith(nd);
        });
      }
    } catch (lookupErr) {
      console.error(`[twilioSmsWebhook] VirtualNumber lookup error: ${lookupErr.message}`);
    }

    const virtualNumber = numbers?.[0];
    const ownerEmail = virtualNumber?.customer_email || '';

    if (!ownerEmail) {
      console.warn(`[twilioSmsWebhook] No owner found for ${to}`);
    }

    // ── Tenant authorization: verify the number is active ──
    if (virtualNumber && virtualNumber.status && virtualNumber.status !== 'active') {
      console.warn(`[twilioSmsWebhook] VirtualNumber ${to} is ${virtualNumber.status}, not accepting inbound`);
      return twimlResponse();
    }

    // ── Dedup check + save inbound message ──
    if (ownerEmail && messageSid) {
      try {
        const existing = await base44.asServiceRole.entities.Message.filter({ provider_message_id: messageSid });
        if (existing && existing.length > 0) {
          console.log(`[twilioSmsWebhook] Duplicate SID ${messageSid}, skipping`);
        } else {
          await base44.asServiceRole.entities.Message.create({
            user_email: ownerEmail,
            from_number: from,
            to_number: to,
            our_number: to,
            body: messageBody,
            direction: 'inbound',
            status: 'delivered',
            provider_message_id: messageSid,
          });
          console.log(`[twilioSmsWebhook] Saved inbound SMS for ${ownerEmail}`);
        }
      } catch (logErr) {
        console.error(`[twilioSmsWebhook] Message save error: ${logErr.message}`);
      }
    }

    // ── Auto-reply via inline TwiML (no blocking API call) ──
    let twiml = '<?xml version="1.0" encoding="UTF-8"?><Response>';
    if (ownerEmail && virtualNumber) {
      try {
        const autoReplies = await base44.asServiceRole.entities.AutoReplyTemplate.filter({
          virtual_number: to,
          user_email: ownerEmail,
          enabled: true,
        });
        if (autoReplies.length > 0) {
          const replyText = autoReplies[0].message
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          twiml += `<Message>${replyText}</Message>`;
          console.log(`[twilioSmsWebhook] Auto-reply inline from ${to} to ${from}`);
        }
      } catch (replyErr) {
        console.warn(`[twilioSmsWebhook] Auto-reply lookup error: ${replyErr.message}`);
      }
    }
    twiml += '</Response>';

    return twimlResponse(twiml);
  } catch (error) {
    console.error(`[twilioSmsWebhook] Error: From=${from} To=${to} Sid=${messageSid} — ${error.message}`);
    return twimlResponse();
  }
});