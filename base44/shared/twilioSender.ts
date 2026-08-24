/**
 * Centralized Twilio sender resolution, E.164 normalization, and
 * destination-aware SMS routing compliance.
 *
 * Used by every SMS path (sendSms, auto-replies, notifications, automations)
 * and by outbound Voice functions to ensure tenant isolation.
 *
 * Rules:
 *  - SMS/MMS: uses Messaging Service SID (MG0207…) for service-level routing/compliance,
 *    while explicitly setting From to the customer's assigned Twilio-owned VirtualNumber.
 *  - Voice: callerId must be the customer's assigned voice-capable Twilio number.
 *  - Never allows one tenant to use or expose another tenant's number.
 *  - Rejects sends when the user has no active eligible number.
 *  - Destination-aware routing: Ghana (+233) blocked for two-way SMS;
 *    US/Canada (+1) allowed with Messaging Service + A2P registration.
 *  - All Twilio secrets stay server-side (read via Deno.env).
 */

export const MESSAGING_SERVICE_SID = 'MG0207e08e81743254fd048084185ce7c7';

/**
 * Custom error for sender resolution failures.
 */
export class SenderResolutionError extends Error {
  constructor(message, code = 'SENDER_RESOLUTION_FAILED') {
    super(message);
    this.name = 'SenderResolutionError';
    this.code = code;
  }
}

/**
 * Custom error for SMS routing compliance failures.
 */
export class SmsRouteError extends Error {
  constructor(message, code, destinationCountry) {
    super(message);
    this.name = 'SmsRouteError';
    this.code = code;
    this.destinationCountry = destinationCountry;
  }
}

/**
 * Get Twilio credentials from server-side env vars.
 * Throws if credentials are missing.
 */
export function getTwilioCredentials() {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  if (!accountSid || !authToken) {
    throw new SenderResolutionError(
      'Twilio credentials not configured on the server',
      'TWILIO_NOT_CONFIGURED'
    );
  }
  return { accountSid, authToken };
}

/**
 * Normalize a phone number to strict E.164 format.
 *
 * US/Canada (NANP): normalizes to +1 + 10 digits.
 *   - "6175551234"       → "+16175551234"
 *   - "16175551234"      → "+16175551234"
 *   - "617-555-1234"     → "+16175551234"
 *   - "+16175551234"     → "+16175551234" (already valid)
 * International: preserves valid E.164 (+ and 7-15 digits, non-NANP).
 *   - "+233244123456"    → "+233244123456" (Ghana)
 *   - "+447911123456"    → "+447911123456" (UK)
 *
 * Returns { normalized, isValid, error }.
 * Does NOT silently drop +1 destinations — returns actionable errors.
 */
export function normalizeE164(phone) {
  if (!phone || typeof phone !== 'string') {
    return { normalized: null, isValid: false, error: 'Phone number is required' };
  }

  const trimmed = phone.trim();
  if (!trimmed) {
    return { normalized: null, isValid: false, error: 'Phone number is empty' };
  }

  // Strip all non-digit, non-leading-+ characters
  const hasPlus = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/\D/g, '');

  if (!digitsOnly) {
    return { normalized: null, isValid: false, error: 'Phone number contains no digits' };
  }

  // ── Already E.164 with leading + ──
  if (hasPlus) {
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      return { normalized: null, isValid: false, error: `Invalid E.164 length (${digitsOnly.length} digits)` };
    }
    // NANP: +1 followed by exactly 10 digits
    if (digitsOnly.startsWith('1') && digitsOnly.length === 11) {
      return { normalized: `+${digitsOnly}`, isValid: true, error: null };
    }
    // Non-NANP international — preserve as-is
    return { normalized: `+${digitsOnly}`, isValid: true, error: null };
  }

  // ── No leading + ──
  // NANP: 10 digits (area code + number)
  if (digitsOnly.length === 10) {
    if (digitsOnly[0] === '0' || digitsOnly[0] === '1') {
      return { normalized: null, isValid: false, error: 'Invalid NANP area code (cannot start with 0 or 1)' };
    }
    return { normalized: `+1${digitsOnly}`, isValid: true, error: null };
  }

  // NANP: 11 digits starting with 1
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return { normalized: `+${digitsOnly}`, isValid: true, error: null };
  }

  // Other lengths without +: ambiguous — could be missing country code
  // For safety, treat as international if length is 7-15 and prepend +
  if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
    return { normalized: `+${digitsOnly}`, isValid: true, error: null };
  }

  return {
    normalized: null,
    isValid: false,
    error: `Cannot normalize to E.164: ${digitsOnly.length} digits (no country code)`,
  };
}

