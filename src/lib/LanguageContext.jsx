import { createContext, useState, useEffect, useContext } from 'react';

export const LanguageContext = createContext();

/**
 * Country (ISO 3166-1 alpha-2) → language code.
 * Covers every recognised country; unmapped ones fall back to English.
 */
export const COUNTRY_LANGUAGE = {
  // English
  US: 'en', GB: 'en', AU: 'en', NZ: 'en', IE: 'en', ZA: 'en', NG: 'en', GH: 'en',
  KE: 'en', UG: 'en', TZ: 'en', JM: 'en', TT: 'en', BZ: 'en', GY: 'en', BW: 'en',
  ZW: 'en', ZM: 'en', MW: 'en', GM: 'en', SL: 'en', LR: 'en', BB: 'en', BS: 'en',
  AG: 'en', DM: 'en', GD: 'en', KN: 'en', LC: 'en', VC: 'en', FJ: 'en', PG: 'en',
  SB: 'en', VU: 'en', NA: 'en', LS: 'en', SZ: 'en', MT: 'en', PH: 'en', SG: 'en',
  MY: 'en', IN: 'hi', CM: 'en', RW: 'en', BI: 'en', SO: 'en', SS: 'en', CA: 'en',
  // Spanish
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es', EC: 'es',
  GT: 'es', CU: 'es', DO: 'es', UY: 'es', PY: 'es', BO: 'es', CR: 'es', PA: 'es',
  HN: 'es', SV: 'es', NI: 'es', PR: 'es', GQ: 'es',
  // French
  FR: 'fr', BE: 'fr', LU: 'fr', MC: 'fr', CD: 'fr', CI: 'fr', SN: 'fr', ML: 'fr',
  BF: 'fr', NE: 'fr', GN: 'fr', BJ: 'fr', TG: 'fr', CF: 'fr', GA: 'fr', CG: 'fr',
  TD: 'fr', KM: 'fr', DJ: 'fr', RE: 'fr', MQ: 'fr', GF: 'fr', HT: 'fr', MA: 'fr',
  DZ: 'fr', TN: 'fr',
  // German
  DE: 'de', AT: 'de', LI: 'de', CH: 'de',
  // Chinese
  CN: 'zh', TW: 'zh', HK: 'zh',
  // Japanese
  JP: 'ja',
  // Russian
  RU: 'ru', BY: 'ru', KZ: 'ru', KG: 'ru',
  // Arabic
  SA: 'ar', AE: 'ar', EG: 'ar', IQ: 'ar', JO: 'ar', KW: 'ar', LB: 'ar', OM: 'ar',
  QA: 'ar', YE: 'ar', PS: 'ar', SY: 'ar', SD: 'ar', LY: 'ar', MR: 'ar', EH: 'ar',
  BH: 'ar',
  // Portuguese
  PT: 'pt', BR: 'pt', AO: 'pt', MZ: 'pt', CV: 'pt', GW: 'pt', TL: 'pt', ST: 'pt',
  // Italian
  IT: 'it', SM: 'it', VA: 'it',
  // Dutch
  NL: 'nl', SR: 'nl',
  // Polish
  PL: 'pl',
  // Turkish
  TR: 'tr', AZ: 'tr', TM: 'tr', UZ: 'tr',
  // Korean
  KR: 'ko', KP: 'ko',
  // Indonesian
  ID: 'id',
  // Thai
  TH: 'th',
  // Vietnamese
  VN: 'vi',
  // Swedish
  SE: 'sv',
  // Norwegian
  NO: 'no',
  // Danish
  DK: 'da',
  // Finnish
  FI: 'fi',
  // Hebrew
  IL: 'he',
  // Greek
  GR: 'el',
  // Czech
  CZ: 'cs',
  // Romanian
  RO: 'ro',
  // Hungarian
  HU: 'hu',
  // Ukrainian
  UA: 'uk',
  // Persian
  IR: 'fa', AF: 'fa',
  // Hindi / Bengali / Urdu
  LK: 'hi', PK: 'ur', BD: 'bn',
};

/** Languages that render right-to-left. */
export const RTL_LANGUAGES = new Set(['ar', 'he', 'fa', 'ur']);

