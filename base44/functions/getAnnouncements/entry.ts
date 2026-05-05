import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * getAnnouncements — get app announcements and news
 */
Deno.serve(async (req) => {
  try {
    const announcements = [
      {
        id: '1',
        type: 'alert',
        title: 'Server Maintenance',
        message: 'Singapore server maintenance scheduled for 2026-05-06 02:00-04:00 UTC',
        priority: 'high',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: '2',
        type: 'news',
        title: 'New Feature: Network Test',
        message: 'We\'ve added a network diagnostic tool. Check your connection speed and quality!',
        priority: 'medium',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: '3',
        type: 'promo',
        title: '50% Off Annual Plans',
        message: 'Limited time offer: Save 50% on annual subscriptions. Upgrade now!',
        priority: 'medium',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
      },
    ];

    return Response.json({ announcements });
  } catch (error) {
    console.error('getAnnouncements error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});