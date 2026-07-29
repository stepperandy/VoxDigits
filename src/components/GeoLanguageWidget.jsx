import React, { useState, useEffect, useRef } from "react";
import { Globe, X, Check } from "lucide-react";
import { useLanguage, LANGUAGES } from "@/lib/LanguageContext";

/**
 * Floating language switcher — sits below the AI assistant in the
 * lower-right corner. The detected language (from IP geolocation,
 * handled in LanguageContext) is applied automatically; users can
 * override it from the list.
 */
export default function GeoLanguageWidget() {
  const { language, changeLanguage, detected } = useLanguage();
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
              <Globe className="w-4 h-4 text-cyan-400" />
              <span className="text-white font-semibold text-sm">Language</span>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-white/5 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

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
          <div className="max-h-[260px] overflow-y-auto py-1">
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
        title={current.label}
      >
        {open ? <X className="w-5 h-5 text-cyan-400" /> : (
          <span className="text-lg leading-none">{current.flag}</span>
        )}
      </button>
    </div>
  );
}