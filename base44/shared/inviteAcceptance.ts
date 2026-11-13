import { secrets } from "base44:runtime";

/**
 * Shared invite-acceptance flow.
 *
 * Creates a one-time acceptance token for an invited user and emails them an
 * "Accept Invitation" button. The button opens the public /accept-invite page,
 * where they trigger their password creation — they never land on the login
 * page or homepage directly from the invite email.
 */

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getAppUrl() {
  const url = (secrets.get("APP_URL") || "https://voxvpn.base44.app").trim();
  return url.replace(/\/+$/, "");
}

export async function sendInviteAcceptanceEmail(base44, { email, full_name, role, client_id, invited_by, team_name }) {
  if (!email) throw new Error("Email is required for invitation");

  const token = (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, "");
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS).toISOString();

  await base44.asServiceRole.entities.InviteToken.create({
    email,
    token,
    role: role || "user",
    client_id: client_id || null,
    invited_by: invited_by || null,
    team_name: team_name || null,
    expires_at: expiresAt,
    accepted: false,
  });

  const acceptUrl = `${getAppUrl()}/accept-invite?token=${token}`;
  const displayName = full_name || email.split("@")[0];
  const teamLabel = team_name || "VoxVPN";

  const html = `
  <html>
    <body style="margin:0;background-color:#0f172a;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0"
                 style="background-color:#0d1120;border-radius:12px;border:1px solid #1e293b;padding:32px;color:#e2e8f0;max-width:480px;">
            <tr><td>
              <p style="color:#00d4ff;font-size:13px;letter-spacing:2px;margin:0 0 8px;">VOXVPN</p>
              <h2 style="color:#ffffff;margin:0 0 16px;">You're invited to join ${teamLabel}</h2>
              <p style="color:#94a3b8;line-height:1.6;margin:0 0 12px;">Hi ${displayName},</p>
              <p style="color:#94a3b8;line-height:1.6;margin:0 0 24px;">
                You've been invited to access <strong style="color:#e2e8f0;">${teamLabel}</strong>.
                To get started, accept this invitation and create your password.
              </p>
              <div style="text-align:center;margin:0 0 24px;">
                <a href="${acceptUrl}"
                   style="display:inline-block;background-color:#00d4ff;color:#0f172a;font-weight:bold;font-size:15px;text-decoration:none;padding:13px 32px;border-radius:8px;">
                  Accept Invitation
                </a>
              </div>
              <p style="color:#64748b;font-size:12px;line-height:1.6;margin:0 0 8px;">
                This invitation expires in 7 days. After you accept, a password creation link
                is sent straight to your inbox — no login required.
              </p>
              <p style="color:#64748b;font-size:12px;line-height:1.6;margin:0;">
                If the button doesn't work, copy this link into your browser:<br>
                <a href="${acceptUrl}" style="color:#38bdf8;word-break:break-all;">${acceptUrl}</a>
              </p>
            </td></tr>
          </table>
          <p style="color:#475569;font-size:11px;margin-top:16px;">
            If you weren't expecting this invitation, you can safely ignore this email.
          </p>
        </td></tr>
      </table>
    </body>
  </html>`;

  await base44.asServiceRole.integrations.Core.SendEmail({
    to: email,
    subject: `You're invited to join ${teamLabel} — accept to create your password`,
    html,
  });

  return { token, expires_at: expiresAt };
}