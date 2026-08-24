/**
 * Admin-only: blast an email to all registered app users (or a segment).
 *
 *  - Auth + admin/super_admin role check.
 *  - Lists registered users (User entity) in batches (handles >1000 users),
 *    optionally filtered to users with an active Subscription.
 *  - Sends one email per recipient via the SendEmail integration, in parallel
 *    chunks to stay within time limits.
 *  - Returns a summary: sent, failed, total, and up to 20 sample errors.
 *  - CORS-aware (OPTIONS preflight + headers on all responses).
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.39';

const CHUNK_SIZE = 20;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return Response.json({ success: false, error: 'Admin access required' }, { status: 403, headers: CORS });
    }

    const { subject, body, segment, from_name } = await req.json().catch(() => ({}));
    if (!subject || !body) {
      return Response.json(
        { success: false, error: 'Subject and body are required' },
        { status: 400, headers: CORS }
      );
    }

    // ── Fetch all registered users in batches of 500 ──
    const allUsers = [];
    let batch = await base44.asServiceRole.entities.User.list('-created_date', 500);
    allUsers.push(...(batch || []));
    let guard = 0;
    while (batch && batch.length === 500 && guard < 40) {
      batch = await base44.asServiceRole.entities.User.list('-created_date', 500);
      allUsers.push(...(batch || []));
      guard++;
    }

    let recipients = (allUsers || []).map((u) => u.email).filter(Boolean);

    // ── Optional segment: active subscribers only ──
    if (segment === 'active_subscribers') {
      const subs = await base44.asServiceRole.entities.Subscription.filter(
        { status: 'active' },
        '-created_date',
        1000
      );
      const activeEmails = new Set(
        (subs || []).map((s) => s.user_email).filter(Boolean)
      );
      recipients = recipients.filter((e) => activeEmails.has(e));
    }

    // Dedupe
    recipients = Array.from(new Set(recipients));

    if (recipients.length === 0) {
      return Response.json(
        { success: false, error: 'No recipients found for the selected segment.' },
        { status: 400, headers: CORS }
      );
    }

    console.log(`[broadcastEmail] Blasting to ${recipients.length} recipients (segment=${segment || 'all'})`);

    let sent = 0;
    let failed = 0;
    const errors = [];

    const senderName = from_name || 'VoxTelephony';

    for (let i = 0; i < recipients.length; i += CHUNK_SIZE) {
      const chunk = recipients.slice(i, i + CHUNK_SIZE);
      await Promise.all(
        chunk.map(async (email) => {
          try {
            await base44.integrations.Core.SendEmail({
              to: email,
              subject,
              body,
              from_name: senderName,
            });
            sent++;
          } catch (e) {
            failed++;
            if (errors.length < 20) errors.push({ email, error: e.message });
          }
        })
      );
    }

    console.log(`[broadcastEmail] Done: sent=${sent} failed=${failed} total=${recipients.length}`);
    return Response.json({
      success: true,
      sent,
      failed,
      total: recipients.length,
      errors,
    }, { headers: CORS });
  } catch (error) {
    console.error('[broadcastEmail] Error:', error.message);
    return Response.json({ success: false, error: error.message }, { status: 500, headers: CORS });
  }
});