import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import {
  normalizeE164,
  normalizeUSCanadaE164,
  validateCallerIdOwnership,
} from '../../shared/twilioSender.ts';

const xml = (body) => new Response(body, {
  status: 200,
  headers: { 'Content-Type': 'text/xml; charset=utf-8' },
});

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  let params;
  try {
    const text = await req.text();
    params = new URLSearchParams(text);
    const allParams = {};
    for (const [k, v] of params.entries()) allParams[k] = v;
    console.log('[voiceWebhook] ALL PARAMS:', JSON.stringify(allParams));
  } catch (e) {
    console.error('[voiceWebhook] Parse error:', e.message);
    return xml(`<?xml version="1.0" encoding="UTF-8"?><Response><Say>Parse error</Say></Response>`);
  }

  const from           = params.get('From') || '';
  const direction      = params.get('Direction') || '';
  const stdTo          = params.get('To') || '';
  const callerId       = params.get('callerId') || params.get('CallerId') || '';
  const callStatus     = params.get('CallStatus') || '';
  const callbackSource = params.get('CallbackSource') || '';

  console.log(`[voiceWebhook] From=${from} | To=${stdTo} | Direction=${direction} | callerId=${callerId} | CallStatus=${callStatus}`);

  // ── STATUS CALLBACKS: ignore them ──
  if (callbackSource || ['completed', 'busy', 'failed', 'no-answer', 'canceled'].includes(callStatus)) {
    console.log('[voiceWebhook] Status callback received, ignoring:', callStatus);
    return xml(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`);
  }

  // ── OUTBOUND: From is a browser client identity (client:xxx) ──
  if (from.startsWith('client:')) {
    let dest = stdTo.trim();
    if (!dest || dest.startsWith('AP')) {
      dest = (params.get('PhoneNumber') || '').trim();
      console.log('[voiceWebhook] OUTBOUND — To was TwiML SID, using PhoneNumber param:', dest);
    }

    if (!dest) {
      console.error('[voiceWebhook] OUTBOUND — To is empty');
      return xml(`<?xml version="1.0" encoding="UTF-8"?><Response><Say>No destination number provided.</Say></Response>`);
    }

    // ── Normalize destination to strict E.164 ──
    // US/Canada: normalize to +1XXXXXXXXXX (never drop +1)
    // International: preserve valid E.164
    let destE164 = null;
    let destError = null;

    const destCheck = normalizeE164(dest);
    if (destCheck.isValid) {
      destE164 = destCheck.normalized;
    } else {
      destError = destCheck.error;
    }

    if (!destE164) {
      console.error(`[voiceWebhook] OUTBOUND — cannot normalize destination "${dest}": ${destError}`);
      return xml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">The destination number is invalid. Please check the number and try again.</Say>
</Response>`);
    }

    console.log(`[voiceWebhook] OUTBOUND — normalized destination: ${dest} → ${destE164}`);

    // ── Validate callerId belongs to the user (tenant isolation) ──
    // Extract user identity from client:xxx format
    // The identity is the user's email sanitized (email.replace(/[@.]/g, '_'))
    // We need to resolve the actual user to validate callerId ownership
    let finalCallerId = '';

    if (callerId && !callerId.startsWith('client:')) {
      // Resolve the user from the client identity
      const clientIdentity = from.replace('client:', '');
      // Reverse the identity sanitization: foo_bar_com → foo@bar.com
      // This is a best-effort — we query VirtualNumber by the callerId to find the owner
      let ownerUser = null;
      try {
        const callerDigits = callerId.replace(/\D/g, '');
        let callerVnums = await base44.asServiceRole.entities.VirtualNumber.filter({ phone_number: callerId });
        if (!callerVnums || callerVnums.length === 0) {
          callerVnums = await base44.asServiceRole.entities.VirtualNumber.filter({ number: callerId });
        }
        if (!callerVnums || callerVnums.length === 0) {
          const allNums = await base44.asServiceRole.entities.VirtualNumber.list('-created_date', 200);
          callerVnums = (allNums || []).filter((n) => {
            const nd = (n.phone_number || n.number || '').replace(/\D/g, '');
            return nd === callerDigits || nd.endsWith(callerDigits) || callerDigits.endsWith(nd);
          });
        }

        if (callerVnums && callerVnums.length > 0) {
          const vnum = callerVnums[0];
          // Verify the number is active and voice-capable
          if (vnum.status && vnum.status !== 'active') {
            console.error(`[voiceWebhook] OUTBOUND — callerId ${callerId} is ${vnum.status}`);
            return xml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Your virtual number is not active. Please contact support.</Say>
</Response>`);
          }
          if (vnum.voice_enabled === false) {
            console.error(`[voiceWebhook] OUTBOUND — callerId ${callerId} has no voice capability`);
            return xml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Your virtual number does not have voice capability enabled.</Say>
</Response>`);
          }

          // Verify the client identity matches the number owner
          let ownerEmail = vnum.customer_email || '';
          if (!ownerEmail && vnum.userId) {
            const users = await base44.asServiceRole.entities.User.filter({ id: vnum.userId });
            if (users && users.length > 0) ownerEmail = users[0].email || '';
          }
          if (ownerEmail) {
            const expectedIdentity = ownerEmail.replace(/[@.]/g, '_');
            if (expectedIdentity !== clientIdentity) {
              console.error(
                `[voiceWebhook] TENANT VIOLATION: client identity ${clientIdentity} does not match callerId owner ${ownerEmail} (expected identity: ${expectedIdentity})`
              );
              return xml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Caller ID verification failed. Please contact support.</Say>
</Response>`);
            }
          }

          finalCallerId = vnum.phone_number || vnum.number || callerId;
        } else {
          console.error(`[voiceWebhook] OUTBOUND — callerId ${callerId} not found in VirtualNumber records`);
          return xml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">The caller ID is not recognized. Please contact support.</Say>
</Response>`);
        }
      } catch (e) {
        console.warn('[voiceWebhook] CallerId validation error:', e.message);
      }
    } else {
      console.error('[voiceWebhook] OUTBOUND — no callerId provided or callerId is client identity');
      return xml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">No caller ID configured. Please contact support.</Say>
</Response>`);
    }

    console.log(`[voiceWebhook] OUTBOUND — dialing ${destE164} with callerId=${finalCallerId}`);

    // ── Check wallet balance — block outgoing calls if insufficient ──
    try {
      let callerVnums = await base44.asServiceRole.entities.VirtualNumber.filter({ phone_number: finalCallerId });
      if (!callerVnums || callerVnums.length === 0) {
        callerVnums = await base44.asServiceRole.entities.VirtualNumber.filter({ number: finalCallerId });
      }
      if (callerVnums && callerVnums.length > 0) {
        const callerEmail = callerVnums[0].customer_email || '';
        if (callerEmail) {
          const users = await base44.asServiceRole.entities.User.filter({ email: callerEmail });
          if (users && users.length > 0) {
            const balance = users[0].credits || 0;
            if (balance < 0.03) {
              console.log(`[voiceWebhook] OUTBOUND blocked — insufficient balance for ${callerEmail}: $${balance}`);
              return xml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Your account balance is insufficient to make outgoing calls. Please add calling credit to your account.</Say>
</Response>`);
            }
          }
        }
      }
    } catch (e) {
      console.warn('[voiceWebhook] Balance check error:', e.message);
    }

    return xml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${finalCallerId}" timeout="30">
    <Number>${destE164}</Number>
  </Dial>
