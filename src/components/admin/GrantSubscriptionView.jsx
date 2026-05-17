import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Gift, Loader2, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PLANS = ['Basic', 'Standard', 'Premium', 'Advanced', 'Enterprise'];

export default function GrantSubscriptionView() {
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState('Standard');
  const [months, setMonths] = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'success' | 'error', text: string }

  const handleGrant = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setMsg(null);
    try {
      await base44.functions.invoke('grantSubscription', {
        target_email: email.trim(),
        plan,
        billing_cycle: 'monthly',
        months,
      });
      setMsg({ type: 'success', text: `✓ ${plan} plan granted to ${email} for ${months} month${months > 1 ? 's' : ''}.` });
      setEmail('');
    } catch (err) {
      setMsg({ type: 'error', text: 'Error: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Gift size={22} className="text-emerald-400" /> Grant Subscription
        </h2>
        <p className="text-slate-400 text-sm mt-1">Manually activate a VPN subscription for any user by email.</p>
      </div>

      <div className="rounded-2xl border border-white/8 bg-[#0d1120] p-6">
        <form onSubmit={handleGrant} className="space-y-5">

          {/* Email */}
          <div>
            <label className="text-slate-400 text-xs uppercase tracking-wider block mb-1.5">User Email</label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#060910] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Plan */}
          <div>
            <label className="text-slate-400 text-xs uppercase tracking-wider block mb-1.5">Plan</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {PLANS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlan(p)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                    plan === p
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                      : 'bg-[#060910] border-white/10 text-slate-500 hover:text-white hover:border-white/20'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-slate-400 text-xs uppercase tracking-wider block mb-1.5">
              Duration — <span className="text-white font-bold">{months} month{months > 1 ? 's' : ''}</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={24}
                value={months}
                onChange={e => setMonths(Number(e.target.value))}
                className="flex-1 accent-emerald-400"
              />
              <input
                type="number"
                min={1}
                max={24}
                value={months}
                onChange={e => setMonths(Math.min(24, Math.max(1, Number(e.target.value))))}
                className="w-16 px-2 py-2 rounded-lg bg-[#060910] border border-white/10 text-white text-sm text-center focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-300">
            Grant <strong>{plan}</strong> plan to <strong>{email || '—'}</strong> for <strong>{months} month{months > 1 ? 's' : ''}</strong>
          </div>

          {/* Result message */}
          <AnimatePresence>
            {msg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
                  msg.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                }`}
              >
                {msg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {msg.text}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-black text-sm transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Gift size={16} />}
            Grant Subscription
          </button>
        </form>
      </div>
    </div>
  );
}