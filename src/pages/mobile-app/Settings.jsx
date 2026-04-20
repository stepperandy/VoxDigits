import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Bell, Moon, LogOut, ChevronRight, Info, FileText, HelpCircle, Trash2 } from 'lucide-react';

function ToggleRow({ label, desc, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex-1 mr-4">
        <p className="text-white text-sm font-semibold">{label}</p>
        {desc && <p className="text-slate-500 text-xs mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-all flex-shrink-0 relative ${value ? 'bg-cyan-400' : 'bg-white/10'}`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${value ? 'right-1' : 'left-1'}`} />
      </button>
    </div>
  );
}

function LinkRow({ icon: Icon, label, color = 'text-slate-400', onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 py-4 text-left hover:opacity-80 transition-opacity"
    >
      <Icon size={18} className={color} />
      <span className={`flex-1 text-sm font-semibold ${color === 'text-rose-400' ? 'text-rose-400' : 'text-white'}`}>{label}</span>
      <ChevronRight size={16} className="text-slate-600" />
    </button>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const email = localStorage.getItem('vpn_email') || 'Not signed in';
  const [killSwitch, setKillSwitch] = useState(true);
  const [autoConnect, setAutoConnect] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('vpn_token');
    localStorage.removeItem('vpn_email');
    navigate('/app/login');
  };

  return (
    <div className="min-h-screen bg-[#060d1a] flex flex-col">
      {/* Header */}
      <div className="px-5 pt-14 pb-4 flex items-center gap-3">
        <button onClick={() => navigate('/app/servers')}
          className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-white font-black text-lg">Settings</h1>
      </div>

      <div className="flex-1 px-5 pb-8 flex flex-col gap-4 overflow-y-auto">
        {/* Account */}
        <div className="p-4 rounded-2xl bg-[#0d1120] border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Shield size={22} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">VoxVPN Account</p>
              <p className="text-slate-500 text-xs">{email}</p>
            </div>
          </div>
        </div>

        {/* VPN Settings */}
        <div className="p-4 rounded-2xl bg-[#0d1120] border border-white/5">
          <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-1">VPN Settings</p>
          <div className="divide-y divide-white/5">
            <ToggleRow label="Kill Switch" desc="Block internet if VPN disconnects" value={killSwitch} onChange={setKillSwitch} />
            <ToggleRow label="Auto-Connect" desc="Connect on startup" value={autoConnect} onChange={setAutoConnect} />
          </div>
        </div>

        {/* App Settings */}
        <div className="p-4 rounded-2xl bg-[#0d1120] border border-white/5">
          <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-1">App</p>
          <div className="divide-y divide-white/5">
            <ToggleRow label="Notifications" value={notifications} onChange={setNotifications} />
            <ToggleRow label="Dark Mode" value={darkMode} onChange={setDarkMode} />
          </div>
        </div>

        {/* Links */}
        <div className="p-4 rounded-2xl bg-[#0d1120] border border-white/5">
          <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-1">About</p>
          <div className="divide-y divide-white/5">
            <LinkRow icon={Info} label="App Version 1.0.0" color="text-slate-400" onClick={() => {}} />
            <LinkRow icon={FileText} label="Privacy Policy" onClick={() => window.open('/', '_blank')} />
            <LinkRow icon={HelpCircle} label="Support" onClick={() => window.open('/contact', '_blank')} />
          </div>
        </div>

        {/* Danger zone */}
        <div className="p-4 rounded-2xl bg-[#0d1120] border border-rose-500/10">
          <div className="divide-y divide-white/5">
            <LinkRow icon={LogOut} label="Sign Out" color="text-rose-400" onClick={handleLogout} />
          </div>
        </div>

        <p className="text-center text-slate-700 text-xs pb-4">VoxVPN v1.0.0 · voxdigits.com</p>
      </div>
    </div>
  );
}