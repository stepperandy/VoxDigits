import { Link } from 'react-router-dom';
import { TrendingUp, Shield, Globe, Users, DollarSign, Target, BarChart2, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

const stats = [
  { label: 'Current ARR', value: '$2.4M' },
  { label: 'YoY Growth', value: '168%' },
  { label: 'Paying Customers', value: '1,180' },
  { label: 'Total Seats', value: '41,000' },
  { label: 'Net Revenue Retention', value: '128%' },
  { label: 'Gross Margin', value: '81%' },
];

const problems = [
  { title: 'Remote work expanded the attack surface', desc: '74% of surveyed SMBs allow employees to connect from personal devices and public Wi-Fi with no consistent VPN policy.' },
  { title: 'Point solutions create tool sprawl', desc: 'The average mid-market company runs 6–9 disconnected security tools, driving up cost and admin overhead.' },
  { title: 'Legacy enterprise VPNs are slow and clunky', desc: 'Traditional corporate VPN clients suffer from latency, poor UX, and expensive per-appliance licensing.' },
  { title: 'Compliance pressure is rising', desc: 'GDPR, CCPA, HIPAA, and SOC 2 Type II requirements mandate encrypted data-in-transit and access logging.' },
  { title: 'Shadow IT creates blind spots', desc: 'Employees self-install consumer VPN apps with no centralized visibility, logging, or kill-switch enforcement.' },
];

const pillars = [
  { icon: Shield, title: 'VoxVPN — Secure Tunnel Layer', desc: 'WireGuard-based encrypted tunneling across 62 global server locations, with split-tunneling, dedicated IP options, and sub-40ms latency benchmarks.' },
  { icon: AlertTriangle, title: 'Shield — Threat & DNS Protection', desc: 'Real-time malicious domain blocking, phishing-link interception, and ad/tracker suppression at the network layer — no browser extension required.' },
  { icon: BarChart2, title: 'Admin Command Center', desc: 'Centralized dashboard for provisioning, device policy enforcement, audit logging, and compliance report generation (GDPR/CCPA/SOC 2 ready exports).' },
  { icon: CheckCircle, title: 'Zero-Trust Access Add-on', desc: 'Role-based access control (RBAC) for internal apps, replacing legacy site-to-site VPN tunnels with identity-aware proxying.' },
];

const pricingTiers = [
  { plan: 'Starter', price: '$6', segment: 'Teams <25', includes: 'VPN + Shield DNS filtering' },
  { plan: 'Business', price: '$11', segment: '25–250 employees', includes: '+ Admin console, audit logs' },
  { plan: 'Enterprise', price: '$18', segment: '250+ employees', includes: '+ Zero-trust access, dedicated IP, SLA support' },
  { plan: 'Compliance Add-on', price: '+$3/seat', segment: 'Regulated industries', includes: 'Automated GDPR/HIPAA reporting' },
];

const traction = [
  { quarter: 'Q1 2023', arr: '$410K', customers: '210', milestone: 'Public launch' },
  { quarter: 'Q3 2023', arr: '$980K', customers: '540', milestone: 'SOC 2 Type I certification' },
  { quarter: 'Q1 2024', arr: '$1.6M', customers: '810', milestone: 'AWS Marketplace listing live' },
  { quarter: 'Q3 2024', arr: '$2.4M', customers: '1,180', milestone: 'SOC 2 Type II certification achieved' },
];

const projections = [
  { year: '2024', arr: '$2.4M', margin: '81%', headcount: '34' },
  { year: '2025', arr: '$6.1M', margin: '83%', headcount: '58' },
  { year: '2026', arr: '$13.8M', margin: '85%', headcount: '92' },
];

const team = [
  { name: 'Maria Ellison', role: 'CEO & Co-Founder', bg: 'Former VP Product, network security startup (acquired 2021)' },
  { name: 'Devon Okafor', role: 'CTO & Co-Founder', bg: 'Ex-senior engineer, WireGuard contributor community' },
  { name: 'Priya Nandakumar', role: 'Head of Sales', bg: '12 years B2B SaaS sales leadership' },
  { name: 'James Alcott', role: 'Head of Compliance', bg: 'Former GDPR compliance consultant, EU regulatory advisory' },
];

const fundsUse = [
  { pct: '45%', label: 'Sales & Marketing', desc: 'Outbound team, MSP channel growth', color: 'bg-cyan-500' },
  { pct: '30%', label: 'Product Engineering', desc: 'Zero-trust access GA, mobile app parity, additional edge PoPs', color: 'bg-violet-500' },
  { pct: '15%', label: 'Compliance Certifications', desc: 'ISO 27001, HIPAA attestation', color: 'bg-emerald-500' },
  { pct: '10%', label: 'Working Capital', desc: 'Operational buffer', color: 'bg-amber-500' },
];

export default function PitchDeck() {
  return (
    <div className="min-h-screen bg-[#060910] text-white">
      {/* Nav */}
      <div className="border-b border-white/5 px-6 py-4 flex items-center gap-4">
        <Link to="/" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">← Back to VoxVPN</Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 space-y-24">

        {/* Hero */}
        <section className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-cyan-400 border border-cyan-400/30 bg-cyan-400/5">
            Series A · $6M Raise
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            VoxVPN<span className="text-cyan-400">/</span>Shield
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Enterprise-Grade Privacy & Threat Protection — the unified VPN, threat-prevention, and data-privacy platform built for modern distributed businesses.
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <Link to="/business" className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm transition-colors flex items-center gap-2">
              Get Started <ArrowRight size={16} />
            </Link>
            <a href="mailto:info@voxdigits.com" className="px-6 py-3 rounded-xl border border-white/15 hover:border-cyan-400/40 text-slate-300 font-semibold text-sm transition-colors">
              Contact Us
            </a>
          </div>
        </section>

        {/* Executive Summary Stats */}
        <section>
          <h2 className="text-2xl font-bold mb-8 text-center">Executive Summary</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {stats.map(({ label, value }) => (
              <div key={label} className="p-5 rounded-2xl border border-white/8 bg-white/3 text-center">
                <p className="text-2xl font-black text-cyan-400">{value}</p>
                <p className="text-slate-500 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 p-5 rounded-2xl border border-white/8 bg-white/3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs text-slate-500">
            <div><span className="block text-white font-semibold">2022</span>Founded</div>
            <div><span className="block text-white font-semibold">Austin, TX</span>Remote-first · 34 employees</div>
            <div><span className="block text-white font-semibold">Series A</span>Stage</div>
            <div><span className="block text-white font-semibold">$6,000,000</span>Ask</div>
          </div>
        </section>

        {/* The Problem */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <AlertTriangle size={20} className="text-amber-400" />
            <h2 className="text-2xl font-bold">The Problem</h2>
          </div>
          <p className="text-slate-400 mb-6">Businesses today operate across a fragmented, high-risk digital perimeter, and existing solutions fail to keep pace.</p>
          <div className="space-y-4">
            {problems.map((p, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl border border-white/6 bg-white/2">
                <span className="text-amber-400 font-black text-lg leading-none mt-0.5">{i + 1}</span>
                <div>
                  <p className="font-semibold text-white text-sm">{p.title}</p>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Cost of Inaction */}
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4 text-slate-300">Cost of Inaction</h3>
            <div className="overflow-x-auto rounded-xl border border-white/8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">Risk Factor</th>
                    <th className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">Average Business Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    ['Data breach (SMB, <500 employees)', '$3.31M average total cost'],
                    ['Ransomware downtime', '21 days average recovery time'],
                    ['Non-compliance penalty (GDPR)', 'Up to 4% of global annual revenue'],
                    ['Lost productivity from VPN latency', '12% reported employee time loss'],
                  ].map(([risk, impact]) => (
                    <tr key={risk}>
                      <td className="px-4 py-3 text-slate-300 text-xs">{risk}</td>
                      <td className="px-4 py-3 text-red-400 font-semibold text-xs">{impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Our Solution */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Shield size={20} className="text-cyan-400" />
            <h2 className="text-2xl font-bold">Our Solution</h2>
          </div>
          <p className="text-slate-400 mb-8">VoxVPN/Shield unifies three previously siloed categories — VPN, threat/DNS filtering, and privacy compliance tooling — into one lightweight client and centralized admin console.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {pillars.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-5 rounded-2xl border border-white/8 bg-white/2">
                <Icon size={20} className="text-cyan-400 mb-3" />
                <p className="font-bold text-sm mb-2">{title}</p>
                <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Market Opportunity */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Globe size={20} className="text-violet-400" />
            <h2 className="text-2xl font-bold">Market Opportunity</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'TAM', value: '$54.2B', sub: 'Global business VPN + network security by 2027' },
              { label: 'SAM', value: '$9.8B', sub: 'SMB & mid-market security spend, English-speaking markets' },
              { label: 'SOM', value: '$180M', sub: '3-year realistic capture based on current sales velocity' },
            ].map(({ label, value, sub }) => (
              <div key={label} className="p-5 rounded-2xl border border-violet-400/20 bg-violet-400/5 text-center">
                <p className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-3xl font-black text-white">{value}</p>
                <p className="text-slate-500 text-[11px] mt-2 leading-relaxed">{sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Business Model */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <DollarSign size={20} className="text-emerald-400" />
            <h2 className="text-2xl font-bold">Business Model</h2>
          </div>
          <div className="overflow-x-auto rounded-xl border border-white/8 mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  {['Plan', 'Price / seat / mo', 'Target Segment', 'Includes'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pricingTiers.map(({ plan, price, segment, includes }) => (
                  <tr key={plan}>
                    <td className="px-4 py-3 text-white font-semibold text-xs">{plan}</td>
                    <td className="px-4 py-3 text-cyan-400 font-bold text-sm">{price}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{segment}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{includes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            {[
              { label: 'LTV:CAC Ratio', value: '7.6:1' },
              { label: 'Payback Period', value: '5.4 months' },
              { label: 'Monthly Churn', value: '1.3%' },
            ].map(({ label, value }) => (
              <div key={label} className="p-4 rounded-xl border border-white/8 bg-white/2 text-center">
                <p className="text-xl font-black text-emerald-400">{value}</p>
                <p className="text-slate-500 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Traction */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp size={20} className="text-emerald-400" />
            <h2 className="text-2xl font-bold">Traction & Milestones</h2>
          </div>
          <div className="overflow-x-auto rounded-xl border border-white/8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  {['Quarter', 'ARR', 'Customers', 'Notable Milestone'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {traction.map(({ quarter, arr, customers, milestone }) => (
                  <tr key={quarter}>
                    <td className="px-4 py-3 text-slate-400 text-xs">{quarter}</td>
                    <td className="px-4 py-3 text-cyan-400 font-bold text-sm">{arr}</td>
                    <td className="px-4 py-3 text-white font-semibold text-xs">{customers}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{milestone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Financial Projections */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <BarChart2 size={20} className="text-cyan-400" />
            <h2 className="text-2xl font-bold">Financial Projections</h2>
          </div>
          <div className="overflow-x-auto rounded-xl border border-white/8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  {['Year', 'ARR Projection', 'Gross Margin', 'Headcount'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {projections.map(({ year, arr, margin, headcount }) => (
                  <tr key={year}>
                    <td className="px-4 py-3 text-slate-400 text-xs">{year}</td>
                    <td className="px-4 py-3 text-cyan-400 font-black text-lg">{arr}</td>
                    <td className="px-4 py-3 text-emerald-400 font-semibold text-xs">{margin}</td>
                    <td className="px-4 py-3 text-white text-xs">{headcount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Team */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Users size={20} className="text-cyan-400" />
            <h2 className="text-2xl font-bold">Team</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {team.map(({ name, role, bg }) => (
              <div key={name} className="p-5 rounded-2xl border border-white/8 bg-white/2 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center text-cyan-400 font-black text-lg flex-shrink-0">
                  {name[0]}
                </div>
                <div>
                  <p className="font-bold text-sm">{name}</p>
                  <p className="text-cyan-400 text-xs font-semibold mt-0.5">{role}</p>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">{bg}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* The Ask */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Target size={20} className="text-amber-400" />
            <h2 className="text-2xl font-bold">The Ask</h2>
          </div>
          <div className="p-8 rounded-2xl border border-amber-400/20 bg-amber-400/5 text-center mb-8">
            <p className="text-5xl font-black text-amber-400">$6,000,000</p>
            <p className="text-slate-400 mt-2 text-sm">Series A Funding Round</p>
          </div>
          <div className="space-y-3">
            {fundsUse.map(({ pct, label, desc, color }) => (
              <div key={label} className="flex items-center gap-4 p-4 rounded-xl border border-white/6 bg-white/2">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-black font-black text-sm flex-shrink-0`}>{pct}</div>
                <div>
                  <p className="font-semibold text-sm">{label}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center space-y-6 py-12 border-t border-white/8">
          <h2 className="text-3xl font-black">Ready to invest in the future of enterprise security?</h2>
          <p className="text-slate-400 max-w-xl mx-auto">We welcome the opportunity to schedule a live product walkthrough and deeper financial diligence session at your convenience.</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a href="mailto:info@voxdigits.com" className="px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-colors flex items-center gap-2">
              Contact Us <ArrowRight size={16} />
            </a>
            <Link to="/business" className="px-8 py-3 rounded-xl border border-white/15 hover:border-cyan-400/40 text-slate-300 font-semibold transition-colors">
              Try VoxShield
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}