import { Link } from 'react-router-dom';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import {
  Apple,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  Lock,
  Network,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';

const APP_STORE_URL = 'https://apps.apple.com/app/id6792058338';
const WEB_PRICING_URL = 'https://voxvpn.net/pricing';

const STEPS = [
  {
    number: '01',
    title: 'Create or use a VoxVPN account',
    description: 'Use a registered VoxVPN account. iOS access is free and does not require an active web subscription.',
    icon: KeyRound,
  },
  {
    number: '02',
    title: 'Install VoxVPN Security',
    description: 'Open the App Store listing for the native VoxVPN Security client on your iPhone or iPad.',
    icon: Apple,
  },
  {
    number: '03',
    title: 'Sign in and review the disclosure',
    description: 'Sign in, read the VPN data disclosure, and choose an available VoxVPN server.',
    icon: ShieldCheck,
  },
  {
    number: '04',
    title: 'Allow the VPN configuration',
    description: 'Tap Connect and approve the iOS Network Extension permission prompt. Your device creates the encrypted tunnel.',
    icon: Network,
  },
];

export default function IOSSetup() {
  return (
    <div className="min-h-screen bg-[#060c1a] text-white">
      <Navbar />

      <main className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: 'rgba(0,212,255,0.12)',
              border: '1px solid rgba(0,212,255,0.35)',
              boxShadow: '0 0 30px rgba(0,212,255,0.12)',
            }}
          >
            <Apple size={32} className="text-cyan-300" />
          </div>
          <div>
            <h1 className="text-3xl font-black">VoxVPN Security for iOS</h1>
            <p className="text-slate-400 text-sm mt-1">Native Network Extension VPN — free iOS access</p>
          </div>
        </div>

        <section className="rounded-2xl border border-cyan-500/25 bg-cyan-500/5 p-6 mb-8">
          <div className="flex items-center gap-2 text-cyan-300 text-xs font-black uppercase tracking-widest mb-3">
            <Smartphone size={15} /> Native iOS client
          </div>
          <h2 className="text-white text-xl font-black mb-3">A separate iOS product path</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            The iOS app has a free VPN path plus optional Premium Monthly and Premium Yearly subscriptions sold only through Apple In-App Purchase. It never opens web or external checkout for iOS digital access. The paid plans shown on the website pricing page are separate web/desktop plans and are not sold through this page.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950"
            >
              Open App Store listing <ExternalLink size={14} />
            </a>
            <a
              href={WEB_PRICING_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-slate-300"
            >
              View web/desktop plans <ExternalLink size={14} />
            </a>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 mb-8">
          {STEPS.map(({ number, title, description, icon: Icon }) => (
            <article key={number} className="rounded-2xl border border-white/10 bg-[#0d1420] p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-cyan-400 text-xs font-black tracking-widest">{number}</span>
                <Icon size={17} className="text-cyan-300" />
                <h3 className="font-bold text-white">{title}</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 mb-8">
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-black uppercase tracking-widest mb-3">
            <Lock size={15} /> Privacy and security
          </div>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-300 shrink-0 mt-0.5" />The WireGuard private key is generated on-device and stored in the iOS Keychain.</li>
            <li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-300 shrink-0 mt-0.5" />VoxVPN does not collect, retain, sell, or share VPN traffic or connection data.</li>
            <li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-300 shrink-0 mt-0.5" />The Packet Tunnel provider establishes the VPN through Apple Network Extension APIs.</li>
          </ul>
        </section>

        <p className="text-slate-500 text-xs">
          Need an account? <Link to="/auth-signup" className="text-cyan-400 hover:text-cyan-300">Create one here</Link>.
          Website plans are governed separately by the web service terms and are not required for iOS access.
        </p>
      </main>

      <Footer />
    </div>
  );
}
