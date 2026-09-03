import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * Sends a promotional email blast to all known email addresses —
 * registered users AND non-users (newsletter subscribers, SMS consent opt-ins,
 * customers with orders/subscriptions).
 *
 * Uses Resend API (RESEND_API_KEY) so emails reach any address, not just
 * registered app users.
 *
 * Admin-only. Returns sent/failed counts and deduplication stats.
 */
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "VoxTelefony <noreply@voxdigits.com>";

async function sendViaResend(to, subject, html) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: to,
      subject: subject,
      html: html,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Resend API error (${res.status}): ${errText}`);
  }

  return await res.json();
}

Deno.serve(async (req) => {
  try {
    if (!RESEND_API_KEY) {
      return Response.json({ success: false, error: "RESEND_API_KEY is not set" }, { status: 500 });
    }

    const base44 = createClientFromRequest(req);

    // Verify admin access
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ success: false, error: "Admin access required" }, { status: 403 });
    }

    // Collect email addresses from ALL sources — users and non-users
    const allEmails = new Set();
    const sourceCounts = {
      registered_users: 0,
      campaign_subscribers: 0,
      sms_consent: 0,
      subscriptions: 0,
      number_orders: 0,
    };

    // 1. Registered users
    try {
      const users = await base44.asServiceRole.entities.User.list();
      for (const u of users) {
        if (u.email && !allEmails.has(u.email.toLowerCase())) {
          allEmails.add(u.email.toLowerCase());
          sourceCounts.registered_users++;
        }
      }
    } catch (e) {
      console.log("User list error:", e.message);
    }

    // 2. Campaign / newsletter subscribers
    try {
      const subscribers = await base44.asServiceRole.entities.CampaignEnrollment.filter({ status: "active" });
      for (const s of subscribers) {
        if (s.user_email && !allEmails.has(s.user_email.toLowerCase())) {
          allEmails.add(s.user_email.toLowerCase());
          sourceCounts.campaign_subscribers++;
        }
      }
    } catch (e) {
      console.log("CampaignEnrollment error:", e.message);
    }

    // 3. SMS consent opt-ins
    try {
      const consents = await base44.asServiceRole.entities.SmsConsent.filter({ status: "active", consent_given: true });
      for (const c of consents) {
        if (c.user_email && !allEmails.has(c.user_email.toLowerCase())) {
          allEmails.add(c.user_email.toLowerCase());
          sourceCounts.sms_consent++;
        }
      }
    } catch (e) {
      console.log("SmsConsent error:", e.message);
    }

    // 4. Subscriptions
    try {
      const subs = await base44.asServiceRole.entities.Subscription.list();
      for (const s of subs) {
        if (s.user_email && !allEmails.has(s.user_email.toLowerCase())) {
          allEmails.add(s.user_email.toLowerCase());
          sourceCounts.subscriptions++;
        }
      }
    } catch (e) {
      console.log("Subscription error:", e.message);
    }

    // 5. Number orders (customers who purchased)
    try {
      const orders = await base44.asServiceRole.entities.NumberOrder.list();
      for (const o of orders) {
        if (o.user_email && !allEmails.has(o.user_email.toLowerCase())) {
          allEmails.add(o.user_email.toLowerCase());
          sourceCounts.number_orders++;
        }
      }
    } catch (e) {
      console.log("NumberOrder error:", e.message);
    }

    const recipients = Array.from(allEmails);

    if (recipients.length === 0) {
      return Response.json({ success: false, message: "No email addresses found across any source" });
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
          You're receiving this because you've interacted with VoxTelefony.<br/>
          VoxDigits Communications LLC — All rights reserved.
        </p>
      </div>
    `;

    let sent = 0;
    let failed = 0;
    const errors = [];

    // Send individually to track per-recipient success
    for (const email of recipients) {
      try {
        await sendViaResend(email, subject, body);
        sent++;
      } catch (err) {
        failed++;
        errors.push({ email, error: err.message });
      }
    }

    console.log(`Promo blast complete: ${sent} sent, ${failed} failed out of ${recipients.length} total`);

    return Response.json({
      success: true,
      total_recipients: recipients.length,
      sent: sent,
      failed: failed,
      sources: sourceCounts,
      errors: errors.slice(0, 10),
    });
  } catch (error) {
    console.error("sendPromoBlast error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});