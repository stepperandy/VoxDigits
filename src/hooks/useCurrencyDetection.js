import { useState, useEffect } from 'react';

const CURRENCY_SYMBOLS = {
  'CNY': '¥', 'USD': '$', 'GBP': '£', 'JPY': '¥', 'INR': '₹',
  'BRL': 'R$', 'AUD': 'A$', 'EUR': '€',
};

const COUNTRY_CURRENCY = {
  'CN': 'CNY', 'US': 'USD', 'GB': 'GBP', 'JP': 'JPY', 'IN': 'INR',
  'BR': 'BRL', 'AU': 'AUD',
  'FR': 'EUR', 'DE': 'EUR', 'IT': 'EUR', 'ES': 'EUR', 'NL': 'EUR',
  'BE': 'EUR', 'AT': 'EUR', 'IE': 'EUR', 'PT': 'EUR', 'GR': 'EUR',
  'PL': 'EUR', 'SE': 'EUR', 'NO': 'EUR', 'CH': 'EUR',
};

const FALLBACK_RATES = {
  'CNY': 7.3, 'USD': 1, 'GBP': 0.79, 'JPY': 155, 'INR': 83,
  'BRL': 4.97, 'AUD': 1.50, 'EUR': 0.92,
};

// Detect China via browser timezone or locale — works even when geo APIs are blocked
function detectChinaFromLocale() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const locale = navigator.language || navigator.languages?.[0] || '';
    return tz === 'Asia/Shanghai' || tz === 'Asia/Urumqi' ||
           locale.toLowerCase().startsWith('zh') || locale.toLowerCase().includes('cn');
  } catch { return false; }
}

export function useCurrencyDetection() {
  const [currency, setCurrency] = useState({ code: 'USD', rate: 1, symbol: '$' });
  const [countryCode, setCountryCode] = useState('US');

  useEffect(() => {
    const fetchLiveRates = async () => {
      try {
        const cached = JSON.parse(localStorage.getItem('voxvpn_live_rates') || 'null');
        if (cached && Date.now() - cached.fetchedAt < 3600000) {
          return cached.rates;
        }
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await res.json();
        if (data?.rates) {
          localStorage.setItem('voxvpn_live_rates', JSON.stringify({ rates: data.rates, fetchedAt: Date.now() }));
          return data.rates;
        }
      } catch { /* fall through to fallback rates */ }
      return null;
    };

    const makeCurrency = (currencyCode, rate) => ({
      code: currencyCode,
      rate: rate || FALLBACK_RATES[currencyCode] || 1,
      symbol: CURRENCY_SYMBOLS[currencyCode] || '$',
    });

    Promise.all([
      fetch('https://ipapi.co/json/').then(r => r.json()).catch(() => ({})),
      fetchLiveRates(),
    ]).then(([geoData, liveRates]) => {
      let code = geoData.country_code;
      // Fallback: if geo API failed (common in China), detect via timezone/locale
      if (!code && detectChinaFromLocale()) {
        code = 'CN';
      }
      code = code || 'US';
      setCountryCode(code);
      const currencyCode = COUNTRY_CURRENCY[code] || 'USD';
      const rate = liveRates
        ? liveRates[currencyCode] || FALLBACK_RATES[currencyCode] || 1
        : FALLBACK_RATES[currencyCode] || 1;
      setCurrency(makeCurrency(currencyCode, rate));
    });
  }, []);

  return { currency, countryCode };
}

export { CURRENCY_SYMBOLS, FALLBACK_RATES };