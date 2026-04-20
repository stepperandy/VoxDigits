import { useState } from 'react';
import { VPN_SERVERS } from '@/lib/vpnServers';
import { VPN_CONFIGS } from '@/lib/vpnConfigs';
import { Shield, Server, FileText, CheckCircle2 } from 'lucide-react';

export default function VpnServers() {
  const [selectedServer, setSelectedServer] = useState(null);

  const handleConnect = (server) => {
    const config = VPN_CONFIGS[server.id];
    console.log('Selected server:', server);
    if (config && config.trim().length > 0) {
      console.log('Config text:', config);
    } else {
      console.log('Config not added yet');
    }
  };

  return (
    <div className="min-h-screen bg-[#060d1a] px-5 pt-14 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <Shield size={18} className="text-cyan-400" />
        </div>
        <div>
          <h1 className="text-white font-black text-xl leading-none">VPN Servers</h1>
          <p className="text-slate-500 text-xs mt-0.5">{VPN_SERVERS.length} locations available</p>
        </div>
      </div>

      {/* Server list */}
      <div className="space-y-3">
        {VPN_SERVERS.map((server) => {
          const isSelected = selectedServer?.id === server.id;
          return (
            <div
              key={server.id}
              onClick={() => setSelectedServer(server)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-cyan-500/40 bg-cyan-500/5 ring-1 ring-cyan-500/20'
                  : 'border-white/5 bg-[#0d1120] hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Server size={14} className={isSelected ? 'text-cyan-400' : 'text-slate-500'} />
                    <p className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {server.name}
                    </p>
                    {isSelected && <CheckCircle2 size={14} className="text-cyan-400" />}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                    <FileText size={11} />
                    <span className="font-mono">{server.file}</span>
                  </div>
                </div>

                {/* Status + Connect */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {server.status}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedServer(server);
                      handleConnect(server);
                    }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-cyan-400 hover:bg-cyan-300 text-black shadow-lg shadow-cyan-500/20'
                        : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                    }`}
                  >
                    Connect
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected hint */}
      {selectedServer && (
        <p className="text-center text-slate-600 text-xs mt-6">
          Selected: <span className="text-slate-400 font-semibold">{selectedServer.name}</span>
        </p>
      )}
    </div>
  );
}