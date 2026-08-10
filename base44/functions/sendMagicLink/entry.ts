import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * sendMagicLink — passwordless login for users who can't (or don't want to) type a password.
 *
 * The Base44 auth SDK has no native magic-link / passwordless-login method, so we
 * reuse the platform's password-reset flow: resetPasswordRequest() sends the user
 * an email containing a one-time link to /reset-password?token=XXX.  The reset page
 * then offers a one-click "Instant Login" button that sets a random password and
 * logs the user straight in — no password typing required.
 *
 * This is especially useful for users in mainland China where social login is
 * blocked and email deliverability is unreliable.
 *
 * Always returns success (never reveals whether an email is registered).
 */
export default async function (req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { email } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        { error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify the user actually exists before sending anything.
    const users = await base44.asServiceRole.entities.User.filter({
      email: normalizedEmail,
    });

    if (users.length > 0) {
      // Trigger the platform's password-reset email — it contains the one-time
      // link the user will click to access the instant-login page.
      try {
        await base44.auth.resetPasswordRequest(normalizedEmail);
      } catch (err) {
        // resetPasswordRequest can fail for service-role callers in some setups;
        // we still send our own friendly notification below.
        console.error('resetPasswordRequest error:', err.message);
      }

      // Send a friendly, branded notification so the user knows to look for the
      // login link (the platform's reset email is generic).
      try {
        const appUrl =
          Deno.env.get('APP_URL') || 'https://voxvpn.net';
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: normalizedEmail,
          subject: '🔗 Your VoxVPN Login Link',
          body: `Hi,\n\nWe received a request to sign you in to your VoxVPN account.\n\nWe've sent a secure login link to this email. Open it and click the link inside — then press the "⚡ Instant Login" button on the page that opens to access your account immediately, no password needed.\n\nIf you didn't request this, you can safely ignore this email.\n\nAccess your dashboard: ${appUrl}/dashboard\n\nStay secure,\nThe VoxVPN Team`,
        });
      } catch (err) {
        console.error('SendEmail error:', err.message);
      }
    }

    // Always return success to avoid email enumeration.
    return Response.json({
      success: true,
      message:
        'If an account exists for this email, a login link has been sent. Check your inbox and click the link to sign in instantly.',
    });
  } catch (error) {
    console.error('sendMagicLink error:', error.message);
    return Response.json(
      { error: 'Failed to send login link. Please try again.' },
      { status: 500 }
    );
  }
}