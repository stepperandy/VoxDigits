import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';
import { Smartphone, LogIn, Globe } from 'lucide-react';

export default function PlayAppAccess() {
  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
              style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
              <Smartphone size={28} className="text-cyan-400" />
            </div>
            <h1 className="text-white text-3xl sm:text-4xl font-black tracking-tight mb-3">Play Console App Access</h1>
            <p className="text-slate-500 text-sm">Google Play Review — App Access Instructions</p>
          </div>

          {/* Access info */}
          <div className="rounded-2xl p-8 mb-6"
            style={{ background: 'linear-gradient(135deg, #0d1120, #060c1a)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(0,212,255,0.1)' }}>
                <LogIn size={18} className="text-cyan-400" />
              </div>
              <div>
                <h2 className="text-white text-lg font-bold mb-2">Login Requirement</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  The app requires users to log in using a VoxVPN account.
                </p>
              </div>
            </div>

            <div className="border-t border-white/5 pt-6">
              <h3 className="text-white text-sm font-bold mb-3">How to Access</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Google Play reviewers may create a new account through the in-app registration process or at:
              </p>
              <a href="https://voxvpn.net" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-cyan-400 text-sm font-semibold hover:text-cyan-300 transition-colors">
                <Globe size={14} /> https://voxvpn.net
              </a>
            </div>

            <div className="border-t border-white/5 pt-6 mt-6">
              <p className="text-slate-300 text-sm leading-relaxed">
                No special credentials are required to access app functionality.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}