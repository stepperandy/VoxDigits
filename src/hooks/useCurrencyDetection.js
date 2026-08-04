import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const CURRENCY_SYMBOLS = {
  'CNY': '¥', 'USD': '$', 'GBP': '£', 'JPY': '¥', 'INR': '₹',
  'BRL': 'R$', 'AUD': 'A$', 'EUR': '€', 'GHS': '₵', 'CAD': 'C$',
  'ZAR': 'R', 'NGN': '₦', 'KES': 'KSh', 'SGD': 'S$', 'HKD': 'HK$',
  'MXN': 'Mex$', 'AED': 'د.إ', 'RUB': '₽', 'KRW': '₩', 'THB': '฿',
  'IDR': 'Rp', 'MYR': 'RM', 'PHP': '₱', 'PKR': '₨', 'EGP': 'E£',
  'TRY': '₺', 'SAR': '﷼', 'QAR': '﷼', 'NZD': 'NZ$',
  'VND': '₫', 'ARS': '$', 'COP': '$', 'CLP': '$', 'PEN': 'S/',
  'UAH': '₴', 'RON': 'lei', 'CZK': 'Kč', 'HUF': 'Ft', 'ILS': '₪',
  'BDT': '৳', 'LKR': 'Rs', 'VES': 'Bs', 'DZD': 'دج', 'MAD': 'د.م.',
  'TND': 'د.ت', 'IQD': 'ع.د', 'JOD': 'د.ا', 'LBP': 'ل.ل', 'BHD': '.د.ب',
  'OMR': 'ر.ع.', 'KWD': 'د.ك', 'YER': '﷼', 'SYR': '£S',
  'SEK': 'kr', 'NOK': 'kr', 'DKK': 'kr', 'PLN': 'zł', 'CHF': 'Fr',
  'BGN': 'лв', 'HRK': 'kn', 'RSD': 'дин', 'ISK': 'kr',
  'GTQ': 'Q', 'CRC': '₡', 'UYU': '$U', 'PYG': '₲', 'BOB': 'Bs',
  'DOP': 'RD$', 'HNL': 'L', 'PAB': 'B/.', 'NAD': 'N$', 'AOA': 'Kz',
  'ETB': 'Br', 'TZS': 'TSh', 'UGX': 'USh', 'RWF': 'FRw',
  'GEL': '₾', 'AMD': '֏', 'AZN': '₼', 'KZT': '₸', 'UZS': 'soʻm',
  'XAF': 'FCFA', 'XOF': 'CFA',
};

const COUNTRY_CURRENCY = {
  'CN': 'CNY', 'US': 'USD', 'GB': 'GBP', 'JP': 'JPY', 'IN': 'INR',
  'BR': 'BRL', 'AU': 'AUD', 'CA': 'CAD',
  'FR': 'EUR', 'DE': 'EUR', 'IT': 'EUR', 'ES': 'EUR', 'NL': 'EUR',
  'BE': 'EUR', 'AT': 'EUR', 'IE': 'EUR', 'PT': 'EUR', 'GR': 'EUR',
  'FI': 'EUR', 'LU': 'EUR', 'MT': 'EUR', 'CY': 'EUR', 'SK': 'EUR',
  'SI': 'EUR', 'EE': 'EUR', 'LV': 'EUR', 'LT': 'EUR',
  'GH': 'GHS', 'NG': 'NGN', 'KE': 'KES', 'ZA': 'ZAR', 'EG': 'EGP',
  'SG': 'SGD', 'HK': 'HKD', 'MX': 'MXN', 'AE': 'AED', 'RU': 'RUB',
  'KR': 'KRW', 'TH': 'THB', 'ID': 'IDR', 'MY': 'MYR', 'PH': 'PHP',
  'PK': 'PKR', 'TR': 'TRY', 'SA': 'SAR', 'QA': 'QAR', 'NZ': 'NZD',
  'VN': 'VND', 'AR': 'ARS', 'CO': 'COP', 'CL': 'CLP', 'PE': 'PEN',
  'UA': 'UAH', 'RO': 'RON', 'CZ': 'CZK', 'HU': 'HUF', 'IL': 'ILS',
  'BD': 'BDT', 'LK': 'LKR', 'VE': 'VES', 'DZ': 'DZD', 'MA': 'MAD',
  'TN': 'TND', 'IQ': 'IQD', 'JO': 'JOD', 'LB': 'LBP', 'BH': 'BHD',
  'OM': 'OMR', 'KW': 'KWD', 'YE': 'YER', 'SY': 'SYR',
  'SE': 'SEK', 'NO': 'NOK', 'DK': 'DKK', 'PL': 'PLN', 'CH': 'CHF',
  'BG': 'BGN', 'HR': 'HRK', 'RS': 'RSD', 'IS': 'ISK',
  'GT': 'GTQ', 'CR': 'CRC', 'UY': 'UYU', 'PY': 'PYG', 'BO': 'BOB',
  'DO': 'DOP', 'HN': 'HNL', 'PA': 'PAB', 'EC': 'USD',
  'NA': 'NAD', 'AO': 'AOA', 'ET': 'ETB', 'TZ': 'TZS', 'UG': 'UGX',
  'RW': 'RWF', 'GE': 'GEL', 'AM': 'AMD', 'AZ': 'AZN', 'KZ': 'KZT',
  'UZ': 'UZS', 'CM': 'XAF', 'SN': 'XOF', 'CI': 'XOF', 'ML': 'XOF',
  'BF': 'XOF', 'NE': 'XOF', 'TG': 'XOF', 'BJ': 'XOF',
};

