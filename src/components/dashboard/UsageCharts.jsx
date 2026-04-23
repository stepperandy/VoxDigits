import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Generate simulated usage data for the past 7 days
function generateUsageData() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day) => ({
    day,
    bandwidth: parseFloat((Math.random() * 8 + 1).toFixed(2)),
    hours: parseFloat((Math.random() * 6 + 0.5).toFixed(1)),
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

export default function UsageCharts({ subscription }) {
  const data = generateUsageData();
  const totalBandwidth = data.reduce((sum, d) => sum + d.bandwidth, 0).toFixed(1);
  const totalHours = data.reduce((sum, d) => sum + d.hours, 0).toFixed(1);

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
        <p className="text-slate-400 text-sm font-semibold mb-3">Daily Bandwidth Usage (GB)</p>
        <div className="h-36">
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