/** Human-friendly labels + flag for each supported language. */
export const LANGUAGES = {
  en: { label: 'English',    flag: '🇬🇧' },
  es: { label: 'Español',    flag: '🇪🇸' },
  fr: { label: 'Français',   flag: '🇫🇷' },
  de: { label: 'Deutsch',    flag: '🇩🇪' },
  zh: { label: '中文',        flag: '🇨🇳' },
  ja: { label: '日本語',      flag: '🇯🇵' },
  ru: { label: 'Русский',    flag: '🇷🇺' },
  ar: { label: 'العربية',     flag: '🇸🇦' },
  pt: { label: 'Português',  flag: '🇵🇹' },
  it: { label: 'Italiano',   flag: '🇮🇹' },
  nl: { label: 'Nederlands', flag: '🇳🇱' },
  pl: { label: 'Polski',     flag: '🇵🇱' },
  tr: { label: 'Türkçe',     flag: '🇹🇷' },
  ko: { label: '한국어',      flag: '🇰🇷' },
  id: { label: 'Indonesia',  flag: '🇮🇩' },
  th: { label: 'ไทย',         flag: '🇹🇭' },
  vi: { label: 'Tiếng Việt', flag: '🇻🇳' },
  sv: { label: 'Svenska',    flag: '🇸🇪' },
  no: { label: 'Norsk',      flag: '🇳🇴' },
  da: { label: 'Dansk',      flag: '🇩🇰' },
  fi: { label: 'Suomi',      flag: '🇫🇮' },
  he: { label: 'עברית',       flag: '🇮🇱' },
  el: { label: 'Ελληνικά',    flag: '🇬🇷' },
  cs: { label: 'Čeština',    flag: '🇨🇿' },
  ro: { label: 'Română',     flag: '🇷🇴' },
  hu: { label: 'Magyar',     flag: '🇭🇺' },
  uk: { label: 'Українська', flag: '🇺🇦' },
  fa: { label: 'فارسی',        flag: '🇮🇷' },
  hi: { label: 'हिन्दी',       flag: '🇮🇳' },
  ur: { label: 'اردو',        flag: '🇵🇰' },
  bn: { label: 'বাংলা',       flag: '🇧🇩' },
};

