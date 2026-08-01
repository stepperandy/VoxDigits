import { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { motion } from 'framer-motion';
import {
  Search, Phone, Hash, Loader2, MapPin, MessageSquare,
  Mic, CheckCircle2, Sparkles, ChevronRight, X, Copy
} from 'lucide-react';

const KEYPAD = {
  'A': '2', 'B': '2', 'C': '2',
  'D': '3', 'E': '3', 'F': '3',
  'G': '4', 'H': '4', 'I': '4',
  'J': '5', 'K': '5', 'L': '5',
  'M': '6', 'N': '6', 'O': '6',
  'P': '7', 'Q': '7', 'R': '7', 'S': '7',
  'T': '8', 'U': '8', 'V': '8',
  'W': '9', 'X': '9', 'Y': '9', 'Z': '9',
};

function phraseToDigits(phrase) {
  return phrase.toUpperCase().split('').map(ch => KEYPAD[ch] || ch).join('');
}

const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
];

const NUMBER_TYPES = [
  { value: 'local', label: 'Local', desc: 'Numbers tied to a specific city/area' },
  { value: 'toll_free', label: 'Toll-Free', desc: '800/888/877 numbers — callers pay nothing' },
  { value: 'mobile', label: 'Mobile', desc: 'Mobile phone numbers with SMS+voice' },
];

const VANITY_SUGGESTIONS = ['FLOWERS', 'TAXI', 'PIZZA', 'DENTIST', 'LAWYER', 'PLUMBER', 'AUTO', 'LOANS'];