/**
 * Strictly normalize a US/Canada destination.
 * Used by Voice functions where we want actionable errors for invalid NANP numbers.
 * Returns { normalized, isValid, error }.
 */
export function normalizeUSCanadaE164(phone) {
  if (!phone || typeof phone !== 'string') {
    return { normalized: null, isValid: false, error: 'Phone number is required' };
  }

  const trimmed = phone.trim();
  const digitsOnly = trimmed.replace(/\D/g, '');

  if (!digitsOnly) {
    return { normalized: null, isValid: false, error: 'No digits in phone number' };
  }

  // 10 digits → prepend +1
  if (digitsOnly.length === 10) {
    if (digitsOnly[0] === '0' || digitsOnly[0] === '1') {
      return { normalized: null, isValid: false, error: 'Invalid NANP area code' };
    }
    return { normalized: `+1${digitsOnly}`, isValid: true, error: null };
  }

  // 11 digits starting with 1 → prepend +
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return { normalized: `+${digitsOnly}`, isValid: true, error: null };
  }

  // Already has +1 prefix
  if (trimmed.startsWith('+1') && digitsOnly.length === 11) {
    return { normalized: `+${digitsOnly}`, isValid: true, error: null };
  }

  return {
    normalized: null,
    isValid: false,
    error: `US/Canada number must be 10 digits or 11 digits starting with 1 (got ${digitsOnly.length} digits)`,
  };
}

/**
 * Detect the destination country from an E.164 number.
 * Returns ISO country code or 'INTERNATIONAL' / 'UNKNOWN'.
 */
export function detectDestinationCountry(e164) {
  if (!e164 || typeof e164 !== 'string') return 'UNKNOWN';
  const digits = e164.replace(/\D/g, '');
  if (digits.startsWith('1') && digits.length === 11) return 'US/CA';
  if (digits.startsWith('233')) return 'GH';
  if (digits.startsWith('44')) return 'GB';
  if (digits.startsWith('234')) return 'NG';
  if (digits.startsWith('91')) return 'IN';
  if (digits.startsWith('234')) return 'NG';
  if (digits.startsWith('27')) return 'ZA';
  if (digits.startsWith('61')) return 'AU';
  if (digits.startsWith('33')) return 'FR';
  if (digits.startsWith('49')) return 'DE';
  if (digits.startsWith('81')) return 'JP';
  if (digits.startsWith('86')) return 'CN';
  if (digits.startsWith('55')) return 'BR';
  if (digits.startsWith('52')) return 'MX';
  if (digits.startsWith('971')) return 'AE';
  if (digits.startsWith('966')) return 'SA';
  if (digits.startsWith('92')) return 'PK';
  if (digits.startsWith('880')) return 'BD';
  if (digits.startsWith('62')) return 'ID';
  if (digits.startsWith('63')) return 'PH';
  if (digits.startsWith('66')) return 'TH';
  if (digits.startsWith('84')) return 'VN';
  if (digits.startsWith('7')) return 'RU/KZ';
  if (digits.length >= 7 && digits.length <= 15) return 'INTERNATIONAL';
  return 'UNKNOWN';
}

/**
 * Destination-aware SMS route validation.
 *
 * Enforces compliance rules for Twilio SMS routing:
 *  - Ghana (+233): BLOCKED — Twilio does not support two-way SMS to Ghana with
 *    numeric international senders. A registered Ghana alphanumeric Sender ID
 *    is required for outbound Ghana SMS. Inbound Ghana SMS is unsupported.
 *    (Twilio error 21612 = unsupported To/From combination)
 *  - US/Canada (+1): ALLOWED — uses customer's assigned active number +
 *    Messaging Service SID, subject to A2P 10DLC registration.
 *  - Other international: ALLOWED — may have carrier-specific restrictions.
 *
 * @param {string} from - Sender number (E.164 or raw)
 * @param {string} to   - Destination number (E.164 or raw)
 * @returns {{ allowed: boolean, error: string|null, reason: string, destinationCountry: string, note: string|null }}
 */
