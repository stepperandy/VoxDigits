import { X, ExternalLink, FileDown, FolderUp, PlayCircle } from 'lucide-react';

/**
 * OpenvpnHelpSheet — in-app instructions for installing OpenVPN Connect
 * and importing an .ovpn configuration. Makes no claims that VoxVPN itself
 * establishes a VPN tunnel or encrypts traffic.
 */
export default function OpenvpnHelpSheet({ open, onClose }) {
  if (!open) return null;

  const steps = [
    {
      icon: ExternalLink,
      title: 'Install OpenVPN Connect',
      body: 'Download the official OpenVPN Connect app from the App Store. It is free and required to establish the VPN connection.',
      cta: 'Open App Store',
      href: 'https://apps.apple.com/us/app/openvpn-connect/id590379981',
    },
    {
      icon: FileDown,
      title: 'Export or download your config',
      body: 'In this app, open the Servers screen and tap Config on the server you want. The .ovpn file is saved to your device.',
    },
    {
      icon: FolderUp,
      title: 'Import into OpenVPN Connect',
      body: 'Open the .ovpn file from Files (or use OpenVPN Connect’s import). It will appear under your OpenVPN Connect profiles.',
    },
    {
      icon: PlayCircle,
      title: 'Connect inside OpenVPN Connect',
      body: 'Tap the profile, enter your credentials if prompted, then connect. VoxVPN does not establish this connection itself.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[85vh] overflow-y-auto"
        style={{
          background: 'rgba(13,17,32,0.97)',
          border: '1px solid rgba(0,212,255,0.25)',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white font-black text-lg leading-none">OpenVPN Connect</h2>
            <p className="text-slate-500 text-xs mt-1">How to connect using OpenVPN Connect</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="mb-4 p-3 rounded-2xl"
          style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.2)' }}>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            VoxVPN is a companion app. It manages your account and provides OpenVPN
            configuration files. VoxVPN does not establish a VPN connection, encrypt
            traffic, or use a native device tunnel — the connection is made by the
            separate OpenVPN Connect app.
          </p>
        </div>

        <ol className="space-y-3">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)' }}>
                <s.icon size={15} className="text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-bold leading-none">
                  {i + 1}. {s.title}
                </p>
                <p className="text-slate-400 text-[12px] mt-1 leading-relaxed">{s.body}</p>
                {s.href && (
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 rounded-lg text-[11px] font-bold text-cyan-300"
                    style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)' }}
                  >
                    {s.cta} <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}