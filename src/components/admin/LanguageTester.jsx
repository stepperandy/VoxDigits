import { useState, useEffect } from 'react';
import { Globe, Search, Play, CheckCircle2, XCircle, Languages, Loader2, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { translations } from '@/lib/LanguageContext';

const TEST_IPS = [
  { label: '🇩🇪 Germany (Berlin)', ip: '81.169.144.135', expected: 'de' },
  { label: '🇯🇵 Japan (Tokyo)', ip: '49.212.128.1', expected: 'ja' },
  { label: '🇫🇷 France (Paris)', ip: '51.158.0.1', expected: 'fr' },
  { label: '🇪🇸 Spain (Madrid)', ip: '80.58.0.1', expected: 'es' },
  { label: '🇺🇸 USA (Google DNS)', ip: '8.8.8.8', expected: 'en' },
  { label: '🇨🇳 China (114DNS)', ip: '114.114.114.114', expected: 'zh' },
  { label: '🇷🇺 Russia (Yandex)', ip: '77.88.8.8', expected: 'ru' },
  { label: '🇸🇦 Saudi Arabia', ip: '86.60.0.1', expected: 'ar' },
];

const LANG_COLORS = {
  en: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  es: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  fr: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  de: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  zh: 'bg-red-500/15 text-red-300 border-red-500/30',
  ja: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  ru: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  ar: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
};

const LANG_LABELS = {
  en: 'English', es: 'Español', fr: 'Français', de: 'Deutsch',
  zh: '中文', ja: '日本語', ru: 'Русский', ar: 'العربية',
};

function LangBadge({ code }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${LANG_COLORS[code] || LANG_COLORS.en}`}>
      {code.toUpperCase()} · {LANG_LABELS[code] || code}
    </span>
  );
}

export default function LanguageTester() {
  const [mapLoading, setMapLoading] = useState(true);
  const [countryMap, setCountryMap] = useState({});
  const [search, setSearch] = useState('');

  // IP detection test
  const [testIp, setTestIp] = useState('');
  const [ipResult, setIpResult] = useState(null);
  const [ipLoading, setIpLoading] = useState(false);
  const [ipError, setIpError] = useState('');

  // Translation preview
  const [previewLang, setPreviewLang] = useState('de');

  useEffect(() => {
    base44.functions.invoke('testLanguageDetection', {})
      .then((res) => {
        const data = res?.data || res;
        if (data?.country_lang_map) setCountryMap(data.country_lang_map);
      })
      .catch(() => {})
      .finally(() => setMapLoading(false));
  }, []);

  const runIpTest = async (ip) => {
    const target = (ip || testIp).trim();
    if (!target) return;
    setIpLoading(true);
    setIpError('');
    setIpResult(null);
    try {
      const res = await base44.functions.invoke('testLanguageDetection', { ip: target });
      const data = res?.data || res;
      if (data?.error) setIpError(data.error);
      else setIpResult(data);
    } catch (err) {
      setIpError(err?.response?.data?.error || err?.message || 'Failed to test IP');
    } finally {
      setIpLoading(false);
    }
  };

  const countries = Object.entries(countryMap).sort((a, b) => a[0].localeCompare(b[0]));
  const filtered = countries.filter(([cc, lang]) =>
    cc.toLowerCase().includes(search.toLowerCase()) ||
    lang.toLowerCase().includes(search.toLowerCase())
  );

  // Count translations per language
  const enKeys = Object.keys(translations.en || {});
  const previewEntries = Object.entries(translations[previewLang] || {});
  const missingKeys = enKeys.filter((k) => !translations[previewLang]?.[k]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Languages className="text-cyan-400" size={24} /> Language Detection Tester
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Verify country-to-language mapping, test IP-based detection, and preview translations across all 8 supported languages.
        </p>
      </div>

      {/* ── Card 1: IP Detection Test ── */}
      <div className="bg-[#0d1120] border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
          <Globe size={18} className="text-cyan-400" /> IP Detection Test
        </h3>
        <p className="text-slate-500 text-xs mb-4">
          Enter an IP address or use a preset to run the full geo-IP → language pipeline (same logic used for real visitors).
        </p>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="e.g. 81.169.144.135"
            value={testIp}
            onChange={(e) => setTestIp(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runIpTest()}
            className="flex-1 px-4 py-2.5 bg-[#060910] border border-white/10 rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
          />
          <button
            onClick={() => runIpTest()}
            disabled={ipLoading || !testIp.trim()}
            className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-sm rounded-lg transition-colors flex items-center gap-2"
          >
            {ipLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            Test
          </button>
        </div>

        {/* Preset IPs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {TEST_IPS.map((preset) => (
            <button
              key={preset.ip}
              onClick={() => { setTestIp(preset.ip); runIpTest(preset.ip); }}
              disabled={ipLoading}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 text-slate-300 hover:text-white text-xs font-medium rounded-lg transition-all disabled:opacity-40"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {ipError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-300 text-sm">
            {ipError}
          </div>
        )}

        {/* Result */}
        {ipResult && (
          <div className="p-4 bg-[#060910] border border-white/10 rounded-xl">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">IP Address</p>
                <p className="text-white text-sm font-mono">{ipResult.ip}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Country</p>
                <p className="text-white text-sm font-bold">{ipResult.country_code || '—'}</p>
                <p className="text-slate-500 text-xs">{ipResult.country}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Detected Language</p>
                <div className="mt-0.5"><LangBadge code={ipResult.language} /></div>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Expected</p>
                {(() => {
                  const preset = TEST_IPS.find((p) => p.ip === ipResult.ip);
                  if (!preset) return <p className="text-slate-500 text-xs">N/A</p>;
                  const match = preset.expected === ipResult.language;
                  return (
                    <div className="flex items-center gap-1.5">
                      {match
                        ? <CheckCircle2 size={16} className="text-emerald-400" />
                        : <XCircle size={16} className="text-rose-400" />}
                      <span className={`text-sm font-bold ${match ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {preset.expected.toUpperCase()}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Card 2: Country → Language Mapping ── */}
      <div className="bg-[#0d1120] border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
          <Search size={18} className="text-cyan-400" /> Country → Language Mapping
        </h3>
        <p className="text-slate-500 text-xs mb-4">
          Full reference of every country code and its assigned interface language. {countries.length} countries mapped.
        </p>

        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            type="text"
            placeholder="Search country code or language…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#060910] border border-white/10 rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {mapLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-slate-600" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-80 overflow-y-auto pr-1">
            {filtered.map(([cc, lang]) => (
              <div key={cc} className="flex items-center justify-between px-3 py-2 bg-[#060910] border border-white/5 rounded-lg">
                <span className="text-white text-sm font-mono font-bold">{cc}</span>
                <ArrowRight size={12} className="text-slate-600" />
                <LangBadge code={lang} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Card 3: Translation Preview ── */}
      <div className="bg-[#0d1120] border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
          <Languages size={18} className="text-cyan-400" /> Translation Preview
        </h3>
        <p className="text-slate-500 text-xs mb-4">
          Preview every translated string. Missing keys are flagged so you can spot incomplete translations.
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {Object.keys(LANG_LABELS).map((code) => {
            const count = Object.keys(translations[code] || {}).length;
            const missing = enKeys.length - count;
            const active = previewLang === code;
            return (
              <button
                key={code}
                onClick={() => setPreviewLang(code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  active
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                {code.toUpperCase()} <span className="opacity-50">({count})</span>
                {missing > 0 && <span className="ml-1 text-rose-400">·{missing} missing</span>}
              </button>
            );
          })}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 px-3 text-slate-500 font-semibold text-xs uppercase tracking-wider">Key</th>
                <th className="text-left py-2 px-3 text-slate-500 font-semibold text-xs uppercase tracking-wider">English (source)</th>
                <th className="text-left py-2 px-3 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  {LANG_LABELS[previewLang]} ({previewLang.toUpperCase()})
                </th>
              </tr>
            </thead>
            <tbody>
              {enKeys.map((key) => {
                const isMissing = !translations[previewLang]?.[key];
                return (
                  <tr key={key} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-2 px-3 text-slate-500 font-mono text-xs whitespace-nowrap">{key}</td>
                    <td className="py-2 px-3 text-slate-300 text-xs">{translations.en[key]}</td>
                    <td className="py-2 px-3 text-xs">
                      {isMissing ? (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                          <XCircle size={12} /> MISSING
                        </span>
                      ) : (
                        <span className="text-white" dir={previewLang === 'ar' ? 'rtl' : 'ltr'}>
                          {translations[previewLang][key]}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}