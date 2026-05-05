import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * createSupportTicket — create support ticket
 * Body: { subject, category, priority, message }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { subject, category, priority, message } = body;

    if (!subject || !message) {
      return Response.json({ error: 'Subject and message required' }, { status: 400 });
    }

    // Create ticket (in production, use a dedicated Tickets entity)
    const ticket = {
      id: `tick_${Date.now()}`,
      user_email: user.email,
      subject,
      category: category || 'general',
      priority: priority || 'normal',
      message,
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: [
        {
          id: `msg_${Date.now()}`,
          sender: user.email,
          message,
          created_at: new Date().toISOString(),
        },
      ],
    };

    // Store in user data or separate entity
    await base44.auth.updateMe({
      support_tickets: [...(user.support_tickets || []), ticket],
    });

    // Send confirmation email
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `Support Ticket Created: ${subject}`,
      body: `Your ticket #${ticket.id} has been created. We'll respond within 24 hours.`,
    });

    return Response.json({
      success: true,
      ticket: {
        id: ticket.id,
        subject: ticket.subject,
        status: ticket.status,
        created_at: ticket.created_at,
      },
    });
  } catch (error) {
    console.error('createSupportTicket error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});