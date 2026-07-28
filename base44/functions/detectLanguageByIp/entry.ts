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

function resolveClientIp(req) {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return (
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-client-ip') ||
    ''
  );
}

async function lookupIpwhois(ip) {
  const url = ip ? `https://ipwho.is/${encodeURIComponent(ip)}` : 'https://ipwho.is/';
  const resp = await fetch(url, { headers: { Accept: 'application/json' } });
  const data = await resp.json();
  if (data && data.success !== false && data.country_code) {
    return { countryCode: String(data.country_code).toUpperCase(), country: data.country || '' };
  }
  return null;
}

async function lookupIpapi(ip) {
  const url = ip ? `https://ipapi.co/${encodeURIComponent(ip)}/json/` : 'https://ipapi.co/json/';
  const resp = await fetch(url, { headers: { Accept: 'application/json' } });
  const data = await resp.json();
  // ipapi.co exposes the 2-letter code as `country_code` (and sometimes `country`)
  const code = data?.country_code || (data?.country && data.country.length === 2 ? data.country : '');
  if (code) {
    return { countryCode: String(code).toUpperCase(), country: data?.country_name || '' };
  }
  return null;
}

async function lookupIpApi(ip) {
  // ip-api.com free tier is HTTP-only; reliable fallback for residential IPs
  const url = ip
    ? `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=countryCode,country`
    : 'http://ip-api.com/json/?fields=countryCode,country';
  const resp = await fetch(url, { headers: { Accept: 'application/json' } });
  const data = await resp.json();
  if (data?.countryCode) {
    return { countryCode: String(data.countryCode).toUpperCase(), country: data.country || '' };
  }
  return null;
}

/**
 * detectLanguageByIp — resolves the visitor's preferred interface language
 * from their public IP address via a multi-provider geo-IP lookup.
 * Returns: { language, country_code, country, ip }
 * No auth required — used on first visit to auto-localize the public site.
 */
export default async function (req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  try {
    const clientIp = resolveClientIp(req);

    let result = null;
    for (const lookup of [lookupIpwhois, lookupIpapi, lookupIpApi]) {
      try {
        result = await lookup(clientIp);
        if (result?.countryCode) break;
      } catch {
        /* try next provider */
      }
    }

    const countryCode = result?.countryCode || '';
    const language = COUNTRY_LANG[countryCode] || 'en';

    return Response.json(
      {
        language,
        country_code: countryCode,
        country: result?.country || '',
        ip: clientIp,
      },
      { status: 200, headers: CORS }
    );
  } catch (error) {
    // Never break the UI over a geo-IP failure — fall back to English
    return Response.json(
      { language: 'en', country_code: '', country: '', error: error.message },
      { status: 200, headers: CORS }
    );
  }
}