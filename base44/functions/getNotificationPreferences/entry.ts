import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * getNotificationPreferences — get user's notification settings
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prefs = user.notification_preferences || {
      email_on_login: true,
      email_on_payment: true,
      email_on_renewal: true,
      email_on_updates: false,
      push_notifications: true,
      sms_on_critical: false,
      marketing_emails: false,
    };

    return Response.json(prefs);
  } catch (error) {
    console.error('getNotificationPreferences error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});