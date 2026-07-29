import { resolveClientIp, detectLanguageFromIp } from '../../shared/languageMap.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * detectLanguageByIp — resolves the visitor's preferred interface language
 * from their public IP address via a multi-provider geo-IP lookup.
 * Public endpoint (no auth) — used on first visit to auto-localize the site.
 * Returns: { language, country_code, country, ip }
 */
export default async function (req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  try {
    const clientIp = resolveClientIp(req);
    const result = await detectLanguageFromIp(clientIp);
    return Response.json(result, { status: 200, headers: CORS });
  } catch (error) {
    // Never break the UI over a geo-IP failure — fall back to English
    return Response.json(
      { language: 'en', country_code: '', country: '', error: error.message },
      { status: 200, headers: CORS }
    );
  }
}