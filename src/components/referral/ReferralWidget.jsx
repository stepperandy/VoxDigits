import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Gift, Users, CheckCircle2 } from 'lucide-react';

export default function ReferralWidget() {
  const [stats, setStats] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferralStats();
  }, []);

  const loadReferralStats = async () => {
    try {
      const res = await base44.functions.invoke('getReferralStats', {});
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load referral stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(stats.referral_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="text-slate-500 text-sm">Loading...</div>;

  return (
    <div className="space-y-4 p-4 rounded-lg border border-white/10 bg-white/3">
      <h3 className="text-white font-bold flex items-center gap-2">
        <Gift size={16} /> Referral Program
      </h3>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-lg bg-white/5">
          <p className="text-slate-500 text-xs">Total Referrals</p>
          <p className="text-white font-bold text-lg">{stats?.total_referrals}</p>
        </div>
        <div className="p-3 rounded-lg bg-white/5">
          <p className="text-slate-500 text-xs">Rewards Earned</p>
          <p className="text-white font-bold text-lg">{stats?.total_rewards_earned} months</p>
        </div>
        <div className="p-3 rounded-lg bg-white/5">
          <p className="text-slate-500 text-xs">Completed</p>
          <p className="text-green-400 font-bold text-lg">{stats?.completed}</p>
        </div>
        <div className="p-3 rounded-lg bg-white/5">
          <p className="text-slate-500 text-xs">Pending</p>
          <p className="text-amber-400 font-bold text-lg">{stats?.pending}</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-slate-400 text-sm">Your Referral Link:</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={stats?.referral_link}
            readOnly
            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-xs focus:outline-none"
          />
          <Button
            onClick={copyLink}
            size="sm"
            variant="outline"
            className="text-white"
          >
            {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
          </Button>
        </div>
      </div>

      <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold">
        <Share2 size={14} /> Share Now
      </Button>

      {stats?.recent_referrals?.length > 0 && (
        <div className="pt-3 border-t border-white/10">
          <p className="text-slate-400 text-sm mb-2">Recent Referrals:</p>
          <div className="space-y-1">
            {stats.recent_referrals.map((ref, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{ref.email}</span>
                <span className={
                  ref.status === 'rewarded' ? 'text-green-400' :
                  ref.status === 'completed' ? 'text-blue-400' :
                  'text-amber-400'
                }>
                  {ref.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}