const FALLBACK_RATES = {
  'CNY': 7.3, 'USD': 1, 'GBP': 0.79, 'JPY': 155, 'INR': 83,
  'BRL': 4.97, 'AUD': 1.50, 'EUR': 0.92, 'GHS': 12.5, 'CAD': 1.36,
  'ZAR': 18.5, 'NGN': 1500, 'KES': 129, 'SGD': 1.35, 'HKD': 7.8,
  'MXN': 18.5, 'AED': 3.67, 'RUB': 90, 'KRW': 1380, 'THB': 36,
  'IDR': 16300, 'MYR': 4.7, 'PHP': 58, 'PKR': 278, 'EGP': 48,
  'TRY': 32, 'SAR': 3.75, 'QAR': 3.64, 'NZD': 1.65,
  'VND': 25000, 'ARS': 900, 'COP': 4000, 'CLP': 950, 'PEN': 3.75,
  'UAH': 42, 'RON': 4.6, 'CZK': 23, 'HUF': 360, 'ILS': 3.7,
  'BDT': 117, 'LKR': 300, 'VES': 36, 'DZD': 134, 'MAD': 10,
  'TND': 3.1, 'IQD': 1310, 'JOD': 0.71, 'LBP': 89500, 'BHD': 0.376,
  'OMR': 0.385, 'KWD': 0.307, 'YER': 250, 'SYR': 13000,
  'SEK': 10.5, 'NOK': 10.7, 'DKK': 6.8, 'PLN': 4.0, 'CHF': 0.90,
  'BGN': 1.8, 'HRK': 6.9, 'RSD': 108, 'ISK': 140,
  'GTQ': 7.8, 'CRC': 520, 'UYU': 39, 'PYG': 7300, 'BOB': 6.9,
  'DOP': 59, 'HNL': 24.5, 'PAB': 1, 'EC': 1,
  'NAD': 18.5, 'AOA': 830, 'ETB': 128, 'TZS': 2600, 'UGX': 3800,
  'RWF': 1300, 'GEL': 2.7, 'AMD': 390, 'AZN': 1.70, 'KZT': 470,
  'UZS': 12700, 'XAF': 600, 'XOF': 600,
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

// Returns the set of payment methods available for a given country code
export function getPaymentMethods(countryCode) {
  // Stripe (cards, Apple Pay, Google Pay), Hubtel (Mobile Money), WeChat Pay & Alipay (China) are always available
  const methods = ['stripe', 'hubtel', 'wechat_pay', 'alipay'];

  return methods;
}

export function useCurrencyDetection() {
  const [currency, setCurrency] = useState({ code: 'USD', rate: 1, symbol: '$' });
  const [countryCode, setCountryCode] = useState('US');
  const [paymentMethods, setPaymentMethods] = useState(['stripe']);

  const detect = async () => {
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

    // Use the backend multi-provider geo-IP detection (3 fallback providers)
    // for reliability — avoids CORS/rate-limit issues of browser-side calls
    const detectCountry = async () => {
      try {
        const res = await base44.functions.invoke('detectLanguageByIp', {});
        const data = res?.data || res;
        return data?.country_code || '';
      } catch { return ''; }
    };

    const [code, liveRates] = await Promise.all([
      detectCountry(),
      fetchLiveRates(),
    ]);

    let countryCode = code;
    // Fallback: if geo API failed (common in China), detect via timezone/locale
    if (!countryCode && detectChinaFromLocale()) {
      countryCode = 'CN';
    }
    countryCode = countryCode || 'US';
    setCountryCode(countryCode);
    const currencyCode = COUNTRY_CURRENCY[countryCode] || 'USD';
    const rate = liveRates
      ? liveRates[currencyCode] || FALLBACK_RATES[currencyCode] || 1
      : FALLBACK_RATES[currencyCode] || 1;
    setCurrency(makeCurrency(currencyCode, rate));
    setPaymentMethods(getPaymentMethods(countryCode));
  };

  useEffect(() => { detect(); }, []);

  return { currency, countryCode, paymentMethods, refresh: detect };
}

export { CURRENCY_SYMBOLS, FALLBACK_RATES, COUNTRY_CURRENCY };