export function validateSmsRoute(from, to) {
  const destCheck = normalizeE164(to);
  if (!destCheck.isValid) {
    return {
      allowed: false,
      error: `Invalid destination number: ${destCheck.error}`,
      reason: 'INVALID_DESTINATION',
      destinationCountry: 'UNKNOWN',
      note: null,
    };
  }
  const toE164 = destCheck.normalized;
  const country = detectDestinationCountry(toE164);

  // ── Ghana (+233): BLOCKED for two-way SMS ──
  // Twilio error 21612: The 'To' and 'From' combination is not supported for this message.
  // Ghana requires a registered alphanumeric Sender ID for outbound SMS.
  // Inbound Ghana SMS is unsupported.
  if (toE164.startsWith('+233')) {
    return {
      allowed: false,
      error: 'A registered Ghana alphanumeric Sender ID is required for outbound Ghana SMS. Inbound Ghana SMS is unsupported. Please contact support to configure a Ghana alphanumeric Sender ID for this destination.',
      reason: 'GHANA_REQUIRES_ALPHANUMERIC_SENDER_ID',
      destinationCountry: 'GH',
      note: 'Twilio does not support two-way SMS to Ghana with numeric international senders (error 21612).',
    };
  }

  // ── US/Canada (+1): ALLOWED with Messaging Service + A2P ──
  if (toE164.startsWith('+1')) {
    return {
      allowed: true,
      error: null,
      reason: 'US_CANADA_ROUTE',
      destinationCountry: 'US/CA',
      note: 'Uses customer assigned active number + Messaging Service SID. Subject to A2P 10DLC registration.',
    };
  }

  // ── Other international: ALLOWED (carrier restrictions may apply) ──
  return {
    allowed: true,
    error: null,
    reason: 'INTERNATIONAL_ROUTE',
    destinationCountry: country,
    note: 'International SMS may have carrier-specific restrictions. Delivery not guaranteed.',
  };
}

/**
 * Resolve the sender (From) VirtualNumber for a given user.
 *
 * Queries VirtualNumber by userId AND customer_email (belt-and-suspenders),
 * filters for status === 'active', and optionally checks sms_enabled / voice_enabled.
 *
 * @param {object} base44 - The service-role base44 client (base44.asServiceRole)
 * @param {object} user   - The authenticated user object ({ id, email })
 * @param {object} opts   - { requireSms: bool, requireVoice: bool }
 * @returns {Promise<object>} The VirtualNumber entity
 * @throws {SenderResolutionError} if no eligible number is found
 */
export async function resolveSenderNumber(base44, user, opts = {}) {
  const { requireSms = false, requireVoice = false } = opts;

  if (!user || !user.id || !user.email) {
    throw new SenderResolutionError(
      'Authenticated user context required for sender resolution',
      'AUTH_REQUIRED'
    );
  }

  // Query by userId (primary) — status must be active
  let numbers = await base44.entities.VirtualNumber.filter({
    userId: user.id,
    status: 'active',
  });

  // Fallback: query by customer_email (legacy field)
  if (!numbers || numbers.length === 0) {
    numbers = await base44.entities.VirtualNumber.filter({
      customer_email: user.email,
      status: 'active',
    });
  }

  if (!numbers || numbers.length === 0) {
    console.error(
      `[twilioSender] No active VirtualNumber for user ${user.email} (id: ${user.id})`
    );
    throw new SenderResolutionError(
      'No active virtual number assigned to your account. Please purchase or activate a virtual number before sending messages or making calls.',
      'NO_ACTIVE_NUMBER'
    );
  }

  // Filter by capability if required
  let eligible = numbers;
  if (requireSms) {
    eligible = eligible.filter((n) => n.sms_enabled !== false);
  }
  if (requireVoice) {
    eligible = eligible.filter((n) => n.voice_enabled !== false);
  }

  if (eligible.length === 0) {
    const cap = requireSms && requireVoice
      ? 'SMS and voice'
      : requireSms
        ? 'SMS'
        : requireVoice
          ? 'voice'
          : 'active';
    console.error(
      `[twilioSender] User ${user.email} has numbers but none with ${cap} capability enabled`
    );
    throw new SenderResolutionError(
      `Your virtual number does not have ${cap.toLowerCase()} capability enabled. Please contact support.`,
      'NO_CAPABLE_NUMBER'
    );
  }

  // Prefer Twilio-owned numbers
  const twilioOwned = eligible.find(
    (n) => !n.provider || n.provider === 'twilio'
  );
  const chosen = twilioOwned || eligible[0];

  // Ensure the number field is populated
  const senderNumber = chosen.phone_number || chosen.number;
  if (!senderNumber) {
    throw new SenderResolutionError(
      'Resolved VirtualNumber has no phone_number or number field',
      'NUMBER_FIELD_MISSING'
    );
  }

  console.log(
    `[twilioSender] Resolved sender ${senderNumber} for ${user.email} (id: ${chosen.id}, sms: ${chosen.sms_enabled}, voice: ${chosen.voice_enabled})`
  );

  return { ...chosen, resolvedNumber: senderNumber };
}

