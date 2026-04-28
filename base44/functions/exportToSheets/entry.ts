import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlesheets');

    // Fetch analytics data
    const subscriptions = await base44.asServiceRole.entities.VPNSubscription.list('-created_date', 500);

    // Build rows: new & cancelled per day
    const byDay = {};
    for (const sub of subscriptions) {
      const day = sub.created_date?.slice(0, 10);
      if (!day) continue;
      if (!byDay[day]) byDay[day] = { new: 0, cancelled: 0 };
      if (sub.status === 'active') byDay[day].new++;
      if (sub.status === 'cancelled') byDay[day].cancelled++;
    }

    const rows = Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => [date, v.new, v.cancelled]);

    // Create a new spreadsheet
    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: { title: `VoxVPN Analytics Export ${new Date().toISOString().slice(0, 10)}` },
        sheets: [{ properties: { title: 'Subscriptions' } }],
      }),
    });

    const sheet = await createRes.json();
    const spreadsheetId = sheet.spreadsheetId;
    const spreadsheetUrl = sheet.spreadsheetUrl;

    // Write headers + data
    const values = [['Date', 'New Subscriptions', 'Cancelled'], ...rows];
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Subscriptions!A1:C${values.length}?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values }),
      }
    );

    return Response.json({ success: true, spreadsheetUrl, rowCount: rows.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});