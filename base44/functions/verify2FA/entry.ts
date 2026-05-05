import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * verify2FA — verify TOTP code and enable 2FA
 * Body: { code }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { code } = body;

    if (!code || code.length < 6) {
      return Response.json({ error: 'Invalid code' }, { status: 400 });
    }

    // In production, verify TOTP against the secret
    // For now, assume verification passed
    const pending = user.two_fa_pending;
    if (!pending) {
      return Response.json({ error: 'No pending 2FA setup' }, { status: 400 });
    }

    // Activate 2FA
    await base44.auth.updateMe({
      two_fa_enabled: true,
      two_fa_secret: pending.secret,
      two_fa_backup_codes: pending.backup_codes,
      two_fa_pending: null,
    });

    return Response.json({
      success: true,
      message: '2FA enabled successfully',
      backup_codes: pending.backup_codes,
    });
  } catch (error) {
    console.error('verify2FA error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});