export default function VirtualNumbers() {
  const [country, setCountry] = useState('US');
  const [numberType, setNumberType] = useState('local');
  const [areaCode, setAreaCode] = useState('');
  const [vanity, setVanity] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedNumber, setSelectedNumber] = useState(null);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await base44.functions.invoke('searchNumbers', {
        country_code: country,
        area_code: areaCode.trim(),
        contains: vanity.trim(),
        number_type: numberType,
        page_size: 30,
      });
      if (res.data?.error) {
        setError(res.data.error);
      } else {
        setResults(res.data?.numbers || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to search numbers. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [country, numberType, areaCode, vanity]);

  const handleQuickVanity = (word) => {
    setVanity(word);
  };

  const vanityDigits = vanity ? phraseToDigits(vanity) : '';

  return (
    <div className="min-h-screen bg-[#060c1a]">
      <Navbar />

      {/* Hero */}
      <div className="pt-32 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-4">
              <Phone size={12} /> Virtual Numbers
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Find Your Perfect <span className="text-cyan-400">Business Number</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
              Search by area code to get a local presence, or enter a vanity phrase to find a memorable number that spells your brand.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Search Tool */}
      <div className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-white/10 bg-[#0d1120] p-6 md:p-8"
          >
            {/* Country + Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 block">Country</label>
                <div className="flex flex-wrap gap-2">
                  {COUNTRIES.map(c => (
                    <button
                      key={c.code}
                      onClick={() => setCountry(c.code)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        country === c.code
                          ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300'
                          : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <span>{c.flag}</span> {c.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 block">Number Type</label>
                <div className="flex flex-wrap gap-2">
                  {NUMBER_TYPES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setNumberType(t.value)}
                      title={t.desc}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        numberType === t.value
                          ? 'bg-violet-500/15 border border-violet-500/40 text-violet-300'
                          : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Area Code + Vanity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <Hash size={12} /> Area Code
                  {numberType === 'toll_free' && <span className="text-slate-600 normal-case font-normal">(not available for toll-free)</span>}
                </label>
                <input
                  type="text"
                  value={areaCode}
                  onChange={e => setAreaCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
                  placeholder="e.g. 415"
                  disabled={numberType === 'toll_free'}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 outline-none focus:border-cyan-500 disabled:opacity-40 font-mono"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <Sparkles size={12} /> Vanity Phrase
                </label>
                <input
                  type="text"
                  value={vanity}
                  onChange={e => setVanity(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 7))}
                  placeholder="e.g. FLOWERS"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 outline-none focus:border-cyan-500 font-mono uppercase"
                />
              </div>
            </div>

            {/* Vanity preview */}
            {vanity && (
              <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-violet-500/5 border border-violet-500/20">
                <Sparkles size={14} className="text-violet-400 flex-shrink-0" />
                <span className="text-slate-400 text-sm">
                  <span className="text-violet-300 font-semibold">{vanity.toUpperCase()}</span> maps to digits{' '}
                  <span className="text-white font-mono font-bold">{vanityDigits}</span>
                </span>
              </div>
            )}

            {/* Quick vanity suggestions */}
            {!vanity && (
              <div className="mb-4 flex items-center gap-2 flex-wrap">
                <span className="text-slate-500 text-xs">Try:</span>
                {VANITY_SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => handleQuickVanity(s)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30 text-xs font-medium transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Search button */}
            <button
              onClick={handleSearch}
              disabled={loading || (!areaCode && !vanity)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:hover:scale-100 bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg shadow-cyan-500/20"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              {loading ? 'Searching…' : 'Search Numbers'}
            </button>

            {!areaCode && !vanity && (
              <p className="text-center text-slate-600 text-xs mt-2">Enter an area code, a vanity phrase, or both to search.</p>
            )}
          </motion.div>

          {/* Results */}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2">
              <X size={16} className="text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </motion.div>
          )}

          {loading && (
            <div className="mt-8 flex flex-col items-center py-12">
              <Loader2 size={32} className="text-cyan-400 animate-spin mb-3" />
              <p className="text-slate-400 text-sm">Searching available numbers…</p>
            </div>
          )}

          {results && !loading && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold text-lg">
                  {results.length} {results.length === 1 ? 'Number' : 'Numbers'} Found
                </h2>
                {(areaCode || vanity) && (
                  <span className="text-slate-500 text-xs flex items-center gap-1.5">
                    {areaCode && <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">Area: {areaCode}</span>}
                    {vanity && <span className="px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-300">Vanity: {vanity}</span>}
                  </span>
                )}
              </div>

              {results.length === 0 ? (
                <div className="text-center py-12 rounded-2xl border border-white/5 bg-[#0d1120]">
                  <Search size={32} className="text-slate-700 mx-auto mb-2" />
                  <p className="text-slate-400 font-medium">No numbers found matching your criteria.</p>
                  <p className="text-slate-600 text-sm mt-1">Try a different area code, a shorter vanity phrase, or another number type.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {results.map((n, i) => (
                    <motion.div
                      key={n.phone_number}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="group rounded-xl border border-white/10 bg-[#0d1120] p-4 hover:border-cyan-500/30 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-lg font-mono">{n.friendly_name || n.phone_number}</p>
                          {n.locality && (
                            <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                              <MapPin size={11} /> {n.locality}{n.region ? `, ${n.region}` : ''}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {n.capabilities.voice && <span className="flex items-center gap-0.5 text-[10px] text-emerald-400"><Mic size={10} /> Voice</span>}
                            {n.capabilities.sms && <span className="flex items-center gap-0.5 text-[10px] text-cyan-400"><MessageSquare size={10} /> SMS</span>}
                            {n.capabilities.mms && <span className="flex items-center gap-0.5 text-[10px] text-violet-400"><MessageSquare size={10} /> MMS</span>}
                            {n.beta && <span className="text-[10px] text-amber-400">Beta</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedNumber(n)}
                          className="flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold hover:bg-cyan-500/20 transition-all whitespace-nowrap"
                        >
                          Select <ChevronRight size={12} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Info section */}
          {!results && !loading && !error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-white/5 bg-[#0d1120] p-5">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3">
                  <Hash size={18} className="text-cyan-400" />
                </div>
                <h3 className="text-white font-bold text-sm mb-1">Local Area Codes</h3>
                <p className="text-slate-500 text-xs leading-relaxed">Enter a 3-digit area code to find numbers in a specific city or region. Perfect for establishing a local business presence.</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-[#0d1120] p-5">
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-3">
                  <Sparkles size={18} className="text-violet-400" />
                </div>
                <h3 className="text-white font-bold text-sm mb-1">Vanity Numbers</h3>
                <p className="text-slate-500 text-xs leading-relaxed">Type a word like "FLOWERS" or "TAXI" to find numbers that spell your brand on the phone keypad. Up to 7 letters.</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-[#0d1120] p-5">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                  <Phone size={18} className="text-emerald-400" />
                </div>
                <h3 className="text-white font-bold text-sm mb-1">Toll-Free</h3>
                <p className="text-slate-500 text-xs leading-relaxed">Switch to toll-free to search 800, 888, 877, and 866 numbers that let customers call you for free.</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Selected number modal */}
      {selectedNumber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setSelectedNumber(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-white/12 bg-[#0d1120] p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">Selected Number</h3>
              <button onClick={() => setSelectedNumber(null)} className="p-1.5 rounded-lg hover:bg-white/10">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={26} className="text-cyan-400" />
              </div>
              <p className="text-white font-bold text-2xl font-mono mb-1">{selectedNumber.friendly_name || selectedNumber.phone_number}</p>
              {selectedNumber.locality && (
                <p className="text-slate-400 text-sm flex items-center justify-center gap-1">
                  <MapPin size={12} /> {selectedNumber.locality}{selectedNumber.region ? `, ${selectedNumber.region}` : ''}
                </p>
              )}
              <div className="flex items-center justify-center gap-3 mt-3">
                {selectedNumber.capabilities.voice && <span className="flex items-center gap-1 text-xs text-emerald-400"><Mic size={11} /> Voice</span>}
                {selectedNumber.capabilities.sms && <span className="flex items-center gap-1 text-xs text-cyan-400"><MessageSquare size={11} /> SMS</span>}
                {selectedNumber.capabilities.mms && <span className="flex items-center gap-1 text-xs text-violet-400"><MessageSquare size={11} /> MMS</span>}
              </div>
            </div>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(selectedNumber.phone_number);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm font-semibold hover:bg-white/10 transition-all mb-2"
            >
              <Copy size={14} /> Copy Number
            </button>
            <a
              href="/pricing"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-bold text-sm transition-all hover:scale-[1.02]"
            >
              <Phone size={14} /> Get This Number
            </a>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}