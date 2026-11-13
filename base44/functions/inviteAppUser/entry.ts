import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { sendInviteAcceptanceEmail } from '../../shared/inviteAcceptance.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!['admin', 'super_admin', 'agency_admin', 'client_admin'].includes(user.role)) {
      return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { email, role, full_name, client_id } = body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'A valid email address is required' }, { status: 400 });
    }

    // Create the user account (or re-invite if it already exists)
    await base44.users.inviteUser(email, role || 'user');

    // Send the acceptance email — the user must accept from their inbox,
    // then create their password. They are not sent to login or the homepage.
    await sendInviteAcceptanceEmail(base44, {
      email,
      full_name: full_name || null,
      role: role || 'user',
      client_id: client_id || null,
      invited_by: user.email,
    });

    return Response.json({
      success: true,
      message: `Invitation sent to ${email}. They must accept it from their email to create a password.`,
    });
  } catch (error) {
    return Response.json({ error: error.message || 'Failed to send invitation' }, { status: 500 });
  }
}