const translations = {
  en: { home: 'Home', features: 'Features', servers: 'Servers', pricing: 'Pricing', support: 'Support', logIn: 'Log In', signUp: 'Sign Up', choosePlan: 'Choose a Plan' },
  es: { home: 'Inicio', features: 'Características', servers: 'Servidores', pricing: 'Precios', support: 'Soporte', logIn: 'Iniciar sesión', signUp: 'Registrarse', choosePlan: 'Elegir un plan' },
  fr: { home: 'Accueil', features: 'Caractéristiques', servers: 'Serveurs', pricing: 'Tarification', support: 'Support', logIn: 'Connexion', signUp: "S'inscrire", choosePlan: 'Choisir un forfait' },
  de: { home: 'Startseite', features: 'Funktionen', servers: 'Server', pricing: 'Preisgestaltung', support: 'Unterstützung', logIn: 'Anmelden', signUp: 'Registrieren', choosePlan: 'Plan wählen' },
  zh: { home: '首页', features: '功能', servers: '服务器', pricing: '定价', support: '支持', logIn: '登录', signUp: '注册', choosePlan: '选择计划' },
  ja: { home: 'ホーム', features: '機能', servers: 'サーバー', pricing: '料金', support: 'サポート', logIn: 'ログイン', signUp: '登録', choosePlan: 'プランを選択' },
  ru: { home: 'Главная', features: 'Возможности', servers: 'Серверы', pricing: 'Цены', support: 'Поддержка', logIn: 'Вход', signUp: 'Зарегистрироваться', choosePlan: 'Выбрать план' },
  ar: { home: 'الرئيسية', features: 'الميزات', servers: 'الخوادم', pricing: 'التسعير', support: 'الدعم', logIn: 'تسجيل الدخول', signUp: 'التسجيل', choosePlan: 'اختر خطة' },
  pt: { home: 'Início', features: 'Recursos', servers: 'Servidores', pricing: 'Preços', support: 'Suporte', logIn: 'Entrar', signUp: 'Registrar', choosePlan: 'Escolher um plano' },
  it: { home: 'Home', features: 'Funzioni', servers: 'Server', pricing: 'Prezzi', support: 'Supporto', logIn: 'Accedi', signUp: 'Registrati', choosePlan: 'Scegli un piano' },
  nl: { home: 'Home', features: 'Functies', servers: 'Servers', pricing: 'Prijzen', support: 'Ondersteuning', logIn: 'Inloggen', signUp: 'Registreren', choosePlan: 'Kies een abonnement' },
  pl: { home: 'Strona główna', features: 'Funkcje', servers: 'Serwery', pricing: 'Cennik', support: 'Wsparcie', logIn: 'Zaloguj', signUp: 'Zarejestruj', choosePlan: 'Wybierz plan' },
  tr: { home: 'Ana Sayfa', features: 'Özellikler', servers: 'Sunucular', pricing: 'Fiyatlandırma', support: 'Destek', logIn: 'Giriş', signUp: 'Kayıt Ol', choosePlan: 'Plan Seç' },
  ko: { home: '홈', features: '기능', servers: '서버', pricing: '가격', support: '지원', logIn: '로그인', signUp: '가입', choosePlan: '플랜 선택' },
  id: { home: 'Beranda', features: 'Fitur', servers: 'Server', pricing: 'Harga', support: 'Dukungan', logIn: 'Masuk', signUp: 'Daftar', choosePlan: 'Pilih Paket' },
  th: { home: 'หน้าแรก', features: 'คุณสมบัติ', servers: 'เซิร์ฟเวอร์', pricing: 'ราคา', support: 'สนับสนุน', logIn: 'เข้าสู่ระบบ', signUp: 'สมัคร', choosePlan: 'เลือกแผน' },
  vi: { home: 'Trang chủ', features: 'Tính năng', servers: 'Máy chủ', pricing: 'Giá', support: 'Hỗ trợ', logIn: 'Đăng nhập', signUp: 'Đăng ký', choosePlan: 'Chọn gói' },
  sv: { home: 'Hem', features: 'Funktioner', servers: 'Servrar', pricing: 'Priser', support: 'Support', logIn: 'Logga in', signUp: 'Registrera', choosePlan: 'Välj ett abonnemang' },
  he: { home: 'בית', features: 'תכונות', servers: 'שרתים', pricing: 'תמחור', support: 'תמיכה', logIn: 'התחבר', signUp: 'הרשמה', choosePlan: 'בחר תוכנית' },
  hi: { home: 'होम', features: 'विशेषताएँ', servers: 'सर्वर', pricing: 'मूल्य', support: 'सहायता', logIn: 'लॉग इन', signUp: 'साइन अप', choosePlan: 'योजना चुनें' },
  fa: { home: 'خانه', features: 'ویژگی‌ها', servers: 'سرورها', pricing: 'قیمت', support: 'پشتیبانی', logIn: 'ورود', signUp: 'ثبت‌نام', choosePlan: 'یک طرح انتخاب کنید' },
  no: { home: 'Hjem', features: 'Funksjoner', servers: 'Servere', pricing: 'Priser', support: 'Støtte', logIn: 'Logg inn', signUp: 'Registrer', choosePlan: 'Velg et abonnement' },
  da: { home: 'Hjem', features: 'Funktioner', servers: 'Servere', pricing: 'Priser', support: 'Support', logIn: 'Log ind', signUp: 'Tilmeld', choosePlan: 'Vælg et abonnement' },
  fi: { home: 'Etusivu', features: 'Ominaisuudet', servers: 'Palvelimet', pricing: 'Hinnat', support: 'Tuki', logIn: 'Kirjaudu', signUp: 'Rekisteröidy', choosePlan: 'Valitse suunnitelma' },
  el: { home: 'Αρχική', features: 'Χαρακτηριστικά', servers: 'Διακομιστές', pricing: 'Τιμές', support: 'Υποστήριξη', logIn: 'Σύνδεση', signUp: 'Εγγραφή', choosePlan: 'Επιλογή πακέτου' },
  cs: { home: 'Domů', features: 'Funkce', servers: 'Servery', pricing: 'Ceny', support: 'Podpora', logIn: 'Přihlášení', signUp: 'Registrace', choosePlan: 'Vybrat plán' },
  ro: { home: 'Acasă', features: 'Funcții', servers: 'Servere', pricing: 'Prețuri', support: 'Suport', logIn: 'Conectare', signUp: 'Înregistrare', choosePlan: 'Alege un plan' },
  hu: { home: 'Főoldal', features: 'Funkciók', servers: 'Szerverek', pricing: 'Árak', support: 'Támogatás', logIn: 'Bejelentkezés', signUp: 'Regisztráció', choosePlan: 'Válasszon csomagot' },
  uk: { home: 'Головна', features: 'Можливості', servers: 'Сервери', pricing: 'Ціни', support: 'Підтримка', logIn: 'Увійти', signUp: 'Реєстрація', choosePlan: 'Обрати план' },
  ur: { home: 'ہوم', features: 'خصوصیات', servers: 'سرورز', pricing: 'قیمتیں', support: 'معاونت', logIn: 'لاگ اِن', signUp: 'سائن اپ', choosePlan: 'پلان منتخب کریں' },
  bn: { home: 'হোম', features: 'বৈশিষ্ট্য', servers: 'সার্ভার', pricing: 'মূল্য', support: 'সহায়তা', logIn: 'লগ ইন', signUp: 'সাইন আপ', choosePlan: 'প্ল্যান বেছে নিন' },
};

