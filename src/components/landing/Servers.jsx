import { motion } from 'framer-motion';
import { Signal, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const regionNames = {
  lhr: { name: 'London', country: 'United Kingdom', flag: '🇬🇧' },
  lax: { name: 'Los Angeles', country: 'United States', flag: '🇺🇸' },
  ewr: { name: 'New York', country: 'United States', flag: '🇺🇸' },
  ord: { name: 'Chicago', country: 'United States', flag: '🇺🇸' },
  dfw: { name: 'Dallas', country: 'United States', flag: '🇺🇸' },
  sea: { name: 'Seattle', country: 'United States', flag: '🇺🇸' },
  atl: { name: 'Atlanta', country: 'United States', flag: '🇺🇸' },
  mia: { name: 'Miami', country: 'United States', flag: '🇺🇸' },
  sgp: { name: 'Singapore', country: 'Singapore', flag: '🇸🇬' },
  ams: { name: 'Amsterdam', country: 'Netherlands', flag: '🇳🇱' },
  fra: { name: 'Frankfurt', country: 'Germany', flag: '🇩🇪' },
  par: { name: 'Paris', country: 'France', flag: '🇫🇷' },
  nrt: { name: 'Tokyo', country: 'Japan', flag: '🇯🇵' },
  syd: { name: 'Sydney', country: 'Australia', flag: '🇦🇺' },
  yto: { name: 'Toronto', country: 'Canada', flag: '🇨🇦' },
  bom: { name: 'Mumbai', country: 'India', flag: '🇮🇳' },
  jnb: { name: 'Johannesburg', country: 'South Africa', flag: '🇿🇦' },
  mad: { name: 'Madrid', country: 'Spain', flag: '🇪🇸' },
  waw: { name: 'Warsaw', country: 'Poland', flag: '🇵🇱' },
  sto: { name: 'Stockholm', country: 'Sweden', flag: '🇸🇪' },
};

export default function Servers() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    base44.functions.invoke('getVultrServers', {})
      .then((res) => setServers(res.data.servers || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const isOnline = (server) => server.status === 'active' && server.power === 'running';

  return (
    <section id="servers" className="bg-[#080c18] py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          className="text-center mb-14"
        >
          <p className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">Our Network</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Global Server Network</h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Real-time status from our live Vultr infrastructure. Low latency, high reliability.
          </p>
        </motion.div>

        {loading && (
          <div className="flex items-center justify-center py-16 text-slate-400 gap-3">
            <Loader2 size={20} className="animate-spin text-cyan-400" />
            <span className="text-sm">Fetching live server status...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-10 text-rose-400 text-sm">{error}</div>
        )}

        {!loading && !error && (
          <>
            {/* Table header */}
            <div className="hidden md:grid grid-cols-5 gap-4 px-4 mb-3 text-xs text-slate-600 uppercase tracking-wider">
              <span>Location</span>
              <span>Country</span>
              <span>Status</span>
              <span>IP Address</span>
              <span>Resources</span>
            </div>

            <div className="space-y-2">
              {servers.map((server, idx) => {
                const region = regionNames[server.location] || {
                  name: server.location.toUpperCase(),
                  country: server.location,
                  flag: '🌐',
                };
                const online = isOnline(server);

                return (
                  <motion.div
                    key={server.id}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.07 }}
                    viewport={{ once: true, amount: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center px-4 py-4 rounded-xl border border-white/5 bg-[#0d1120] hover:border-cyan-500/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{region.flag}</span>
                      <span className="text-white font-medium text-sm">{region.name}</span>
                    </div>
                    <span className="text-slate-400 text-sm hidden md:block">{region.country}</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${online ? 'bg-cyan-400' : 'bg-rose-500'}`} />
                      <span className={`text-xs font-medium ${online ? 'text-cyan-400' : 'text-rose-400'}`}>
                        {online ? 'Online' : server.power === 'stopped' ? 'Stopped' : 'Offline'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Signal size={13} className="text-slate-500" />
                      <span className="text-slate-300 text-sm font-mono">{server.ip}</span>
                    </div>
                    <div className="text-slate-500 text-xs">
                      {server.vcpu} vCPU · {server.ram >= 1024 ? `${server.ram / 1024}GB` : `${server.ram}MB`} RAM
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}