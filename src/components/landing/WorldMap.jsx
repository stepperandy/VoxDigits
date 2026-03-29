import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Shield, Wifi } from 'lucide-react';

// Approximate [x%, y%] positions on a 1000x500 equirectangular map
const SERVER_LOCATIONS = {
  lhr: { name: 'London', country: 'United Kingdom', flag: '🇬🇧', x: 48.2, y: 22.5 },
  ewr: { name: 'New York', country: 'United States', flag: '🇺🇸', x: 24.5, y: 27.0 },
  lax: { name: 'Los Angeles', country: 'United States', flag: '🇺🇸', x: 15.5, y: 30.5 },
  ord: { name: 'Chicago', country: 'United States', flag: '🇺🇸', x: 21.5, y: 26.0 },
  dfw: { name: 'Dallas', country: 'United States', flag: '🇺🇸', x: 19.5, y: 31.5 },
  sea: { name: 'Seattle', country: 'United States', flag: '🇺🇸', x: 13.5, y: 22.5 },
  atl: { name: 'Atlanta', country: 'United States', flag: '🇺🇸', x: 22.5, y: 31.0 },
  mia: { name: 'Miami', country: 'United States', flag: '🇺🇸', x: 23.0, y: 34.5 },
  yto: { name: 'Toronto', country: 'Canada', flag: '🇨🇦', x: 23.5, y: 24.5 },
  ams: { name: 'Amsterdam', country: 'Netherlands', flag: '🇳🇱', x: 49.5, y: 21.0 },
  fra: { name: 'Frankfurt', country: 'Germany', flag: '🇩🇪', x: 50.5, y: 22.0 },
  par: { name: 'Paris', country: 'France', flag: '🇫🇷', x: 48.8, y: 23.0 },
  mad: { name: 'Madrid', country: 'Spain', flag: '🇪🇸', x: 47.0, y: 25.5 },
  waw: { name: 'Warsaw', country: 'Poland', flag: '🇵🇱', x: 52.5, y: 21.5 },
  sto: { name: 'Stockholm', country: 'Sweden', flag: '🇸🇪', x: 51.5, y: 17.5 },
  bom: { name: 'Mumbai', country: 'India', flag: '🇮🇳', x: 65.5, y: 36.5 },
  sgp: { name: 'Singapore', country: 'Singapore', flag: '🇸🇬', x: 75.5, y: 44.5 },
  nrt: { name: 'Tokyo', country: 'Japan', flag: '🇯🇵', x: 82.5, y: 27.5 },
  syd: { name: 'Sydney', country: 'Australia', flag: '🇦🇺', x: 83.5, y: 65.0 },
  jnb: { name: 'Johannesburg', country: 'South Africa', flag: '🇿🇦', x: 55.0, y: 63.0 },
};

const PROTOCOLS = ['WireGuard', 'OpenVPN', 'IKEv2'];