</Response>`);
  }

  // ── INBOUND: a real PSTN call to one of our Twilio numbers ──
  if (!from.match(/^[+\d]/)) {
    console.warn('[voiceWebhook] Unexpected From format, ignoring:', from);
    return xml(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`);
  }
  console.log('[voiceWebhook] INBOUND — to:', stdTo);

  const inboundCheck = normalizeE164(stdTo);
  const toNormalized = inboundCheck.normalized || stdTo.trim();

  if (!toNormalized) {
    console.error('[voiceWebhook] INBOUND but To is empty');
    return xml(`<?xml version="1.0" encoding="UTF-8"?><Response><Say>Number not found.</Say></Response>`);
  }

  try {
    // Find virtual number owner — always use service role (no user auth on Twilio webhooks)
    let vnums = await base44.asServiceRole.entities.VirtualNumber.filter({ phone_number: toNormalized });
    if (!vnums || vnums.length === 0) {
      vnums = await base44.asServiceRole.entities.VirtualNumber.filter({ number: toNormalized });
    }
    if (!vnums || vnums.length === 0) {
      const toNoPlus = toNormalized.replace(/^\+/, '');
      vnums = await base44.asServiceRole.entities.VirtualNumber.filter({ phone_number: toNoPlus });
    }
    if (!vnums || vnums.length === 0) {
      const toNoPlus = toNormalized.replace(/^\+/, '');
      vnums = await base44.asServiceRole.entities.VirtualNumber.filter({ number: toNoPlus });
    }
    if (!vnums || vnums.length === 0) {
      const toDigits = toNormalized.replace(/\D/g, '');
      console.log('[voiceWebhook] Falling back to full scan for digits:', toDigits);
      const allNums = await base44.asServiceRole.entities.VirtualNumber.list('-created_date', 200);
      vnums = (allNums || []).filter((n) => {
        const nd = (n.phone_number || n.number || '').replace(/\D/g, '');
        return nd === toDigits || nd.endsWith(toDigits) || toDigits.endsWith(nd);
      });
    }

    if (!vnums || vnums.length === 0) {
      console.warn('[voiceWebhook] No VirtualNumber for:', toNormalized);
      return xml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>This number is not in service.</Say>
</Response>`);
    }

    const vnum = vnums[0];

    // ── Tenant authorization: verify the number is active ──
    if (vnum.status && vnum.status !== 'active') {
      console.warn(`[voiceWebhook] INBOUND — VirtualNumber ${toNormalized} is ${vnum.status}`);
      return xml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>This number is not in service.</Say>
</Response>`);
    }

    let ownerEmail = vnum.customer_email || '';
    console.log('[voiceWebhook] Found VirtualNumber:', JSON.stringify({ id: vnum.id, number: vnum.number, phone_number: vnum.phone_number, customer_email: vnum.customer_email, userId: vnum.userId, status: vnum.status }));

    if (!ownerEmail && vnum.userId) {
      const users = await base44.asServiceRole.entities.User.filter({ id: vnum.userId });
      if (users && users.length > 0) ownerEmail = users[0].email || '';
    }

    if (!ownerEmail) {
      console.error('[voiceWebhook] Cannot resolve owner for:', toNormalized);
      return xml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Unable to route this call.</Say>
</Response>`);
    }

    const identity = ownerEmail.replace(/[@.]/g, '_');
    console.log('[voiceWebhook] Resolved ownerEmail:', ownerEmail, '→ identity:', identity);

    // Check call forwarding rules
    let forwardingRules = [];
    try {
      forwardingRules = await base44.asServiceRole.entities.CallForwardingRule.filter({
        virtual_number: toNormalized,
        user_email: ownerEmail,
        enabled: true,
      });
    } catch (e) {
      console.warn('[voiceWebhook] Forwarding rules lookup error:', e.message);
    }

    const appId = Deno.env.get('BASE44_APP_ID') || '';
    const voicemailUrl = `https://app--${appId}.base44.app/api/apps/${appId}/functions/voicemailHandler?RetryCount=0`;

    if (forwardingRules && forwardingRules.length > 0) {
      const rule = forwardingRules[0];
      const forwardTo = rule.forwarding_number;
      const ringTimeout = rule.ring_timeout || 30;

      console.log('[voiceWebhook] Forwarding to:', forwardTo);

      if (rule.forward_unanswered_only) {
        return xml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial timeout="${ringTimeout}" action="${voicemailUrl}" method="POST" callerId="${from}">
    <Client>${identity}</Client>
    <Number>${forwardTo}</Number>
  </Dial>
</Response>`);
      } else {
        return xml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial timeout="${ringTimeout}" callerId="${from}">
    <Number>${forwardTo}</Number>
  </Dial>
</Response>`);
      }
    }

    // Default: ring the browser client, fall back to voicemail
    return xml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial timeout="30" action="${voicemailUrl}" method="POST" callerId="${from}">
    <Client>${identity}</Client>
  </Dial>
</Response>`);

  } catch (e) {
    console.error('[voiceWebhook] Exception:', e.message);
    return xml(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>A system error occurred. Please try again.</Say>
</Response>`);
  }
});