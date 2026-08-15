import { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

/**
 * TrialCounter — shows remaining days for a 3-day free trial.
 * Props: renewalDate (ISO string), totalDays (default 3)
 */
export default function TrialCounter({ renewalDate, totalDays = 3 }) {
  const [daysLeft, setDaysLeft] = useState(null);

  useEffect(() => {
    if (!renewalDate) return;
    const compute = () => {
      const diff = new Date(renewalDate).getTime() - Date.now();
      setDaysLeft(Math.max(0, Math.ceil(diff / 86400000)));
    };
    compute();
    const id = setInterval(compute, 60000);
    return () => clearInterval(id);
  }, [renewalDate]);

  if (daysLeft === null) return null;

  const pct = Math.min(100, (daysLeft / totalDays) * 100);
  const urgent = daysLeft <= 1;
  const expired = daysLeft <= 0;

  if (expired) {
    return (
      <div className="mt-3 p-3 rounded-xl flex items-start gap-2"
        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
        <AlertTriangle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
        <p className="text-red-300 text-[11px] font-semibold leading-snug">
          Your free trial has ended. Choose a plan to keep your VPN access.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Clock size={12} className={urgent ? 'text-amber-400' : 'text-cyan-400'} />
          <span className={`text-[11px] font-bold ${urgent ? 'text-amber-400' : 'text-cyan-400'}`}>
            {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
          </span>
        </div>
        <span className="text-slate-600 text-[10px] uppercase tracking-wider">Free Trial</span>
      </div>
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: urgent ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #00d4ff, #00c47a)',
            boxShadow: urgent ? '0 0 8px rgba(245,158,11,0.5)' : '0 0 8px rgba(0,212,255,0.5)',
          }}
        />
      </div>
      {urgent && (
        <p className="text-amber-400/80 text-[10px] mt-1.5 leading-snug">
          Trial ending soon — upgrade to avoid losing access.
        </p>
      )}
    </div>
  );
}