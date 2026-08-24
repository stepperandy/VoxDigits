import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { consumeCredit } from '../../shared/freeCredits.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

export default async function (req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: CORS });

    const body = await req.json().catch(() => ({}));
    const result = await consumeCredit(base44.asServiceRole, user.email, body.billing_cycle);

    const status = result.status || (result.success ? 200 : 400);
    return new Response(JSON.stringify(result), { status, headers: CORS });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: CORS });
  }
}