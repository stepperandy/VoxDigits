import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { full_name, email, password } = body;

    // Validate required fields
    if (!full_name || !email || !password) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return Response.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return Response.json(
        { error: 'Password must contain uppercase, lowercase, and numbers' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user already exists
    try {
      const existingUsers = await base44.asServiceRole.entities.User.filter({ email: email });
      if (existingUsers.length > 0) {
        return Response.json(
          { error: 'Email already registered' },
          { status: 409 }
        );
      }
    } catch (err) {
      // Continue if filter fails - user likely doesn't exist
    }

    // Invite user to the app (creates account with email and role='user')
    // This creates a real user in the Base44 auth system that can login everywhere
    await base44.users.inviteUser(email, 'user');

    // Create VPN subscription for new user
    await base44.asServiceRole.entities.VPNSubscription.create({
      user_email: email,
      plan: 'Basic',
      status: 'expired', // Requires payment to activate
      billing_cycle: 'monthly',
      start_date: new Date().toISOString(),
      renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      max_devices: 1,
      price: 0,
    });

    // Send welcome email
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      subject: '🎉 Welcome to VoxVPN',
      body: `Hi ${full_name},\n\nYour account has been created successfully!\n\nYou can now login to:\n- VoxVPN Web Dashboard: ${Deno.env.get('APP_URL')}\n- VoxVPN Desktop/Mobile App\n\nYour login credentials:\nEmail: ${email}\n\nNext step: Choose a subscription plan and secure your connection.\n\nStay safe!`,
    });

    return Response.json({
      success: true,
      message: 'Account created successfully',
      user: {
        email: email,
        full_name: full_name,
      },
      redirect: '/auth-login',
    });
  } catch (error) {
    console.error('Email signup error:', error.message);
    return Response.json(
      { error: error.message || 'Signup failed' },
      { status: 500 }
    );
  }
});