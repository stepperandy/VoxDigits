import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import {
  getTwilioCredentials,
  sendSmsViaTwilio,
  normalizeE164,
} from '../../shared/twilioSender.ts';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const formData = await req.formData();

    const from        = formData.get('From') || '';
    const to          = formData.get('To') || '';
    const messageBody = formData.get('Body') || '';
    const messageSid  = formData.get('MessageSid') || formData.get('SmsSid') || '';
    const messageStatus = formData.get('MessageStatus') || formData.get('SmsStatus') || '';

    console.log(`[smsIncomingWebhook] From=${from} To=${to} Status=${messageStatus} Body=${messageBody?.substring(0, 50)}`);

    const twimlOk = new Response(`<?xml version="1.0" encoding="UTF-8"?><Response/>`, {
      headers: { 'Content-Type': 'application/xml' },
    });

    // ── STATUS CALLBACKS: Twilio posts delivery status updates — ignore them ──
    if (messageStatus && !messageBody) {
      console.log('[smsIncomingWebhook] Status callback received, ignoring:', messageStatus);
      return twimlOk;
    }

    if (!from || !to || !messageBody || !messageSid) {
      console.warn('[smsIncomingWebhook] Missing required fields, ignoring');
      return twimlOk;
    }

    // ── Find the virtual number owner — tenant isolation ──
    const toCheck = normalizeE164(to);
    const toNorm = toCheck.normalized || to;

    let numbers = await base44.asServiceRole.entities.VirtualNumber.filter({ phone_number: toNorm });
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
    if (!numbers || numbers.length === 0) {
      console.warn(`[smsIncomingWebhook] No owner for virtual number ${to}`);
      return twimlOk;
    }

    const virtualNumber = numbers[0];

    // ── Tenant authorization: verify the number is active ──
    if (virtualNumber.status && virtualNumber.status !== 'active') {
      console.warn(`[smsIncomingWebhook] VirtualNumber ${to} is ${virtualNumber.status}, not accepting inbound`);
      return twimlOk;
    }

    let ownerEmail = virtualNumber.customer_email || null;
    if (!ownerEmail && virtualNumber.userId) {
      const users = await base44.asServiceRole.entities.User.filter({ id: virtualNumber.userId });
      if (users && users.length > 0) ownerEmail = users[0].email;
    }

    if (ownerEmail) {
      // Dedup check
      const existing = await base44.asServiceRole.entities.Message.filter({ provider_message_id: messageSid });
      if (!existing || existing.length === 0) {
        await base44.asServiceRole.entities.Message.create({
          user_email: ownerEmail,
          our_number: to,
          from_number: from,
          to_number: to,
          body: messageBody,
          direction: 'inbound',
          status: 'received',
          provider_message_id: messageSid,
        });
        console.log(`[smsIncomingWebhook] Saved inbound SMS for ${ownerEmail}`);
      } else {
        console.log(`[smsIncomingWebhook] Duplicate SID ${messageSid}, skipping`);
      }

      // ── Auto-reply: use centralized sender resolution ──
      try {
        const autoReplies = await base44.asServiceRole.entities.AutoReplyTemplate.filter({
          virtual_number: to,
          user_email: ownerEmail,
          enabled: true,
        });
        if (autoReplies && autoReplies.length > 0) {
          const replyMsg = autoReplies[0].message;
          const senderNumber = virtualNumber.phone_number || virtualNumber.number;

          // Normalize the recipient (original sender) for the reply
          const replyDestCheck = normalizeE164(from);
          if (!replyDestCheck.isValid) {
            console.warn(`[smsIncomingWebhook] Cannot normalize auto-reply destination ${from}: ${replyDestCheck.error}`);
            return twimlOk;
          }

          const { accountSid, authToken } = getTwilioCredentials();
          await sendSmsViaTwilio(accountSid, authToken, senderNumber, replyDestCheck.normalized, replyMsg);
          console.log(`[smsIncomingWebhook] Auto-replied from ${senderNumber} to ${replyDestCheck.normalized}`);
        }
      } catch (e) {
        console.warn('[smsIncomingWebhook] Auto-reply error:', e.message);
      }
    }

    return twimlOk;
  } catch (error) {
    console.error('[smsIncomingWebhook] Error:', error.message);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response/>`, {
      headers: { 'Content-Type': 'application/xml' },
    });
  }
});