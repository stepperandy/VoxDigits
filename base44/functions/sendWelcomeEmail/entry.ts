import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const { email, orderId, setupToken } = body;

    if (!email || !setupToken) {
      return Response.json({ error: 'Missing email or setupToken' }, { status: 400 });
    }

    const setupUrl = `${Deno.env.get('APP_URL')}/setup?token=${setupToken}`;

    const emailBody = `
Hello,

Thank you for your purchase! Your VoxVPN account has been provisioned successfully on our secure server network.

You can now open your secure setup center to download your VoxVPN connection for all supported devices.

Setup Link: ${setupUrl}

Inside the portal, you will find:
- VoxVPN for Windows
- VoxVPN for macOS
- VoxVPN for Linux
- VoxVPN for Android
- VoxVPN for iPhone / iPad
- Quick branded setup guides
- Mobile QR import for easy activation

If you need support, reply to this email.

Best regards,
VoxVPN Team
`;

    const result = await base44.integrations.Core.SendEmail({
      to: email,
      subject: 'Your VoxVPN Setup is Ready',
      body: emailBody,
      from_name: 'VoxVPN',
    });

    return Response.json({
      success: true,
      message: 'Welcome email sent',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});