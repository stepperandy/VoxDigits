import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import {
  COUNTRY_LANG,
  SUPPORTED_LANGUAGES,
  LANGUAGE_LABELS,
  resolveLanguage,
  detectLanguageFromIp,
} from '../../shared/languageMap.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * testLanguageDetection — admin-only tool to verify the language-detection
 * pipeline for a given country code or IP address.
 *
 * Body (all optional):
 *   ip           — test the full IP → country → language pipeline
 *   country_code — test the country → language mapping directly (e.g. "DE")
 *
 * Returns: { language, country_code, country, ip, supported_languages,
 *            language_labels, country_lang_map }
 */
export default async function (req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401, headers: CORS });
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden — admin only' }, { status: 403, headers: CORS });
    }

    let body = {};
    try { body = await req.json(); } catch { /* empty body is fine */ }
    const { ip, country_code } = body || {};

    let result = { language: 'en', country_code: '', country: '', ip: '' };

    if (ip) {
      result = await detectLanguageFromIp(String(ip).trim());
    } else if (country_code) {
      const cc = String(country_code).trim().toUpperCase();
      result = { language: resolveLanguage(cc), country_code: cc, country: '', ip: '' };
    }

    return Response.json(
      {
        ...result,
        supported_languages: SUPPORTED_LANGUAGES,
        language_labels: LANGUAGE_LABELS,
        country_lang_map: COUNTRY_LANG,
      },
      { status: 200, headers: CORS }
    );
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: CORS });
  }
}