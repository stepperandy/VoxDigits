import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * setup2FA — generate TOTP secret and backup codes
 * Returns: { secret, qr_code_url, backup_codes }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate TOTP secret (base32 encoded)
    const secret = generateSecret();
    const qrCodeUrl = `otpauth://totp/VoxVPN:${user.email}?secret=${secret}&issuer=VoxVPN`;

    // Generate 10 backup codes
    const backupCodes = Array.from({ length: 10 }, () => generateBackupCode());

    // Store temporarily (user must verify within 10 minutes)
    await base44.auth.updateMe({
      two_fa_pending: {
        secret,
        backup_codes: backupCodes,
        created_at: new Date().toISOString(),
      },
    });

    return Response.json({
      secret,
      qr_code_url: qrCodeUrl,
      backup_codes: backupCodes,
      manual_entry: `TOTP:VoxVPN:${user.email}:${secret}`,
    });
  } catch (error) {
    console.error('setup2FA error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateSecret() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

function generateBackupCode() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}