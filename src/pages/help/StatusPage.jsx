import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

const incidents = [
  { date: '2026-03-28', status: 'resolved', title: 'Brief service interruption in EU servers', duration: '15 mins', time: '02:30 UTC' },
  { date: '2026-03-20', status: 'resolved', title: 'Scheduled maintenance on Asia-Pacific nodes', duration: 'Completed', time: '18:00 UTC' },
  { date: '2026-03-10', status: 'resolved', title: 'DNS cache refresh across all regions', duration: '5 mins', time: '09:15 UTC' },
];

export default function StatusPage() {
  return (
    <div className="bg-[#080c18]">
      <Navbar />
      <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <p className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">System Status</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">VoxVPN Service Status</h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Real-time status and incident history for all VoxVPN services across global regions.
            </p>
          </div>

          {/* Current Status */}
          <div className="mb-10 p-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-semibold">All Systems Operational</span>
            </div>
            <p className="text-slate-300 text-sm">Last updated: 2 minutes ago</p>
          </div>

          {/* Service Components */}
          <div className="mb-12">
            <h2 className="text-white font-bold text-lg mb-6">Service Components</h2>
            <div className="space-y-3">
              {[
                { name: 'VPN Servers', status: 'operational' },
                { name: 'API Services', status: 'operational' },
                { name: 'Web Portal', status: 'operational' },
                { name: 'Mobile Apps', status: 'operational' },
              ].map((component) => (
                <div key={component.name} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-[#0d1120]">
                  <span className="text-white font-medium text-sm">{component.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-emerald-400 text-xs font-semibold capitalize">{component.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Incident History */}
          <div>
            <h2 className="text-white font-bold text-lg mb-6">Incident History</h2>
            <div className="space-y-3">
              {incidents.map((incident, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-white/5 bg-[#0d1120] hover:border-white/10 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      {incident.status === 'resolved' ? (
                        <CheckCircle size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="text-white font-medium text-sm">{incident.title}</p>
                        <p className="text-slate-500 text-xs mt-1">{incident.date}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      incident.status === 'resolved'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {incident.status === 'resolved' ? 'Resolved' : 'Investigating'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs">{incident.time} · Duration: {incident.duration}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Subscribe Section */}
          <div className="mt-12 p-6 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
            <p className="text-white font-semibold text-sm mb-2">Get Status Updates</p>
            <p className="text-slate-400 text-xs mb-4">Subscribe to notifications for service incidents and maintenance.</p>
            <a href="mailto:status@voxvpn.net" className="inline-block px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-lg transition-colors">
              Subscribe to Updates
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}