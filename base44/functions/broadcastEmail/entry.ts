/**
 * Admin-only: blast an email to all registered app users (or a segment).
 *
 *  - Auth + admin role check.
 *  - Lists registered users (User entity), optionally filtered to users with
 *    an active Subscription.
 *  - Sends one email per recipient via the SendEmail integration, in parallel
 *    chunks to stay within time limits.
 *  - Returns a summary: sent, failed, total, and up to 10 sample errors.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.39';

const CHUNK_SIZE = 20;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return Response.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const { subject, body, segment } = await req.json();
    if (!subject || !body) {
      return Response.json(
        { success: false, error: 'Subject and body are required' },
        { status: 400 }
      );
    }

    // ── Fetch all registered users ──
    const users = await base44.asServiceRole.entities.User.list('-created_date', 1000);
    let recipients = (users || []).map((u) => u.email).filter(Boolean);

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
        { status: 400 }
      );
    }

    console.log(`[broadcastEmail] Blasting to ${recipients.length} recipients (segment=${segment || 'all'})`);

    let sent = 0;
    let failed = 0;
    const errors = [];

    for (let i = 0; i < recipients.length; i += CHUNK_SIZE) {
      const chunk = recipients.slice(i, i + CHUNK_SIZE);
      await Promise.all(
        chunk.map(async (email) => {
          try {
            await base44.integrations.Core.SendEmail({
              to: email,
              subject,
              body,
              from_name: 'VoxTelephony',
            });
            sent++;
          } catch (e) {
            failed++;
            if (errors.length < 10) errors.push({ email, error: e.message });
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
    });
  } catch (error) {
    console.error('[broadcastEmail] Error:', error.message);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});