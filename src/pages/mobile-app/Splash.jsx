import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('vpn_token');
    const timer = setTimeout(() => {
      navigate(token ? '/app/servers' : '/app/login');
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#060d1a] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center gap-6 animate-pulse">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/40">
          <Shield size={48} className="text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-black text-white tracking-tight">VoxVPN</h1>
          <p className="text-cyan-400 text-sm font-medium mt-1 tracking-widest uppercase">Secure · Private · Fast</p>
        </div>
      </div>

      <div className="absolute bottom-12 flex flex-col items-center gap-3">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-cyan-400"
              style={{ animation: `bounce 1.2s ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
        <p className="text-slate-600 text-xs">Initializing secure connection...</p>
      </div>
    </div>
  );
}