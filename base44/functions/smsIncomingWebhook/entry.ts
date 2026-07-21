/**
 * Twilio inbound SMS webhook.
 * PUBLIC endpoint — called by Twilio, NO Base44 user authentication.
 *
 * Compliance:
 *  - Parses application/x-www-form-urlencoded body
 *  - Returns HTTP 200 promptly with valid TwiML
 *  - Uses inline TwiML <Message> for auto-replies (no blocking API calls)
 *  - All DB operations in try/catch — exceptions never prevent 200 response
 *  - Logs MessageSid, To, From, Body (no secrets)
 *  - Returns empty <Response/> for status callbacks
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { normalizeE164, detectDestinationCountry } from '../../shared/twilioSender.ts';

const EMPTY_TWIML = '<?xml version="1.0" encoding="UTF-8"?><Response/>';

const twimlResponse = (body = '') => new Response(body || EMPTY_TWIML, {
  status: 200,
  headers: { 'Content-Type': 'application/xml; charset=UTF-8' },
});

Deno.serve(async (req) => {
  // ── Always return 200 with valid TwiML, even on parse failure ──
  let from = '';
  let to = '';
  let messageBody = '';
  let messageSid = '';
  let messageStatus = '';

  try {
    if (req.method !== 'POST') {
      return twimlResponse();
    }

    const base44 = createClientFromRequest(req);

    // ── Parse application/x-www-form-urlencoded body ──
    const text = await req.text();
    const formData = new URLSearchParams(text);

    from         = formData.get('From') || '';
    to           = formData.get('To') || '';
    messageBody  = formData.get('Body') || '';
    messageSid   = formData.get('MessageSid') || formData.get('SmsSid') || '';
    messageStatus = formData.get('MessageStatus') || formData.get('SmsStatus') || '';

    // ── Status callbacks (no Body): return 200 immediately ──
    if (messageStatus && !messageBody) {
      console.log(`[smsIncomingWebhook] Status callback: Sid=${messageSid} Status=${messageStatus}`);
      return twimlResponse();
    }

    if (!from || !to || !messageSid) {
      console.warn(`[smsIncomingWebhook] Missing required fields: From=${from} To=${to} Sid=${messageSid}`);
      return twimlResponse();
    }

    console.log(`[smsIncomingWebhook] Inbound: From=${from} To=${to} Sid=${messageSid} Body="${messageBody?.substring(0, 50)}"`);

    // ── Find the virtual number owner — tenant isolation ──
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
      console.error(`[smsIncomingWebhook] VirtualNumber lookup error: ${lookupErr.message}`);
    }

    if (!numbers || numbers.length === 0) {
      console.warn(`[smsIncomingWebhook] No owner for virtual number ${to}`);
      return twimlResponse();
    }

    const virtualNumber = numbers[0];

    // ── Tenant authorization: verify the number is active ──
    if (virtualNumber.status && virtualNumber.status !== 'active') {
      console.warn(`[smsIncomingWebhook] VirtualNumber ${to} is ${virtualNumber.status}, not accepting inbound`);
      return twimlResponse();
    }

    let ownerEmail = virtualNumber.customer_email || null;
    if (!ownerEmail && virtualNumber.userId) {
      try {
        const users = await base44.asServiceRole.entities.User.filter({ id: virtualNumber.userId });
        if (users && users.length > 0) ownerEmail = users[0].email;
      } catch (e) {
        console.warn(`[smsIncomingWebhook] User lookup error: ${e.message}`);
      }
    }

    // ── Log the inbound message (dedup by SID) ──
    if (ownerEmail) {
      try {
        const existing = await base44.asServiceRole.entities.Message.filter({ provider_message_id: messageSid });
        if (!existing || existing.length === 0) {
          await base44.asServiceRole.entities.Message.create({
            user_email: ownerEmail,
            our_number: to,
            from_number: from,
            to_number: to,
            body: messageBody,
            direction: 'inbound',
            status: 'delivered',
            provider_message_id: messageSid,
          });
          console.log(`[smsIncomingWebhook] Saved inbound SMS for ${ownerEmail}`);
        } else {
          console.log(`[smsIncomingWebhook] Duplicate SID ${messageSid}, skipping`);
        }
      } catch (logErr) {
        console.error(`[smsIncomingWebhook] Message save error: ${logErr.message}`);
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
        if (autoReplies && autoReplies.length > 0) {
          const replyText = autoReplies[0].message
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          // Inline TwiML: Twilio sends this from the inbound number automatically
          twiml += `<Message>${replyText}</Message>`;
          console.log(`[smsIncomingWebhook] Auto-reply inline from ${to} to ${from}`);
        }
      } catch (replyErr) {
        console.warn(`[smsIncomingWebhook] Auto-reply lookup error: ${replyErr.message}`);
      }
    }

    twiml += '</Response>';
    return twimlResponse(twiml);
  } catch (error) {
    console.error(`[smsIncomingWebhook] Error: From=${from} To=${to} Sid=${messageSid} — ${error.message}`);
    return twimlResponse();
  }
});