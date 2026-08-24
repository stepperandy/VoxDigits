import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: admin only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const subject = (body?.subject || '').toString().trim();
    const message = (body?.body || body?.message || '').toString().trim();
    const fromName = (body?.from_name || 'VoxTelefony').toString().trim();
    const testRecipient = (body?.test_email || '').toString().trim();

    if (!subject || !message) {
      return Response.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    // Test mode: send to a single address and stop.
    if (testRecipient) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: testRecipient,
          subject,
          body: message,
          from_name: fromName,
        });
        return Response.json({ test: true, sent: 1, failed: 0, total: 1 });
      } catch (e) {
        return Response.json({ test: true, sent: 0, failed: 1, errors: [{ email: testRecipient, error: e.message }] }, { status: 500 });
      }
    }

    // Collect all users. list() returns an array; cap at a high limit to cover typical apps in one page.
    const batch = await base44.asServiceRole.entities.User.list('-created_date', 1000);
    const users = Array.isArray(batch) ? batch : (batch?.items || batch?.data || []);

    // Dedupe + keep only valid emails.
    const seen = new Set();
    const recipients = [];
    for (const u of users) {
      const email = (u?.email || '').toString().trim();
      if (!email || seen.has(email)) continue;
      seen.add(email);
      recipients.push(email);
    }

    let sent = 0;
    let failed = 0;
    const errors = [];
    for (const email of recipients) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject,
          body: message,
          from_name: fromName,
        });
        sent++;
      } catch (e) {
        failed++;
        if (errors.length < 10) errors.push({ email, error: e.message });
      }
    }

    return Response.json({ total: recipients.length, sent, failed, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}