export function languageForCountry(countryCode) {
  if (!countryCode) return 'en';
  return COUNTRY_LANGUAGE[countryCode.toUpperCase()] || 'en';
}

/** Derive a country flag emoji from an ISO 3166-1 alpha-2 code (e.g. "GH" → 🇬🇭). */
export function countryFlag(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '🏳️';
  return String.fromCodePoint(
    ...[...countryCode.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );
}

/**
 * IANA timezone → ISO 3166-1 alpha-2 country code.
 * Offline fallback used when every IP geolocation provider is blocked/fails.
 */
const TZ_TO_COUNTRY = {
  'Africa/Accra': 'GH', 'Africa/Lagos': 'NG', 'Africa/Nairobi': 'KE',
  'Africa/Kampala': 'UG', 'Africa/Dar_es_Salaam': 'TZ', 'Africa/Cairo': 'EG',
  'Africa/Casablanca': 'MA', 'Africa/Johannesburg': 'ZA', 'Africa/Tunis': 'TN',
  'Africa/Algiers': 'DZ', 'Africa/Khartoum': 'SD', 'Africa/Dakar': 'SN',
  'Africa/Abidjan': 'CI', 'Africa/Addis_Ababa': 'ET', 'Africa/Douala': 'CM',
  'Africa/Kinshasa': 'CD', 'Africa/Brazzaville': 'CG', 'Africa/Libreville': 'GA',
  'Africa/Bangui': 'CF', 'Africa/Lome': 'TG', 'Africa/Porto-Novo': 'BJ',
  'Africa/Ouagadougou': 'BF', 'Africa/Niamey': 'NE', 'Africa/Bamako': 'ML',
  'Africa/Conakry': 'GN', 'Africa/Freetown': 'SL', 'Africa/Monrovia': 'LR',
  'Africa/Banjul': 'GM', 'Africa/Nouakchott': 'MR', 'Africa/Luanda': 'AO',
  'Africa/Maputo': 'MZ', 'Africa/Harare': 'ZW', 'Africa/Lusaka': 'ZM',
  'Africa/Blantyre': 'MW', 'Africa/Gaborone': 'BW', 'Africa/Windhoek': 'NA',
  'Africa/Maseru': 'LS', 'Africa/Mbabane': 'SZ', 'Africa/Tripoli': 'LY',
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US',
  'America/Los_Angeles': 'US', 'America/Phoenix': 'US', 'America/Anchorage': 'US',
  'America/Honolulu': 'US', 'America/Toronto': 'CA', 'America/Vancouver': 'CA',
  'America/Halifax': 'CA', 'America/Edmonton': 'CA', 'America/Winnipeg': 'CA',
  'America/Mexico_City': 'MX', 'America/Bogota': 'CO', 'America/Lima': 'PE',
  'America/Santiago': 'CL', 'America/Buenos_Aires': 'AR', 'America/Sao_Paulo': 'BR',
  'America/Caracas': 'VE', 'America/Guayaquil': 'EC', 'America/Montevideo': 'UY',
  'America/Asuncion': 'PY', 'America/La_Paz': 'BO', 'America/Havana': 'CU',
  'America/Santo_Domingo': 'DO', 'America/San_Juan': 'PR', 'America/Panama': 'PA',
  'America/Costa_Rica': 'CR', 'America/Guatemala': 'GT', 'America/Tegucigalpa': 'HN',
  'America/El_Salvador': 'SV', 'America/Managua': 'NI', 'America/Belize': 'BZ',
  'America/Jamaica': 'JM', 'America/Port_of_Spain': 'TT', 'America/Barbados': 'BB',
  'America/Nassau': 'BS', 'America/Port-au-Prince': 'HT',
  'Europe/London': 'GB', 'Europe/Dublin': 'IE', 'Europe/Paris': 'FR',
  'Europe/Berlin': 'DE', 'Europe/Madrid': 'ES', 'Europe/Rome': 'IT',
  'Europe/Amsterdam': 'NL', 'Europe/Brussels': 'BE', 'Europe/Vienna': 'AT',
  'Europe/Zurich': 'CH', 'Europe/Lisbon': 'PT', 'Europe/Stockholm': 'SE',
  'Europe/Oslo': 'NO', 'Europe/Copenhagen': 'DK', 'Europe/Helsinki': 'FI',
  'Europe/Warsaw': 'PL', 'Europe/Prague': 'CZ', 'Europe/Budapest': 'HU',
  'Europe/Bucharest': 'RO', 'Europe/Sofia': 'BG', 'Europe/Athens': 'GR',
  'Europe/Istanbul': 'TR', 'Europe/Moscow': 'RU', 'Europe/Kiev': 'UA',
  'Europe/Vilnius': 'LT', 'Europe/Riga': 'LV', 'Europe/Tallinn': 'EE',
  'Europe/Zagreb': 'HR', 'Europe/Belgrade': 'RS', 'Europe/Bratislava': 'SK',
  'Europe/Ljubljana': 'SI', 'Europe/Sarajevo': 'BA', 'Europe/Skopje': 'MK',
  'Europe/Tirane': 'AL', 'Europe/Reykjavik': 'IS', 'Europe/Luxembourg': 'LU',
  'Europe/Monaco': 'MC', 'Europe/Malta': 'MT',
  'Asia/Tokyo': 'JP', 'Asia/Seoul': 'KR', 'Asia/Shanghai': 'CN',
  'Asia/Hong_Kong': 'HK', 'Asia/Taipei': 'TW', 'Asia/Singapore': 'SG',
  'Asia/Kuala_Lumpur': 'MY', 'Asia/Bangkok': 'TH', 'Asia/Jakarta': 'ID',
  'Asia/Manila': 'PH', 'Asia/Ho_Chi_Minh': 'VN', 'Asia/Kolkata': 'IN',
  'Asia/Karachi': 'PK', 'Asia/Dhaka': 'BD', 'Asia/Colombo': 'LK',
  'Asia/Kathmandu': 'NP', 'Asia/Tehran': 'IR', 'Asia/Baghdad': 'IQ',
  'Asia/Riyadh': 'SA', 'Asia/Dubai': 'AE', 'Asia/Doha': 'QA',
  'Asia/Kuwait': 'KW', 'Asia/Muscat': 'OM', 'Asia/Baku': 'AZ',
  'Asia/Tashkent': 'UZ', 'Asia/Almaty': 'KZ', 'Asia/Bishkek': 'KG',
  'Asia/Yerevan': 'AM', 'Asia/Tbilisi': 'GE', 'Asia/Jerusalem': 'IL',
  'Asia/Beirut': 'LB', 'Asia/Damascus': 'SY', 'Asia/Amman': 'JO',
  'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Australia/Brisbane': 'AU',
  'Australia/Perth': 'AU', 'Australia/Adelaide': 'AU', 'Pacific/Auckland': 'NZ',
  'Pacific/Fiji': 'FJ', 'Pacific/Guam': 'GU',
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const [country, setCountry] = useState(null);
  const [detected, setDetected] = useState(false);

  // Apply RTL direction whenever language changes
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const isRtl = RTL_LANGUAGES.has(language);
    document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  useEffect(() => {
    // Restore a manually-chosen language immediately so the UI never flashes
    // the wrong language before detection finishes.
    const savedManual = localStorage.getItem('voxvpn_language_manual');
    if (savedManual) setLanguage(savedManual);

    // ALWAYS re-detect the country from the IP on every load for accuracy —
    // never trust a persisted country blindly, so "France shows France".
    let done = false;

    const finish = (cc) => {
      if (done) return;
      done = true;
      // Re-read the manual flag at resolution time (not at mount time) so a
      // manual change made while detection was in-flight is never overwritten.
      const manualNow = localStorage.getItem('voxvpn_language_manual');
      if (cc) {
        const code = cc.toUpperCase();
        setCountry(code);
        localStorage.setItem('voxvpn_country', code);
        if (!manualNow) {
          const lang = languageForCountry(code);
          setLanguage(lang);
          localStorage.setItem('voxvpn_language', lang);
        }
      } else if (!manualNow) {
        // No IP info and no manual choice — keep default 'en'.
        setLanguage((prev) => prev);
      }
      setDetected(true);
    };

    const fetchWithTimeout = (url, ms, isText = false) =>
      Promise.race([
        fetch(url, { cache: 'no-store' }).then((r) => (isText ? r.text() : r.json())),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
      ]).catch(() => null);

    const cfTrace = () =>
      fetchWithTimeout('https://www.cloudflare.com/cdn-cgi/trace', 3000, true)
        .then((text) => {
          const m = text && text.match(/^loc=(\w{2})$/m);
          return m && m[1] ? m[1] : null;
        });

    const jsonProvider = (url, parse) =>
      fetchWithTimeout(url, 3500).then((d) => (d && parse(d)) || null);

    // Offline fallback: infer the country from the browser timezone so
    // detection still resolves when every IP provider is blocked/fails.
    const tzFallback = () => {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return TZ_TO_COUNTRY[tz] || null;
      } catch {
        return null;
      }
    };

    const safety = setTimeout(() => {
      const tz = tzFallback();
      finish(tz);
    }, 5000);

    Promise.any([
      cfTrace(),
      jsonProvider('https://ipwho.is/?fields=country_code,success', (d) => d && d.success !== false && d.country_code),
      jsonProvider('https://ipapi.co/json/', (d) => d && d.country_code),
      jsonProvider('https://get.geojs.io/v1/ip/country.json', (d) => d && d.country),
      jsonProvider('https://api.db-ip.com/v2/free/self', (d) => d && d.country_code),
      jsonProvider('https://ipinfo.io/json', (d) => d && d.country),
    ])
      .then((cc) => { clearTimeout(safety); finish(cc || tzFallback()); })
      .catch(() => { clearTimeout(safety); finish(tzFallback()); });
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('voxvpn_language', lang);
    localStorage.setItem('voxvpn_language_manual', lang); // mark as a deliberate user choice
  };

  // Revert to the language that matches the detected country, clearing any
  // manual override so future re-detection can adjust automatically.
  const resetToAuto = () => {
    localStorage.removeItem('voxvpn_language_manual');
    const auto = country ? languageForCountry(country) : 'en';
    setLanguage(auto);
    localStorage.setItem('voxvpn_language', auto);
  };

  const t = (key) => translations[language]?.[key] || translations.en[key] || key;

  return (
    <LanguageContext.Provider
      value={{
        language,
        country,
        detected,
        changeLanguage,
        resetToAuto,
        t,
        languages: LANGUAGES,
        countryFlag,
        rtl: RTL_LANGUAGES.has(language),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}