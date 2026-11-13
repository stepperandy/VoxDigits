import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

const MAX_RECIPIENTS = 500;
const CONCURRENCY = 10;

function buildHtml(subject, body, imageUrl, videoUrl, links) {
  const bodyHtml = String(body || '').split('\n').map((line) => `<p style="margin:0 0 12px;line-height:1.6;">${line}</p>`).join('');
  const imageHtml = imageUrl ? `<img src="${imageUrl}" alt="${subject}" style="max-width:100%;border-radius:8px;margin:16px 0;" />` : '';
  const videoHtml = videoUrl ? `<p style="margin:16px 0;"><a href="${videoUrl}" style="display:inline-block;padding:10px 18px;background:#00d4ff;color:#000;font-weight:bold;text-decoration:none;border-radius:6px;">▶ Watch Video</a></p>` : '';
  const linksHtml = (Array.isArray(links) && links.length > 0)
    ? `<div style="margin:16px 0;">${links.map((l) => `<a href="${l.url}" style="display:inline-block;margin:4px 6px 4px 0;padding:10px 18px;background:#111;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">${l.label || l.url}</a>`).join('')}</div>`
    : '';
  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">${bodyHtml}${imageHtml}${videoHtml}${linksHtml}</div>`;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const { subject, body, image_url, video_url, links, recipient_mode, custom_emails, ai_generated } = await req.json();
    if (!subject || !body) {
      return Response.json({ error: 'subject and body are required' }, { status: 400 });
    }

    let recipients = [];
    if (recipient_mode === 'custom_emails') {
      recipients = (custom_emails || []).filter(Boolean);
    } else {
      const users = await base44.asServiceRole.entities.User.list();
      recipients = (users || []).map((u) => u.email).filter(Boolean);
    }
    recipients = recipients.slice(0, MAX_RECIPIENTS);

    const blast = await base44.asServiceRole.entities.EmailBlast.create({
      subject, body, image_url, video_url, links: links || [],
      recipient_mode: recipient_mode || 'all_users',
      custom_emails: recipient_mode === 'custom_emails' ? recipients : [],
      ai_generated: !!ai_generated,
      status: 'sending',
      total_recipients: recipients.length,
      sent_count: 0,
      failed_count: 0,
    });

    const html = buildHtml(subject, body, image_url, video_url, links);
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < recipients.length; i += CONCURRENCY) {
      const chunk = recipients.slice(i, i + CONCURRENCY);
      const results = await Promise.all(chunk.map((email) =>
        base44.asServiceRole.integrations.Core.SendEmail({ to: email, subject, html })
          .then(() => true)
          .catch(() => false)
      ));
      sent += results.filter(Boolean).length;
      failed += results.filter((r) => !r).length;
    }

    await base44.asServiceRole.entities.EmailBlast.update(blast.id, {
      status: failed > 0 && sent === 0 ? 'failed' : 'sent',
      sent_count: sent,
      failed_count: failed,
    });

    return Response.json({ total: recipients.length, sent, failed, blast_id: blast.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}