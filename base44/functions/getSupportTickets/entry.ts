import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * getSupportTickets — get user's support tickets
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tickets = user.support_tickets || [];

    return Response.json({
      tickets: tickets.map(t => ({
        id: t.id,
        subject: t.subject,
        category: t.category,
        priority: t.priority,
        status: t.status,
        created_at: t.created_at,
        updated_at: t.updated_at,
        message_count: t.messages?.length || 0,
      })),
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
    });
  } catch (error) {
    console.error('getSupportTickets error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});