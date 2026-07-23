import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * Sends a promotional email blast to all registered app users.
 * Admin-only — triggers a marketing email campaign to drive sales.
 *
 * Returns a summary of sent/failed counts.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Verify admin access
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ success: false, error: "Admin access required" }, { status: 403 });
    }

    // Get all registered users
    const users = await base44.asServiceRole.entities.User.list();

    if (!users || users.length === 0) {
      return Response.json({ success: false, message: "No registered users found" });
    }

    const subject = "🌍 Go Global with VoxTelefony — Your New Number Awaits";
    const body = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0a1628; padding: 40px 20px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #67e8f9; font-size: 28px; margin: 0;">VoxTelefony</h1>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 5px;">Your Global Connection</p>
        </div>

        <h2 style="color: #ffffff; font-size: 22px; margin-bottom: 16px;">Ready to go global? 🌍</h2>

        <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6;">
          Whether you're a business expanding internationally, a traveler avoiding roaming fees, or someone who values privacy —
          VoxTelefony gives you a private virtual phone number in the US, UK, Canada, or Australia in under 60 seconds.
        </p>

        <div style="background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.3); border-radius: 12px; padding: 20px; margin: 24px 0;">
          <p style="color: #67e8f9; font-weight: bold; font-size: 15px; margin: 0 0 10px 0;">✨ What you get:</p>
          <ul style="color: #cbd5e1; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>Private number in US, UK, Canada, or Australia</li>
            <li>Free incoming calls & SMS</li>
            <li>Works with WhatsApp & Telegram</li>
            <li>Voicemail included</li>
            <li>No roaming fees — ever</li>
            <li>Instant activation, no SIM swap needed</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://voxtelefony.com/VirtualNumbers"
             style="display: inline-block; background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: #ffffff; font-weight: bold; font-size: 16px; padding: 14px 40px; border-radius: 12px; text-decoration: none;">
            Get Your Number Now →
          </a>
        </div>

        <div style="border-top: 1px solid rgba(255,255,255,0.1); margin-top: 30px; padding-top: 20px;">
          <p style="color: #64748b; font-size: 12px; text-align: center;">
            Starting at just $4.99/month. Cancel anytime. No setup fees on annual plans.<br/>
            <a href="https://voxtelefony.com/Pricing" style="color: #67e8f9;">View all pricing</a>
          </p>
        </div>

        <p style="color: #475569; font-size: 11px; text-align: center; margin-top: 20px;">
          You're receiving this because you have a VoxTelefony account.<br/>
          VoxDigits Communications LLC — All rights reserved.
        </p>
      </div>
    `;

    let sent = 0;
    let failed = 0;
    const errors = [];

    for (const u of users) {
      if (!u.email) continue;
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: u.email,
          subject: subject,
          body: body,
          from_name: "VoxTelefony",
        });
        sent++;
      } catch (err) {
        failed++;
        errors.push({ email: u.email, error: err.message });
      }
    }

    console.log(`Promo blast complete: ${sent} sent, ${failed} failed`);

    return Response.json({
      success: true,
      total_users: users.length,
      sent: sent,
      failed: failed,
      errors: errors.slice(0, 5),
    });
  } catch (error) {
    console.error("sendPromoBlast error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});