export default function WorldMap({ servers = [] }) {
  const [selected, setSelected] = useState(null);

  const getServerData = (locKey) => servers.find(s => s.location === locKey);
  const isOnline = (s) => s && s.status === 'active' && s.power === 'running';

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-white/5 bg-[#070b16]">
      {/* SVG World Map background using a simple dot-grid representation */}
      <div className="relative w-full" style={{ paddingBottom: '50%' }}>
        {/* Map image using public domain SVG world map */}
        <svg
          viewBox="0 0 1000 500"
          className="absolute inset-0 w-full h-full"
          style={{ background: 'transparent' }}
        >
          {/* Ocean background */}
          <rect width="1000" height="500" fill="#060a14" />

          {/* Simplified continent paths */}
          {/* North America */}
          <path d="M30,60 L180,55 L220,70 L240,100 L260,150 L255,180 L240,200 L220,220 L200,260 L185,300 L175,320 L160,310 L140,290 L120,270 L100,260 L80,240 L60,210 L40,180 L25,150 L20,110 Z" fill="#0d1629" stroke="#1a2540" strokeWidth="1" />
          {/* Greenland */}
          <path d="M200,20 L240,15 L265,25 L270,45 L255,60 L225,65 L205,55 Z" fill="#0d1629" stroke="#1a2540" strokeWidth="1" />
          {/* Central America */}
          <path d="M175,320 L195,330 L200,345 L185,355 L170,340 Z" fill="#0d1629" stroke="#1a2540" strokeWidth="1" />
          {/* South America */}
          <path d="M190,355 L230,340 L265,350 L280,380 L285,420 L270,455 L245,470 L220,460 L200,440 L185,410 L180,380 Z" fill="#0d1629" stroke="#1a2540" strokeWidth="1" />
          {/* Europe */}
          <path d="M430,60 L480,50 L520,55 L545,65 L550,80 L530,95 L510,100 L490,110 L470,115 L450,110 L435,100 L425,85 Z" fill="#0d1629" stroke="#1a2540" strokeWidth="1" />
          {/* Scandinavia */}
          <path d="M475,30 L505,25 L520,40 L515,60 L500,65 L480,55 Z" fill="#0d1629" stroke="#1a2540" strokeWidth="1" />
          {/* Africa */}
          <path d="M450,115 L510,110 L545,120 L560,150 L565,190 L560,230 L545,270 L520,310 L495,330 L470,325 L450,305 L430,270 L425,230 L430,190 L435,155 Z" fill="#0d1629" stroke="#1a2540" strokeWidth="1" />
          {/* Asia */}
          <path d="M545,50 L650,45 L750,50 L820,60 L855,75 L860,100 L840,130 L820,150 L790,160 L760,165 L730,170 L700,175 L670,170 L640,165 L610,160 L580,150 L560,135 L545,115 L540,90 Z" fill="#0d1629" stroke="#1a2540" strokeWidth="1" />
          {/* India */}
          <path d="M620,165 L655,160 L670,175 L665,210 L650,235 L630,245 L615,235 L605,210 L610,185 Z" fill="#0d1629" stroke="#1a2540" strokeWidth="1" />
          {/* Southeast Asia */}
          <path d="M730,170 L775,175 L790,195 L780,215 L755,220 L735,210 L720,195 Z" fill="#0d1629" stroke="#1a2540" strokeWidth="1" />
          {/* Japan */}
          <path d="M820,130 L835,125 L845,140 L840,155 L825,158 L815,145 Z" fill="#0d1629" stroke="#1a2540" strokeWidth="1" />
          {/* Australia */}
          <path d="M780,310 L840,305 L870,315 L880,340 L875,370 L855,390 L825,395 L795,385 L775,365 L770,340 Z" fill="#0d1629" stroke="#1a2540" strokeWidth="1" />
          {/* Middle East */}
          <path d="M545,115 L590,110 L610,125 L615,150 L600,165 L575,165 L555,155 L545,140 Z" fill="#0d1629" stroke="#1a2540" strokeWidth="1" />

          {/* Grid lines */}
          {[100,200,300,400,500,600,700,800,900].map(x => (
            <line key={`vl${x}`} x1={x} y1="0" x2={x} y2="500" stroke="#0f1825" strokeWidth="0.5" />
          ))}
          {[100,200,300,400].map(y => (
            <line key={`hl${y}`} x1="0" y1={y} x2="1000" y2={y} stroke="#0f1825" strokeWidth="0.5" />
          ))}

          {/* Connection lines from selected pin to others */}
          {selected && Object.entries(SERVER_LOCATIONS).map(([key, loc]) => {
            if (key === selected) return null;
            const sel = SERVER_LOCATIONS[selected];
            return (
              <line
                key={`line-${key}`}
                x1={sel.x * 10}
                y1={sel.y * 5}
                x2={loc.x * 10}
                y2={loc.y * 5}
                stroke="#22d3ee"
                strokeWidth="0.4"
                strokeOpacity="0.18"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Server pins */}
          {Object.entries(SERVER_LOCATIONS).map(([key, loc]) => {
            const serverData = getServerData(key);
            const online = isOnline(serverData);
            const isSelected = selected === key;
            const hasData = !!serverData;
            const cx = loc.x * 10;
            const cy = loc.y * 5;

            return (
              <g key={key} onClick={() => setSelected(isSelected ? null : key)} style={{ cursor: 'pointer' }}>
                {/* Pulse ring */}
                {(online || !hasData) && (
                  <circle cx={cx} cy={cy} r={isSelected ? 10 : 7} fill="none"
                    stroke={isSelected ? '#22d3ee' : '#22d3ee'}
                    strokeWidth={isSelected ? 1.5 : 0.8}
                    strokeOpacity={isSelected ? 0.6 : 0.3}
                  />
                )}
                {/* Pin dot */}
                <circle
                  cx={cx} cy={cy} r={isSelected ? 5 : 3.5}
                  fill={isSelected ? '#22d3ee' : (hasData ? (online ? '#22d3ee' : '#f43f5e') : '#22d3ee88')}
                  style={{ filter: isSelected ? 'drop-shadow(0 0 6px #22d3ee)' : 'none' }}
                />
              </g>
            );
          })}
        </svg>

        {/* Tooltip/popup panel */}
        <AnimatePresence>
          {selected && (() => {
            const loc = SERVER_LOCATIONS[selected];
            const serverData = getServerData(selected);
            const online = isOnline(serverData);
            const ram = serverData?.ram >= 1024 ? `${serverData.ram / 1024}GB` : `${serverData?.ram}MB`;

            // Position panel — flip if too far right
            const panelLeft = loc.x > 70 ? 'auto' : `${loc.x}%`;
            const panelRight = loc.x > 70 ? `${100 - loc.x}%` : 'auto';
            const panelTop = loc.y > 55 ? 'auto' : `${Math.min(loc.y + 4, 60)}%`;
            const panelBottom = loc.y > 55 ? `${100 - loc.y + 4}%` : 'auto';

            return (
              <motion.div
                key={selected}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="absolute z-20 w-56 rounded-xl border border-cyan-500/25 bg-[#0a1020]/95 backdrop-blur-md shadow-2xl p-4"
                style={{ left: panelLeft, right: panelRight, top: panelTop, bottom: panelBottom }}
              >
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-2 right-2 text-slate-500 hover:text-white transition-colors"
                >
                  <X size={13} />
                </button>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{loc.flag}</span>
                  <div>
                    <p className="text-white font-bold text-sm leading-tight">{loc.name}</p>
                    <p className="text-slate-500 text-[10px]">{loc.country}</p>
                  </div>
                </div>

                {serverData ? (
                  <>
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-cyan-400' : 'bg-rose-500'}`} />
                      <span className={`text-xs font-semibold ${online ? 'text-cyan-400' : 'text-rose-400'}`}>
                        {online ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    <div className="space-y-1.5 mb-3 text-xs text-slate-400">
                      <div className="flex justify-between">
                        <span>IP</span>
                        <span className="font-mono text-slate-300">{serverData.ip}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CPU</span>
                        <span className="text-slate-300">{serverData.vcpu} vCPU</span>
                      </div>
                      <div className="flex justify-between">
                        <span>RAM</span>
                        <span className="text-slate-300">{ram}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span className="text-xs font-semibold text-cyan-400">Available</span>
                  </div>
                )}

                {/* Protocols */}
                <div>
                  <p className="text-slate-600 text-[10px] uppercase tracking-wider mb-1.5">Protocols</p>
                  <div className="flex flex-wrap gap-1">
                    {PROTOCOLS.map(p => (
                      <span key={p} className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-semibold">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" /> Online</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Offline</span>
        </div>
        <p className="text-slate-600 text-xs">{Object.keys(SERVER_LOCATIONS).length} locations · Click a pin for details</p>
      </div>
    </div>
  );
}