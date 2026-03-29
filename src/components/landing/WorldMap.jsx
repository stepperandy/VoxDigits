import { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const SERVER_LOCATIONS = {
  lhr: { name: 'London',        country: 'United Kingdom',  flag: '🇬🇧', lat: 51.5,  lng: -0.1  },
  ewr: { name: 'New York',      country: 'United States',   flag: '🇺🇸', lat: 40.7,  lng: -74.0 },
  lax: { name: 'Los Angeles',   country: 'United States',   flag: '🇺🇸', lat: 34.0,  lng: -118.2},
  ord: { name: 'Chicago',       country: 'United States',   flag: '🇺🇸', lat: 41.8,  lng: -87.6 },
  dfw: { name: 'Dallas',        country: 'United States',   flag: '🇺🇸', lat: 32.8,  lng: -96.8 },
  sea: { name: 'Seattle',       country: 'United States',   flag: '🇺🇸', lat: 47.6,  lng: -122.3},
  atl: { name: 'Atlanta',       country: 'United States',   flag: '🇺🇸', lat: 33.7,  lng: -84.4 },
  mia: { name: 'Miami',         country: 'United States',   flag: '🇺🇸', lat: 25.8,  lng: -80.2 },
  yto: { name: 'Toronto',       country: 'Canada',          flag: '🇨🇦', lat: 43.7,  lng: -79.4 },
  ams: { name: 'Amsterdam',     country: 'Netherlands',     flag: '🇳🇱', lat: 52.4,  lng: 4.9   },
  fra: { name: 'Frankfurt',     country: 'Germany',         flag: '🇩🇪', lat: 50.1,  lng: 8.7   },
  par: { name: 'Paris',         country: 'France',          flag: '🇫🇷', lat: 48.9,  lng: 2.3   },
  mad: { name: 'Madrid',        country: 'Spain',           flag: '🇪🇸', lat: 40.4,  lng: -3.7  },
  waw: { name: 'Warsaw',        country: 'Poland',          flag: '🇵🇱', lat: 52.2,  lng: 21.0  },
  sto: { name: 'Stockholm',     country: 'Sweden',          flag: '🇸🇪', lat: 59.3,  lng: 18.1  },
  bom: { name: 'Mumbai',        country: 'India',           flag: '🇮🇳', lat: 19.1,  lng: 72.9  },
  sgp: { name: 'Singapore',     country: 'Singapore',       flag: '🇸🇬', lat: 1.3,   lng: 103.8 },
  nrt: { name: 'Tokyo',         country: 'Japan',           flag: '🇯🇵', lat: 35.7,  lng: 139.7 },
  syd: { name: 'Sydney',        country: 'Australia',       flag: '🇦🇺', lat: -33.9, lng: 151.2 },
  jnb: { name: 'Johannesburg',  country: 'South Africa',    flag: '🇿🇦', lat: -26.2, lng: 28.0  },
};

const PROTOCOLS = ['WireGuard', 'OpenVPN', 'IKEv2'];

export default function WorldMap({ servers = [] }) {
  const getServerData = (key) => servers.find(s => s.location === key);
  const isOnline = (s) => s && s.status === 'active' && s.power === 'running';

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-white/5" style={{ height: 420 }}>
      <style>{`
        .leaflet-container { background: #060a14; }
        .leaflet-tile-pane { filter: brightness(0.45) saturate(0.3) hue-rotate(190deg); }
        .leaflet-control-zoom { display: none; }
        .leaflet-control-attribution { display: none; }
        .leaflet-popup-content-wrapper {
          background: rgba(10,16,32,0.97);
          border: 1px solid rgba(34,211,238,0.25);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6);
          color: white;
          padding: 0;
        }
        .leaflet-popup-tip-container { display: none; }
        .leaflet-popup-close-button { display: none; }
        .leaflet-popup-content { margin: 0; }
      `}</style>

      <MapContainer
        center={[20, 10]}
        zoom={2}
        minZoom={2}
        maxZoom={5}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%' }}
        worldCopyJump={false}
        maxBounds={[[-85, -180], [85, 180]]}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution=""
        />

        {Object.entries(SERVER_LOCATIONS).map(([key, loc]) => {
          const serverData = getServerData(key);
          const online = isOnline(serverData);
          const hasData = !!serverData;
          const color = hasData ? (online ? '#22d3ee' : '#f43f5e') : '#22d3ee';
          const ram = serverData?.ram >= 1024 ? `${serverData.ram / 1024}GB` : serverData ? `${serverData.ram}MB` : null;

          return (
            <CircleMarker
              key={key}
              center={[loc.lat, loc.lng]}
              radius={6}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.9,
                weight: 2,
                opacity: 0.8,
              }}
            >
              <Popup>
                <div className="p-4 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{loc.flag}</span>
                    <div>
                      <p className="text-white font-bold text-sm leading-tight">{loc.name}</p>
                      <p className="text-slate-400 text-[11px]">{loc.country}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mb-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${hasData ? (online ? 'bg-cyan-400' : 'bg-rose-500') : 'bg-cyan-400'}`} />
                    <span className={`text-xs font-semibold ${hasData ? (online ? 'text-cyan-400' : 'text-rose-400') : 'text-cyan-400'}`}>
                      {hasData ? (online ? 'Online' : 'Offline') : 'Available'}
                    </span>
                  </div>

                  {serverData && (
                    <div className="space-y-1.5 mb-3 text-xs text-slate-400">
                      <div className="flex justify-between gap-4">
                        <span>IP</span>
                        <span className="font-mono text-slate-300">{serverData.ip}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>CPU</span>
                        <span className="text-slate-300">{serverData.vcpu} vCPU</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>RAM</span>
                        <span className="text-slate-300">{ram}</span>
                      </div>
                    </div>
                  )}

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
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Legend overlay */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-[#060a14]/80 backdrop-blur-sm border-t border-white/5 z-[1000]">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" /> Online</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Offline</span>
        </div>
        <p className="text-slate-600 text-xs">{Object.keys(SERVER_LOCATIONS).length} locations · Click a pin for details</p>
      </div>
    </div>
  );
}