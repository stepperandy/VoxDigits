const stats = [
  { number: '2,500+', label: 'Active Users' },
  { number: '10+', label: 'Server Locations' },
  { number: '99.8%', label: 'Uptime' },
  { number: '0 Logs', label: 'Privacy Logs' },
];

export default function Stats() {
  return (
    <div className="bg-[#0a0e18] border-y border-white/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-white mb-1">{stat.number}</div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}