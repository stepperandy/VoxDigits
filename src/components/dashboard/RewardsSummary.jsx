import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Star, Trophy, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function RewardsSummary({ user }) {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.Referral.filter({ referrer_email: user.email })
      .then(setReferrals)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.email]);

  const completed = referrals.filter(r => r.status === 'completed' || r.status === 'rewarded').length;
  const rewarded = referrals.filter(r => r.status === 'rewarded').length;
  const pending = referrals.filter(r => r.status === 'pending').length;

  const stats = [
    { icon: Gift, label: 'Free Months Earned', value: rewarded, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { icon: Star, label: 'Successful Referrals', value: completed, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { icon: Zap, label: 'Pending Referrals', value: pending, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { icon: Trophy, label: 'Total Referrals', value: referrals.length, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.14 }}
      className="rounded-2xl border border-emerald-500/20 bg-[#0d1120] p-6 md:p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Trophy size={20} className="text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Your Rewards</h3>
          <p className="text-slate-500 text-sm">Referral rewards you've earned so far</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.3 }}
                className={`rounded-xl border p-4 ${stat.bg}`}
              >
                <Icon size={18} className={`${stat.color} mb-2`} />
                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                <p className="text-slate-500 text-xs mt-1 leading-tight">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      )}

      {!loading && referrals.length === 0 && (
        <div className="mt-4 p-4 rounded-xl bg-white/3 border border-white/5 text-center">
          <p className="text-slate-500 text-sm">No referrals yet. Share your link to earn free months!</p>
        </div>
      )}

      {rewarded > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20"
        >
          <span className="text-lg">🎉</span>
          <p className="text-emerald-300 text-sm font-semibold">
            You've earned <span className="text-white">{rewarded} free month{rewarded > 1 ? 's' : ''}</span> through referrals!
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}