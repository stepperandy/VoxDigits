/**
 * Twilio SMS status callback webhook.
 * PUBLIC endpoint — called by Twilio, NO Base44 user authentication.
 *
 * Compliance:
 *  - Parses application/x-www-form-urlencoded body
 *  - Returns HTTP 200 promptly with valid TwiML
 *  - Updates Message status via provider_message_id (Twilio Message SID)
 *  - Handles ErrorCode (e.g., 21612, 11200) — marks message as failed
 *  - API success ≠ delivered; only mark 'delivered' when callback confirms
 *  - Logs MessageSid, MessageStatus, ErrorCode, To, From (no secrets)
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const EMPTY_TWIML = '<?xml version="1.0" encoding="UTF-8"?><Response/>';

const twimlResponse = () => new Response(EMPTY_TWIML, {
  status: 200,
  headers: { 'Content-Type': 'text/xml; charset=UTF-8' },
});

/**
 * Map Twilio message status to our Message entity status.
 * - queued/sending/accepted/sent → pending/sent (not delivered yet)
 * - delivered → delivered
 * - failed/undelivered → failed
 */
function mapTwilioStatus(twilioStatus, errorCode) {
  // If there's an error code, it's a failure regardless of status
  if (errorCode) {
    return 'failed';
  }
  switch (twilioStatus) {
    case 'delivered':
      return 'delivered';
    case 'sent':
      return 'sent';
    case 'queued':
    case 'sending':
    case 'accepted':
      return 'pending';
    case 'failed':
    case 'undelivered':
      return 'failed';
    case 'read':
      return 'read';
    default:
      return 'pending';
  }
}

Deno.serve(async (req) => {
  let messageSid = '';
  let messageStatus = '';
  let errorCode = '';
  let from = '';
  let to = '';

  try {
    // ── Parse application/x-www-form-urlencoded body ──
    const text = await req.text();
    const params = new URLSearchParams(text);

    messageSid    = params.get('MessageSid') || params.get('SmsSid') || '';
    messageStatus = params.get('MessageStatus') || params.get('SmsStatus') || '';
    errorCode     = params.get('ErrorCode') || params.get('ErrorCode') || '';
    from          = params.get('From') || '';
    to            = params.get('To') || '';

    console.log(
      `[smsStatusWebhook] Sid=${messageSid} Status=${messageStatus} ErrorCode=${errorCode || 'none'} From=${from} To=${to}`
    );

    if (!messageSid) {
      console.warn('[smsStatusWebhook] No MessageSid in callback');
      return twimlResponse();
    }

    // ── Update Message entity via provider_message_id (Twilio SID) ──
    const base44 = createClientFromRequest(req);

    try {
      const messages = await base44.asServiceRole.entities.Message.filter({
        provider_message_id: messageSid,
      });

      if (messages && messages.length > 0) {
        const msg = messages[0];
        const finalStatus = mapTwilioStatus(messageStatus, errorCode);

        const updateData = {
          status: finalStatus,
        };

        // Set delivered_at only when actually delivered
        if (finalStatus === 'delivered') {
          updateData.delivered_at = new Date().toISOString();
        }

        // Persist error code and message if present
        if (errorCode) {
          updateData.error_code = errorCode;
          updateData.error_message = getErrorDescription(errorCode);
        }

        await base44.asServiceRole.entities.Message.update(msg.id, updateData);

        console.log(
          `[smsStatusWebhook] Updated message ${msg.id}: ${finalStatus}${errorCode ? ` (error: ${errorCode})` : ''}`
        );
      } else {
        console.warn(`[smsStatusWebhook] Message not found for SID: ${messageSid}`);
      }
    } catch (dbErr) {
      console.error(`[smsStatusWebhook] DB update error: ${dbErr.message}`);
    }
  } catch (error) {
    console.error(
      `[smsStatusWebhook] Error: Sid=${messageSid} Status=${messageStatus} ErrorCode=${errorCode} — ${error.message}`
    );
  }

  // ── Always return 200 with valid TwiML ──
  return twimlResponse();
});

/**
 * Human-readable descriptions for common Twilio error codes.
 * Used to persist actionable error messages on the Message entity.
 */
function getErrorDescription(code) {
  const descriptions = {
    '21612': 'The To and From combination is not supported for this message. A registered alphanumeric Sender ID may be required for this destination.',
    '11200': 'HTTP retrieval failure — the webhook endpoint did not return a valid response.',
    '21211': 'Invalid phone number format.',
    '21408': 'Permission denied for this destination.',
    '21610': 'Attempt to send to a blocked number.',
    '21614': 'To number is not a valid mobile number.',
    '30001': 'Queue overflow — too many messages queued.',
    '30002': 'Account suspended.',
    '30003': 'Unreachable destination handset.',
    '30004': 'Message blocked by recipient.',
    '30005': 'Unknown destination handset.',
    '30006': 'Landline number — cannot receive SMS.',
    '30007': 'Carrier violation — message content rejected.',
    '30008': 'Unknown error from carrier.',
  };
  return descriptions[code] || `Twilio error code ${code}`;
}