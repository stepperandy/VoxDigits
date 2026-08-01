import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Globe, Bot, Check, ChevronDown } from "lucide-react";

/**
 * Model options for the in-app assistant.
 * - "auto" keeps the existing agent flow (with entity tools).
 * - Named models route through InvokeLLM with that model slug.
 * DeepSeek and Grok are not supported by the platform's InvokeLLM, so they
 * are intentionally omitted.
 */
export const MODELS = [
  { id: "auto", label: "Auto mode", desc: "Matched with the best AI model for each request", Icon: Sparkles },
  { id: "gemini_3_flash", label: "Gemini 3 Flash", Icon: Globe },
  { id: "gemini_3_1_pro", label: "Gemini 3.1 Pro", desc: "Uses more credits for each request", Icon: Globe },
  { id: "gpt_5_mini", label: "GPT-5 Mini", Icon: Bot },
  { id: "gpt_5_4", label: "GPT-5.4", Icon: Bot },
  { id: "gpt_5_6_sol", label: "GPT-5.6 Sol", Icon: Bot },
];

export default function ModelSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = MODELS.find((m) => m.id === value) || MODELS[0];
  const CurrentIcon = current.Icon;

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] text-gray-300 hover:text-white hover:bg-white/5 transition-colors max-w-[140px]"
      >
        <CurrentIcon className="w-3 h-3 text-cyan-400 flex-shrink-0" />
        <span className="font-medium truncate">{current.label}</span>
        <ChevronDown className="w-3 h-3 flex-shrink-0" />
      </button>
      {open && (
        <div className="absolute bottom-full mb-2 left-0 w-[240px] bg-[#0d1f35] border border-white/10 rounded-xl shadow-2xl shadow-black/60 overflow-hidden z-50">
          <div className="px-3 py-2 text-[10px] text-gray-500 uppercase tracking-wide border-b border-white/8">
            Select model
          </div>
          {MODELS.map((m) => {
            const Icon = m.Icon;
            const active = m.id === value;
            return (
              <button
                key={m.id}
                onClick={() => { onChange(m.id); setOpen(false); }}
                className={`w-full flex items-start gap-2.5 px-3 py-2.5 text-left transition-colors ${
                  active ? "bg-cyan-500/15" : "hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${active ? "text-cyan-400" : "text-gray-400"}`} />
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-semibold ${active ? "text-cyan-300" : "text-gray-200"}`}>
                    {m.label}
                  </div>
                  {m.desc && (
                    <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">{m.desc}</div>
                  )}
                </div>
                {active && <Check className="w-3.5 h-3.5 text-cyan-400 mt-1 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}