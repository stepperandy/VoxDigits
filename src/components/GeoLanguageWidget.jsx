import React, { useState, useEffect, useRef } from "react";
import { Globe, X, Check, MapPin, RotateCcw } from "lucide-react";
import { useLanguage, LANGUAGES, countryFlag, languageForCountry } from "@/lib/LanguageContext";

/**
 * Floating geo-language switcher — sits below the AI assistant in the
 * lower-right corner. Detects the visitor's country via IP geolocation
 * (handled in LanguageContext) and lets them override the language.
 */
export default function GeoLanguageWidget() {
  const { language, country, changeLanguage, resetToAuto, detected } = useLanguage();
  const isManual = !!localStorage.getItem('voxvpn_language_manual');
  const isAuto = country ? languageForCountry(country) === language : !isManual;
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!detected) {
    return (
      <div className="fixed z-50 bottom-[68px] md:bottom-3 right-4 md:right-[76px]">
        <div className="w-11 h-11 rounded-full bg-[#0d1f35] border border-white/15 flex items-center justify-center animate-pulse">
          <Globe className="w-5 h-5 text-cyan-400" />
        </div>
      </div>
    );
  }

  const current = LANGUAGES[language] || LANGUAGES.en;
  const langEntries = Object.entries(LANGUAGES);
  const filtered = search
    ? langEntries.filter(([code, meta]) =>
        meta.label.toLowerCase().includes(search.toLowerCase()) ||
        code.includes(search.toLowerCase()))
    : langEntries;

  return (
    <div ref={ref} className="fixed z-50 bottom-[68px] md:bottom-3 right-4 md:right-[76px] flex flex-col items-end">
      {/* Popup */}
      {open && (
        <div className="mb-2 w-[260px] bg-[#0d1f35] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-b border-white/8">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span className="text-white font-semibold text-sm">Language</span>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-white/5 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Detected country banner — shows the REAL country flag from the IP */}
          {country && (
            <div className="px-4 py-2 bg-white/5 border-b border-white/8 flex items-center gap-2">
              <span className="text-lg">{countryFlag(country)}</span>
              <p className="text-xs text-gray-400 flex-1">
                Detected: <span className="text-cyan-400 font-semibold">{country}</span> · <span className="text-white">{current.label}</span>
              </p>
              {!isAuto && (
                <button
                  onClick={resetToAuto}
                  className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded-md hover:bg-white/5"
                  title="Reset to detected language"
                >
                  <RotateCcw className="w-3 h-3" /> Auto
                </button>
              )}
            </div>
          )}

          {/* Search */}
          <div className="px-3 py-2 border-b border-white/8">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search language…"
              className="w-full bg-[#18233f] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-gray-600"
            />
          </div>

          {/* List */}
          <div className="max-h-[220px] overflow-y-auto py-1">
            {filtered.map(([code, meta]) => (
              <button
                key={code}
                onClick={() => { changeLanguage(code); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  code === language ? "bg-cyan-500/15 text-cyan-300" : "text-gray-300 hover:bg-white/5"
                }`}
              >
                <span className="text-lg flex-shrink-0">{meta.flag}</span>
                <span className="flex-1 text-sm">{meta.label}</span>
                <span className="text-[10px] text-gray-600 uppercase">{code}</span>
                {code === language && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        className="w-11 h-11 bg-[#0d1f35] hover:bg-[#15294a] border border-cyan-500/30 text-white rounded-full shadow-lg shadow-black/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        aria-label="Change language"
        title={`${current.label} (${country || 'auto'})`}
      >
        {open ? <X className="w-5 h-5 text-cyan-400" /> : (
          <span className="text-lg leading-none">{country ? countryFlag(country) : current.flag}</span>
        )}
      </button>
    </div>
  );
}