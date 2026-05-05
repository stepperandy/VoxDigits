import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * updateNotificationPreferences — update notification settings
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    await base44.auth.updateMe({
      notification_preferences: {
        ...user.notification_preferences,
        ...body,
      },
    });

    return Response.json({ success: true, preferences: { ...user.notification_preferences, ...body } });
  } catch (error) {
    console.error('updateNotificationPreferences error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});