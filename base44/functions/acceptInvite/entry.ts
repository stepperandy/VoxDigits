import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

/**
 * acceptInvite — called from the public /accept-invite page when an invited
 * user clicks "Accept & Create Password" in their invitation email.
 *
 * Validates the one-time invitation token, marks the invitation accepted,
 * and triggers the platform's password-creation email (a set-password link
 * that opens the password creation page — not the login page or homepage).
 */
export default async function(req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({}));
    const token = body?.token;
    if (!token) {
      return Response.json({ error: 'Missing invitation token. Please open the Accept button from your invitation email.' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const invites = await base44.asServiceRole.entities.InviteToken.filter({ token });
    const invite = (invites || [])[0];
    if (!invite) {
      return Response.json({ error: 'This invitation link is invalid or has been removed. Ask your administrator to send a new invitation.' }, { status: 404 });
    }
    if (new Date(invite.expires_at) < new Date()) {
      return Response.json({ error: 'This invitation has expired. Ask your administrator to send a new invitation.' }, { status: 410 });
    }

    // Mark the invitation as accepted (re-accepts just re-send the setup email)
    if (!invite.accepted) {
      await base44.asServiceRole.entities.InviteToken.update(invite.id, {
        accepted: true,
        accepted_at: new Date().toISOString(),
      });
    }

    // Send the password-creation link to their inbox
    await base44.auth.resetPasswordRequest(invite.email);

    return Response.json({ success: true, email: invite.email });
  } catch (error) {
    return Response.json({ error: error.message || 'Failed to accept invitation' }, { status: 500 });
  }
}