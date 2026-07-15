import { Download, Shield, Monitor, Smartphone, Server, Tag, ExternalLink, Loader2 } from 'lucide-react';
import { FaWindows, FaAndroid, FaApple, FaLinux } from 'react-icons/fa';

const platformMeta = {
  Windows: { icon: FaWindows, color: '#00d4ff' },
  Android: { icon: FaAndroid, color: '#34A853' },
  iOS: { icon: FaApple, color: '#a3a3a3' },
  macOS: { icon: FaApple, color: '#a3a3a3' },
  Linux: { icon: FaLinux, color: '#f59e0b' },
  Router: { icon: Server, color: '#a78bfa' },
};

export default function AdminAllInstallers({ installers, onDownload, downloading }) {
  if (!installers || installers.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-[#0d1420] p-6">
        <h3 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
          <Shield size={14} className="text-cyan-400" /> All Installers (Admin)
        </h3>
        <p className="text-slate-500 text-xs">No installer records found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-[#0d1420] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-sm flex items-center gap-2">
          <Shield size={14} className="text-cyan-400" /> All Installers (Admin View)
        </h3>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          {installers.length} total
        </span>
      </div>

      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500 border-b border-white/5">
              <th className="text-left font-medium px-2 py-2">Name</th>
              <th className="text-left font-medium px-2 py-2">Platform</th>
              <th className="text-left font-medium px-2 py-2">Version</th>
              <th className="text-left font-medium px-2 py-2">Size</th>
              <th className="text-left font-medium px-2 py-2">Source</th>
              <th className="text-left font-medium px-2 py-2">Status</th>
              <th className="text-right font-medium px-2 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {installers.map((inst) => {
              const meta = platformMeta[inst.platform] || { icon: Monitor, color: '#94a3b8' };
              const Icon = meta.icon;
              const key = inst.id || inst.platform + inst.name;
              const isGitHub = /github\.com/i.test(inst.file_url || '');
              const isFirebase = /firebasestorage/i.test(inst.file_url || '');
              return (
                <tr key={key} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-2 py-2.5">
                    <div className="flex items-center gap-2">
                      <Icon size={14} style={{ color: meta.color }} className="flex-shrink-0" />
                      <span className="text-white font-medium">{inst.name}</span>
                    </div>
                  </td>
                  <td className="px-2 py-2.5 text-slate-400">{inst.platform}</td>
                  <td className="px-2 py-2.5">
                    {inst.version ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-400">
                        <Tag size={8} /> v{inst.version}
                      </span>
                    ) : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-2 py-2.5 text-slate-400">{inst.file_size || '—'}</td>
                  <td className="px-2 py-2.5">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      isGitHub ? 'bg-violet-500/10 text-violet-400' :
                      isFirebase ? 'bg-amber-500/10 text-amber-400' :
                      'bg-slate-500/10 text-slate-400'
                    }`}>
                      {isGitHub ? 'GitHub' : isFirebase ? 'Firebase' : 'Direct'}
                    </span>
                  </td>
                  <td className="px-2 py-2.5">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      inst.is_active !== false
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {inst.is_active !== false ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-right">
                    {inst.file_url ? (
                      <button
                        onClick={() => onDownload?.(inst)}
                        disabled={downloading === key}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-cyan-400 hover:bg-cyan-500/10 transition-colors disabled:opacity-50"
                      >
                        {downloading === key ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                        Download
                      </button>
                    ) : (
                      <span className="text-slate-600 text-[10px]">No URL</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}