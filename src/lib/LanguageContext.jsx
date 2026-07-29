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
    const saved = localStorage.getItem('voxvpn_language');
    const savedCountry = localStorage.getItem('voxvpn_country');
    if (saved) {
      setLanguage(saved);
      if (savedCountry) setCountry(savedCountry);
      setDetected(true);
      return;
    }

    // Race all geolocation providers in PARALLEL so the fastest one wins.
    let done = false;
    const finish = (cc) => {
      if (done) return;
      done = true;
      if (cc) {
        const code = cc.toUpperCase();
        setCountry(code);
        localStorage.setItem('voxvpn_country', code);
        const lang = languageForCountry(code);
        setLanguage(lang);
        localStorage.setItem('voxvpn_language', lang);
      }
      setDetected(true);
    };

    const fetchWithTimeout = (url, ms, isText = false) =>
      Promise.race([
        fetch(url, { cache: 'no-store' }).then((r) => (isText ? r.text() : r.json())),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
      ]);

    // Cloudflare trace — anycast, no rate limits, always CORS-enabled, text format
    const cfTrace = () =>
      fetchWithTimeout('https://www.cloudflare.com/cdn-cgi/trace', 3000, true)
        .then((text) => {
          const m = text.match(/^loc=(\w{2})$/m);
          if (m && m[1]) return m[1];
          return Promise.reject(new Error('no cc'));
        })
        .catch(() => null);

    const jsonProvider = (url, parse) =>
      fetchWithTimeout(url, 3500)
        .then((d) => (d && parse(d)) || Promise.reject(new Error('no cc')))
        .catch(() => null);

    // Hard 5s safety cap so detection always completes quickly
    const safety = setTimeout(() => finish(null), 5000);

    Promise.any([
      cfTrace(),
      jsonProvider('https://ipwho.is/?fields=country_code,success', (d) => d && d.success !== false && d.country_code),
      jsonProvider('https://ipapi.co/json/', (d) => d && d.country_code),
      jsonProvider('https://get.geojs.io/v1/ip/country.json', (d) => d && d.country),
      jsonProvider('https://ipinfo.io/json', (d) => d && d.country),
    ])
      .then((cc) => { clearTimeout(safety); finish(cc); })
      .catch(() => { clearTimeout(safety); finish(null); });
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('voxvpn_language', lang);
  };

  const t = (key) => translations[language]?.[key] || translations.en[key] || key;

  return (
    <LanguageContext.Provider value={{ language, country, detected, changeLanguage, t, languages: LANGUAGES, rtl: RTL_LANGUAGES.has(language) }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}