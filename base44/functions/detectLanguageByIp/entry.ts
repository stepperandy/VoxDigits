const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Map ISO country codes to a supported interface language.
// Keys not listed default to English ('en').
const COUNTRY_LANG = {
  // Spanish
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es', EC: 'es',
  GT: 'es', CU: 'es', BO: 'es', DO: 'es', HN: 'es', PY: 'es', UY: 'es', CR: 'es',
  PA: 'es', NI: 'es', SV: 'es', PR: 'es',
  // French
  FR: 'fr', BE: 'fr', CA: 'fr', SN: 'fr', CI: 'fr', ML: 'fr', BF: 'fr', NE: 'fr',
  TG: 'fr', BJ: 'fr', CD: 'fr', MG: 'fr', CM: 'fr', GA: 'fr', TD: 'fr', CG: 'fr',
  // German
  DE: 'de', AT: 'de', CH: 'de', LI: 'de',
  // Chinese
  CN: 'zh', TW: 'zh', HK: 'zh', SG: 'zh',
  // Japanese
  JP: 'ja',
  // Russian
  RU: 'ru', BY: 'ru', KZ: 'ru', KG: 'ru',
  // Arabic
  SA: 'ar', AE: 'ar', EG: 'ar', IQ: 'ar', SY: 'ar', JO: 'ar', LB: 'ar', PS: 'ar',
  YE: 'ar', OM: 'ar', KW: 'ar', QA: 'ar', BH: 'ar', DZ: 'ar', MA: 'ar', TN: 'ar',
  LY: 'ar', SD: 'ar', MR: 'ar', DJ: 'ar', SO: 'ar', KM: 'ar',
};

/**
 * detectLanguageByIp — resolves the visitor's preferred interface language
 * from their public IP address via a geo-IP lookup. Returns:
 *   { language, country_code, country, ip }
 * No auth required — used on first visit to auto-localize the public site.
 */
export default async function (req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  try {
    // Resolve the real client IP from proxy headers
    const fwd = req.headers.get('x-forwarded-for');
    const clientIp = fwd
      ? fwd.split(',')[0].trim()
      : req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || '';

    // ipwho.is auto-detects the caller IP when none is supplied
    const url = clientIp ? `https://ipwho.is/${encodeURIComponent(clientIp)}` : 'https://ipwho.is/';
    const resp = await fetch(url, { headers: { Accept: 'application/json' } });
    const data = await resp.json();

    const countryCode = (data?.country_code || '').toUpperCase();
    const language = COUNTRY_LANG[countryCode] || 'en';

    return Response.json({
      language,
      country_code: countryCode,
      country: data?.country || '',
      ip: clientIp || data?.ip || '',
    }, { status: 200, headers: CORS });
  } catch (error) {
    // Never break the UI over a geo-IP failure — fall back to English
    return Response.json(
      { language: 'en', country_code: '', country: '', error: error.message },
      { status: 200, headers: CORS }
    );
  }
}