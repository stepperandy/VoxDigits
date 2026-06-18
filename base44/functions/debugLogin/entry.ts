import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    const received = {
      email,
      email_length: email?.length,
      password_length: password?.length,
    };

    // Use the SDK's auth method (same as the website)
    let sdkResult = null;
    try {
      const result = await base44.auth.loginViaEmailPassword(email, password);
      sdkResult = { success: true, has_token: !!result.access_token, user_email: result.user?.email };
    } catch (e) {
      sdkResult = { success: false, error: e.message };
    }

    return new Response(JSON.stringify({
      received,
      sdk_login: sdkResult,
    }), { status: 200, headers: CORS });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: CORS });
  }
});