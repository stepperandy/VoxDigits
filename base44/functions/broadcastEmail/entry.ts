import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * broadcastEmail — admin-only blast email to every registered user.
 * POST { subject, body, from_name? } -> { success, total, sent, failed, errors[] }
 */
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
      return Response.json({ error: 'Forbidden' }, { status: 403, headers: CORS });
    }

    const { subject, body, from_name } = await req.json().catch(() => ({}));
    if (!subject || !body) {
      return Response.json({ error: 'Subject and body are required' }, { status: 400, headers: CORS });
    }

    // Fetch all registered users in batches of 500.
    const allUsers = [];
    let batch = await base44.asServiceRole.entities.User.list('-created_date', 500);
    allUsers.push(...(batch || []));
    // list() returns up to the limit; loop until a short batch arrives.
    let guard = 0;
    while (batch && batch.length === 500 && guard < 40) {
      batch = await base44.asServiceRole.entities.User.list('-created_date', 500);
      allUsers.push(...(batch || []));
      guard++;
    }

    let sent = 0;
    let failed = 0;
    const errors = [];

    for (const u of allUsers) {
      if (!u.email) continue;
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: u.email,
          subject,
          body,
          ...(from_name ? { from_name } : {}),
        });
        sent++;
      } catch (e) {
        failed++;
        if (errors.length < 20) errors.push({ email: u.email, error: e.message });
      }
    }

    return Response.json({
      success: true,
      total: allUsers.filter(u => u.email).length,
      sent,
      failed,
      errors,
    }, { headers: CORS });
  } catch (error) {
    console.error('broadcastEmail error:', error.message);
    return Response.json({ error: error.message }, { status: 500, headers: CORS });
  }
});