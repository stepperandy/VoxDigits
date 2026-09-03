import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';
import { Shield, Mail, Globe, Play, Lock, Server, User, CreditCard, Settings } from 'lucide-react';

const features = [
  { icon: Shield, label: 'Dashboard' },
  { icon: Server, label: 'VPN Server List' },
  { icon: Lock, label: 'Connect / Disconnect VPN' },
  { icon: User, label: 'Account Management' },
  { icon: CreditCard, label: 'Subscription Information' },
  { icon: Settings, label: 'Settings' },
];

export default function PlayReview() {
  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
              style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
              <Play size={28} className="text-cyan-400" />
            </div>
            <h1 className="text-white text-3xl sm:text-4xl font-black tracking-tight mb-3">
              VoxVPN Google Play Review Access
            </h1>
            <p className="text-cyan-400 text-sm font-semibold">Welcome Google Play Review Team.</p>
            <p className="text-slate-500 text-sm mt-1">Thank you for reviewing VoxVPN.</p>
          </div>

          {/* App Overview */}
          <div className="rounded-2xl p-6 mb-6"
            style={{ background: 'linear-gradient(135deg, #0d1120, #060c1a)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 className="text-white text-lg font-bold mb-3">App Overview</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              VoxVPN is a VPN service that allows users to securely connect to VPN servers, protect their internet traffic,
              and manage their subscriptions through their VoxVPN account.
            </p>
          </div>

          {/* Access Instructions */}
          <div className="rounded-2xl p-6 mb-6"
            style={{ background: 'linear-gradient(135deg, #0d1120, #060c1a)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 className="text-white text-lg font-bold mb-4">Access Instructions</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              The application requires user authentication.
            </p>

            {/* Option 1 */}
            <div className="pl-4 border-l-2 border-cyan-500/20 mb-6">
              <h3 className="text-cyan-400 text-sm font-bold mb-2">Option 1 – Create a Test Account</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-3">
                Reviewers may create a free account directly within the application by selecting:
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-3"
                style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
                <User size={14} className="text-cyan-400" />
                <span className="text-cyan-400 text-sm font-semibold">Create Account</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                or by visiting:{' '}
                <a href="https://voxvpn.net/register" target="_blank" rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  https://voxvpn.net/register
                </a>
              </p>
            </div>

            {/* Option 2 */}
            <div className="pl-4 border-l-2 border-cyan-500/20">
              <h3 className="text-cyan-400 text-sm font-bold mb-2">Option 2 – Use Review Credentials</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <span className="text-slate-600 font-semibold w-20">Email:</span>
                  <a href="mailto:playreview@voxvpn.net" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    playreview@voxvpn.net
                  </a>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <span className="text-slate-600 font-semibold w-20">Password:</span>
                  <code className="text-cyan-400 text-sm font-mono">VoxVPNReview2026!</code>
                </div>
              </div>
              <p className="text-slate-600 text-xs italic mt-3">(Replace with actual review credentials before submission.)</p>
            </div>
          </div>

          {/* Features Available for Review */}
          <div className="rounded-2xl p-6 mb-6"
            style={{ background: 'linear-gradient(135deg, #0d1120, #060c1a)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 className="text-white text-lg font-bold mb-4">Features Available for Review</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">After login, reviewers can access:</p>
            <div className="grid grid-cols-2 gap-3">
              {features.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Icon size={15} className="text-cyan-400 flex-shrink-0" />
                  <span className="text-slate-400 text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* VPN Functionality */}
          <div className="rounded-2xl p-6 mb-6"
            style={{ background: 'linear-gradient(135deg, #0d1120, #060c1a)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 className="text-white text-lg font-bold mb-4">VPN Functionality</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-3">
              The application uses Android VPNService solely to establish encrypted VPN connections between user devices
              and VoxVPN servers.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed">
              The VPN service is not used for advertising, traffic manipulation, or user activity monitoring.
            </p>
          </div>

          {/* Support */}
          <div className="rounded-2xl p-8 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,212,255,0.02))', border: '1px solid rgba(0,212,255,0.2)' }}>
            <h2 className="text-white text-lg font-bold mb-4">Support</h2>
            <div className="flex flex-col items-center gap-3">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <a href="https://voxvpn.net" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-cyan-400 text-sm hover:text-cyan-300 transition-colors">
                  <Globe size={14} /> voxvpn.net
                </a>
                <a href="mailto:support@voxvpn.net"
                  className="flex items-center gap-2 text-cyan-400 text-sm hover:text-cyan-300 transition-colors">
                  <Mail size={14} /> support@voxvpn.net
                </a>
              </div>
            </div>
            <p className="text-slate-300 text-sm font-semibold mt-4">VoxTelefony Communications LLC</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}