import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const APP_URL = Deno.env.get("BASE44_PUBLIC_URL") || "https://voxtelefony.com";

const DRIP_TIPS = [
  {
    delayDays: 0,
    subject: "Welcome to VoxTelefony — Let's Get Started!",
    htmlBody: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
<h1 style="color:#6B21A8;">Welcome to VoxTelefony! 🎉</h1>
<p>Thank you for choosing VoxTelefony. Your virtual number is now active and ready to use.</p>
<h2 style="color:#6B21A8;">Quick Start Guide</h2>
<ol>
<li><strong>Download the app</strong> — Get VoxTelefony from the App Store or Google Play.</li>
<li><strong>Make your first call</strong> — Open the Dialer tab and dial any number.</li>
<li><strong>Send an SMS</strong> — Go to Messages and start a conversation.</li>
<li><strong>Add contacts</strong> — Import your address book for one-tap dialing.</li>
</ol>
<p style="margin-top:24px;padding:16px;background:#f3e8ff;border-radius:8px;">
💡 <strong>Tip:</strong> Incoming calls and SMS are always free. Your $10 calling credit covers outgoing calls and SMS.
</p>
<p>Need help? Visit our <a href="${APP_URL}/support">Support Center</a>.</p>
<p>Happy calling!<br>The VoxTelefony Team</p>
</div>`,
    textBody: `Welcome to VoxTelefony!\n\nThank you for choosing VoxTelefony. Your virtual number is now active and ready to use.\n\nQuick Start Guide:\n1. Download the app from the App Store or Google Play.\n2. Make your first call — open the Dialer tab.\n3. Send an SMS — go to Messages.\n4. Add contacts — import your address book.\n\nTip: Incoming calls and SMS are always free. Your $10 calling credit covers outgoing calls and SMS.\n\nNeed help? Visit ${APP_URL}/support\n\nHappy calling!\nThe VoxTelefony Team`,
  },
  {
    delayDays: 3,
    subject: "Never Miss a Call — Set Up Call Forwarding",
    htmlBody: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
<h1 style="color:#6B21A8;">Never Miss a Call 📞</h1>
<p>Did you know you can forward incoming calls from your virtual number to any phone number?</p>
<h2 style="color:#6B21A8;">How to Set Up Call Forwarding</h2>
<ol>
<li>Go to <strong>Preferences</strong> in the app.</li>
<li>Tap <strong>Call Forwarding</strong>.</li>
<li>Enter your forwarding number and toggle it on.</li>
<li>Optionally set a ring timeout (10–60 seconds).</li>
</ol>
<p style="margin-top:24px;padding:16px;background:#f3e8ff;border-radius:8px;">
💡 <strong>Pro tip:</strong> Use "forward unanswered only" mode to try your virtual number first, then fall back to your personal phone.
</p>
<p><a href="${APP_URL}/CallForwarding">Set up call forwarding now →</a></p>
<p>The VoxTelefony Team</p>
</div>`,
    textBody: `Never Miss a Call!\n\nDid you know you can forward incoming calls from your virtual number to any phone number?\n\nHow to Set Up Call Forwarding:\n1. Go to Preferences in the app.\n2. Tap Call Forwarding.\n3. Enter your forwarding number and toggle it on.\n4. Optionally set a ring timeout (10-60 seconds).\n\nPro tip: Use "forward unanswered only" mode to try your virtual number first, then fall back to your personal phone.\n\nSet up call forwarding now: ${APP_URL}/CallForwarding\n\nThe VoxTelefony Team`,
  },
  {
    delayDays: 4,
    subject: "Master SMS Messaging & Contacts",
    htmlBody: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
<h1 style="color:#6B21A8;">Master SMS & Contacts 💬</h1>
<p>Here's how to get the most out of messaging and your contact book.</p>
<h2 style="color:#6B21A8;">SMS Tips</h2>
<ul>
<li><strong>Threaded conversations</strong> — All messages are organized by contact.</li>
<li><strong>Two-way messaging</strong> — Send and receive SMS from your virtual number.</li>
<li><strong>Auto-reply templates</strong> — Set up automatic responses when you're busy.</li>
</ul>
<h2 style="color:#6B21A8;">Contact Management</h2>
<ul>
<li><strong>Bulk import</strong> — Upload a CSV or vCard to import hundreds of contacts at once.</li>
<li><strong>Quick dial</strong> — Tap any contact to call or message instantly.</li>
<li><strong>Block numbers</strong> — Stop unwanted messages and calls.</li>
</ul>
<p style="margin-top:24px;padding:16px;background:#f3e8ff;border-radius:8px;">
💡 <strong>Tip:</strong> Use the Contacts tab to organize your address book by name or recent activity.
</p>
<p><a href="${APP_URL}/Contacts">Manage your contacts →</a></p>
<p>The VoxTelefony Team</p>
</div>`,
    textBody: `Master SMS & Contacts!\n\nSMS Tips:\n- Threaded conversations organized by contact.\n- Two-way messaging from your virtual number.\n- Auto-reply templates for when you're busy.\n\nContact Management:\n- Bulk import via CSV or vCard.\n- Quick dial any contact.\n- Block unwanted numbers.\n\nTip: Use the Contacts tab to organize your address book.\n\nManage your contacts: ${APP_URL}/Contacts\n\nThe VoxTelefony Team`,
  },
  {
    delayDays: 7,
    subject: "Get the Most From Your Voicemail",
    htmlBody: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
<h1 style="color:#6B21A8;">Voicemail Made Easy 📭</h1>
<p>Your virtual number includes free voicemail with transcription. Here's how to use it effectively.</p>
<h2 style="color:#6B21A8;">Voicemail Features</h2>
<ul>
<li><strong>Automatic transcription</strong> — Read voicemails as text.</li>
<li><strong>Custom greeting</strong> — Record a personal greeting.</li>
<li><strong>Email notifications</strong> — Get notified when you miss a call.</li>
<li><strong>Voicemail archive</strong> — Save important messages.</li>
</ul>
<p style="margin-top:24px;padding:16px;background:#f3e8ff;border-radius:8px;">
💡 <strong>Tip:</strong> Check your voicemail regularly — missed calls are stored for 30 days.
</p>
<p><a href="${APP_URL}/Dashboard">View your voicemails →</a></p>
<p>The VoxTelefony Team</p>
</div>`,
    textBody: `Voicemail Made Easy!\n\nYour virtual number includes free voicemail with transcription.\n\nVoicemail Features:\n- Automatic transcription — read voicemails as text.\n- Custom greeting — record a personal greeting.\n- Email notifications for missed calls.\n- Voicemail archive for important messages.\n\nTip: Check your voicemail regularly — missed calls are stored for 30 days.\n\nView your voicemails: ${APP_URL}/Dashboard\n\nThe VoxTelefony Team`,
  },
  {
    delayDays: 7,
    subject: "Pro Tips & Refer a Friend to Earn Rewards",
    htmlBody: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
<h1 style="color:#6B21A8;">You're a Pro Now! 🚀</h1>
<p>You've been using VoxTelefony for a while — here are some advanced features and a way to earn rewards.</p>
<h2 style="color:#6B21A8;">Advanced Features</h2>
<ul>
<li><strong>Usage dashboard</strong> — Track your calls, SMS, and spending in real time.</li>
<li><strong>Subscription management</strong> — Upgrade to annual and save 17%.</li>
<li><strong>Multiple numbers</strong> — Add numbers in different countries.</li>
<li><strong>KYC verification</strong> — Verify your identity for higher sending limits.</li>
</ul>
<h2 style="color:#6B21A8;">Refer & Earn 💰</h2>
<p>Share VoxTelefony with friends and earn credits for each referral who signs up. It's our way of saying thanks!</p>
<p style="margin-top:24px;padding:16px;background:#f3e8ff;border-radius:8px;">
💡 <strong>Tip:</strong> Annual plans save you 17% compared to monthly billing. Switch anytime from your dashboard.
</p>
<p><a href="${APP_URL}/ReferralDashboard">Get your referral link →</a></p>
<p>Thank you for being a valued VoxTelefony customer!</p>
<p>The VoxTelefony Team</p>
</div>`,
    textBody: `You're a Pro Now!\n\nYou've been using VoxTelefony for a while — here are some advanced features.\n\nAdvanced Features:\n- Usage dashboard — track calls, SMS, and spending.\n- Subscription management — upgrade to annual and save 17%.\n- Multiple numbers in different countries.\n- KYC verification for higher limits.\n\nRefer & Earn:\nShare VoxTelefony with friends and earn credits for each referral.\n\nTip: Annual plans save 17% compared to monthly billing.\n\nGet your referral link: ${APP_URL}/ReferralDashboard\n\nThank you for being a valued VoxTelefony customer!\nThe VoxTelefony Team`,
  },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow manual admin invocation or automation (no user session)
    let isAutomation = false;
    try {
      const user = await base44.auth.me();
      if (user.role !== "admin") {
        return Response.json({ error: "Admin access required" }, { status: 403 });
      }
    } catch {
      isAutomation = true;
    }

    // 1. Get all active subscriptions (our subscribers)
    const subscriptions = await base44.asServiceRole.entities.Subscription.filter({ status: "active" });
    const subscriberEmails = [...new Set(
      subscriptions.map((s) => s.user_email).filter(Boolean)
    )];

    if (subscriberEmails.length === 0) {
      return Response.json({ success: true, message: "No active subscribers", sent: 0 });
    }

    // 2. Get existing enrollments
    const enrollments = await base44.asServiceRole.entities.CampaignEnrollment.filter({});
    const enrollmentMap = new Map(enrollments.map((e) => [e.user_email, e]));

    const now = new Date();
    let sentCount = 0;
    let enrolledCount = 0;
    let errors = [];

    // 3. Process each subscriber
    for (const email of subscriberEmails) {
      let enrollment = enrollmentMap.get(email);

      // Auto-enroll new subscribers
      if (!enrollment) {
        enrollment = await base44.asServiceRole.entities.CampaignEnrollment.create({
          user_email: email,
          enrolled_date: now.toISOString(),
          tips_sent_count: 0,
          status: "active",
          source: "subscription",
        });
        enrolledCount++;
        enrollmentMap.set(email, enrollment);
      }

      if (enrollment.status !== "active") continue;
      if (enrollment.tips_sent_count >= DRIP_TIPS.length) continue;

      // Check if enough time has passed since last tip (or enrollment)
      const lastTipAt = enrollment.last_tip_sent_at
        ? new Date(enrollment.last_tip_sent_at)
        : new Date(enrollment.enrolled_date);
      const tipIndex = enrollment.tips_sent_count;
      const daysRequired = DRIP_TIPS[tipIndex].delayDays;
      const daysSinceLast = (now.getTime() - lastTipAt.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceLast < daysRequired) continue;

      // Send the tip via Gmail
      const tip = DRIP_TIPS[tipIndex];
      try {
        await sendGmail(base44, email, tip.subject, tip.htmlBody, tip.textBody);

        await base44.asServiceRole.entities.CampaignEnrollment.update(enrollment.id, {
          tips_sent_count: tipIndex + 1,
          last_tip_sent_at: now.toISOString(),
          status: tipIndex + 1 >= DRIP_TIPS.length ? "completed" : "active",
        });
        sentCount++;
      } catch (e) {
        errors.push({ email, tip: tipIndex + 1, error: e.message });
      }
    }

    return Response.json({
      success: true,
      subscribers: subscriberEmails.length,
      newlyEnrolled: enrolledCount,
      sent: sentCount,
      errors,
    });
  } catch (error) {
    console.error("Drip campaign error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function toBase64Url(bytes) {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function encodeHeader(str) {
  // RFC 2047 encode if non-ASCII characters present
  if (/^[\x00-\x7F]*$/.test(str)) return str;
  const bytes = new TextEncoder().encode(str);
  return `=?UTF-8?B?${toBase64Url(bytes)}?=`;
}

function buildMimeMessage(senderEmail, senderName, to, subject, htmlBody, textBody) {
  const boundary = "voxtelefony_" + Math.random().toString(36).substring(2);
  const encodedSubject = encodeHeader(subject);
  const textB64 = toBase64Url(new TextEncoder().encode(textBody));
  const htmlB64 = toBase64Url(new TextEncoder().encode(htmlBody));

  const raw = [
    `From: ${senderName} <${senderEmail}>`,
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    textB64,
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    htmlB64,
    "",
    `--${boundary}--`,
  ].join("\r\n");

  return toBase64Url(new TextEncoder().encode(raw));
}

async function sendGmail(base44, to, subject, htmlBody, textBody) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection("gmail");

  // Get sender email from OAuth2 userinfo (uses 'email' scope, already authorized)
  const userinfoRes = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!userinfoRes.ok) {
    throw new Error(`Userinfo fetch failed: ${await userinfoRes.text()}`);
  }
  const userinfo = await userinfoRes.json();
  const senderEmail = userinfo.email;

  // Build RFC 2822 MIME message
  const raw = buildMimeMessage(senderEmail, "VoxTelefony", to, subject, htmlBody, textBody);

  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw }),
    }
  );

  if (!res.ok) {
    throw new Error(`Gmail send failed: ${await res.text()}`);
  }

  return await res.json();
}