/**
 * Validate that a callerId belongs to the authenticated user.
 * Used by Voice functions to prevent cross-tenant callerId spoofing.
 *
 * @param {object} base44 - The service-role base44 client
 * @param {string} callerId - The callerId phone number to validate
 * @param {object} user - The authenticated user ({ id, email })
 * @returns {Promise<{ valid: boolean, virtualNumber: object|null, error: string|null }>}
 */
export async function validateCallerIdOwnership(base44, callerId, user) {
  if (!callerId) {
    return { valid: false, virtualNumber: null, error: 'No callerId provided' };
  }

  // Normalize the callerId for comparison
  const { normalized } = normalizeE164(callerId);
  const callerDigits = callerId.replace(/\D/g, '');

  // Query VirtualNumber by userId + status active
  const numbers = await base44.entities.VirtualNumber.filter({
    userId: user.id,
    status: 'active',
  });

  // Also check by email if userId query returns nothing
  let allNumbers = numbers || [];
  if (allNumbers.length === 0) {
    const emailNumbers = await base44.entities.VirtualNumber.filter({
      customer_email: user.email,
      status: 'active',
    });
    allNumbers = emailNumbers || [];
  }

  if (allNumbers.length === 0) {
    return {
      valid: false,
      virtualNumber: null,
      error: 'No active virtual number assigned to your account',
    };
  }

  // Match by digits (handles +/no-plus variations)
  const match = allNumbers.find((n) => {
    const numDigits = (n.phone_number || n.number || '').replace(/\D/g, '');
    return numDigits === callerDigits ||
      numDigits.endsWith(callerDigits) ||
      callerDigits.endsWith(numDigits);
  });

  if (!match) {
    console.error(
      `[twilioSender] CALLERID TENANT VIOLATION: callerId ${callerId} does not belong to user ${user.email}`
    );
    return {
      valid: false,
      virtualNumber: null,
      error: 'The specified callerId does not belong to your account',
    };
  }

  // Check voice capability
  if (match.voice_enabled === false) {
    return {
      valid: false,
      virtualNumber: match,
      error: 'Your virtual number does not have voice capability enabled',
    };
  }

  const resolvedNumber = match.phone_number || match.number;
  return { valid: true, virtualNumber: match, resolvedNumber, error: null };
}

/**
 * Send an SMS via Twilio using the Messaging Service SID for routing/compliance
 * and explicitly setting From to the customer's assigned VirtualNumber.
 *
 * @param {string} accountSid
 * @param {string} authToken
 * @param {string} fromNumber - The customer's assigned VirtualNumber (E.164)
 * @param {string} toNumber   - Destination (E.164)
 * @param {string} body       - Message body
 * @param {string} messagingServiceSid - The Messaging Service SID
 * @returns {Promise<{ success: boolean, messageSid: string, provider: string, status: string }>}
 */
export async function sendSmsViaTwilio(
  accountSid,
  authToken,
  fromNumber,
  toNumber,
  body,
  messagingServiceSid = MESSAGING_SERVICE_SID
) {
  const auth = btoa(`${accountSid}:${authToken}`);

  const params = {
    To: toNumber,
    Body: body,
  };

  // Explicitly set From to the customer's assigned number for deterministic sender identity.
  // MessagingServiceSid provides service-level routing/compliance (sticky sender, A2P 10DLC).
  // When both are set, Twilio uses From as the sender, validated against the Messaging Service.
  if (fromNumber) {
    params.From = fromNumber;
  }
  if (messagingServiceSid) {
    params.MessagingServiceSid = messagingServiceSid;
  }

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params),
    }
  );

  const data = await res.json();
  if (!res.ok) {
    console.error(
      `[twilioSender] Twilio SMS error: ${JSON.stringify({ code: data.code, message: data.message, moreInfo: data.more_info, status: data.status })}`
    );
    return {
      success: false,
      messageSid: data.sid || null,
      provider: 'twilio',
      status: 'failed',
      errorCode: data.code ? String(data.code) : null,
      errorMessage: data.message || `Twilio SMS failed (code ${data.code || 'unknown'})`,
    };
  }

  // API success ≠ delivered. The message is queued; delivery is confirmed via status callback.
  return {
    success: true,
    messageSid: data.sid,
    provider: 'twilio',
    status: 'pending', // queued/sending — not delivered yet
    errorCode: null,
    errorMessage: null,
  };
}