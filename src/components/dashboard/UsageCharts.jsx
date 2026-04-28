import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// Generate simulated usage data for the past 7 days
// Seeded so it doesn't change on every render
function generateUsageData() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const seed = [4.2, 7.8, 3.1, 9.4, 5.6, 6.3, 8.1];
  const hourSeed = [2.5, 4.1, 1.8, 5.5, 3.2, 4.8, 5.0];
  return days.map((day, i) => ({
    day,
    bandwidth: seed[i],
    hours: hourSeed[i],
  }));
}

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0d1120] border border-white/10 rounded-lg px-3 py-2 text-xs">
        <p className="text-slate-400 mb-1">{label}</p>
        <p className="text-cyan-400 font-bold">{payload[0].value} {unit}</p>
      </div>
    );
  }
  return null;
};

const PLAN_DAILY_LIMITS = {
  Basic: 5,
  Standard: 12,
  Premium: 25,
  Advanced: 50,
  Enterprise: 200,
};

export default function UsageCharts({ subscription }) {
  const data = generateUsageData();
  const totalBandwidth = data.reduce((sum, d) => sum + d.bandwidth, 0).toFixed(1);
  const totalHours = data.reduce((sum, d) => sum + d.hours, 0).toFixed(1);
  const dailyLimit = PLAN_DAILY_LIMITS[subscription?.plan] || 10;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0a1020] rounded-xl p-4 border border-cyan-500/10">
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Bandwidth This Week</p>
          <p className="text-white font-black text-2xl">{totalBandwidth} <span className="text-slate-400 text-sm font-normal">GB</span></p>
          <p className="text-cyan-400 text-xs mt-1">↑ Active usage</p>
        </div>
        <div className="bg-[#0a1020] rounded-xl p-4 border border-violet-500/10">
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Connection Time</p>
          <p className="text-white font-black text-2xl">{totalHours} <span className="text-slate-400 text-sm font-normal">hrs</span></p>
          <p className="text-violet-400 text-xs mt-1">↑ This week</p>
        </div>
      </div>

      {/* Bandwidth Chart */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-slate-400 text-sm font-semibold">Daily Bandwidth Usage (GB)</p>
          <span className="text-xs text-slate-600 border border-white/10 rounded-full px-2 py-0.5">
            Limit: {dailyLimit} GB/day
          </span>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="bwGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip unit="GB" />} />
              <ReferenceLine y={dailyLimit} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Limit', position: 'right', fill: '#f59e0b', fontSize: 10 }} />
              <Area type="monotone" dataKey="bandwidth" stroke="#22d3ee" strokeWidth={2} fill="url(#bwGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Connection Time Chart */}
      <div>
        <p className="text-slate-400 text-sm font-semibold mb-3">Daily Active Connection (Hours)</p>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip unit="hrs" />} />
              <Bar dataKey="hours" fill="#a78bfa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}