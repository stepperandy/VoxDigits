import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';
import { FileText, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

const sections = [
  {
    title: '1. Acceptable Use Overview',
    text: 'This Acceptable Use Policy ("AUP") governs the use of VoxVPN services provided by VoxTelefony Communications LLC. By using VoxVPN, you agree to comply with this policy. Violations may result in service suspension or account termination.',
  },
  {
    title: '2. Permitted Use',
    text: 'VoxVPN is designed for privacy protection, security enhancement, and legitimate internet access. You may use VoxVPN to:',
    list: [
      'Protect your online privacy and encrypt your internet traffic',
      'Access geo-restricted content in regions where VPN use is legal',
      'Secure your connection on public Wi-Fi networks',
      'Prevent ISP tracking and bandwidth throttling',
      'Conduct legitimate business, research, and personal activities',
    ],
  },
  {
    title: '3. Prohibited Activities',
    text: 'You agree NOT to use VoxVPN for any of the following:',
    list: [
      'Illegal activities under applicable local, national, or international law',
      'Distributing malware, ransomware, spyware, or other malicious software',
      'Sending unsolicited bulk email (spam) or conducting phishing campaigns',
      'Launching DDoS attacks or participating in botnet activity',
      'Hacking, brute-forcing, or attempting unauthorized access to any system',
      'Distributing child exploitation material of any kind',
      'Money laundering, terrorist financing, or other financial crimes',
      'Copyright infringement or large-scale piracy operations',
      'Harassment, stalking, or threatening behavior',
      'Attempting to circumvent VoxVPN security measures or infrastructure',
    ],
  },
  {
    title: '4. Network Integrity',
    text: 'You agree not to abuse VoxVPN network resources, including:',
    list: [
      'Running automated scripts that consume excessive bandwidth',
      'Reselling or sharing VPN credentials with unauthorized users',
      'Using VoxVPN to proxy traffic for third parties on a commercial basis',
      'Interfering with other users\' service or VoxVPN infrastructure',
    ],
  },
  {
    title: '5. Law Enforcement Cooperation',
    text: 'VoxVPN operates under a strict no-logs policy. We do not store browsing history, DNS queries, or connection data. However, we will comply with valid legal requests for account information (such as email and billing details) where legally required. We do not provide data we do not have.',
  },
  {
    title: '6. Enforcement',
    text: 'VoxVPN reserves the right to investigate suspected violations and take action including warnings, service throttling, temporary suspension, or permanent account termination. Serious violations may be reported to law enforcement authorities.',
  },
  {
    title: '7. Reporting Abuse',
    text: 'To report abuse, spam, or malicious activity originating from VoxVPN IPs, contact abuse@voxvpn.net. Include relevant logs, timestamps, and the IP address in question. We investigate all credible reports within 24 hours.',
  },
  {
    title: '8. Changes to This Policy',
    text: 'We may update this Acceptable Use Policy from time to time. Continued use of VoxVPN after changes constitutes acceptance of the updated policy.',
  },
];

export default function AcceptableUsePolicy() {
  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
              style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
              <ShieldCheck size={28} className="text-cyan-400" />
            </div>
            <h1 className="text-white text-3xl sm:text-4xl font-black tracking-tight mb-3">Acceptable Use Policy</h1>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
              style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
              <FileText size={13} className="text-cyan-400" />
              <span className="text-cyan-400 text-xs font-semibold">Effective Date: July 7, 2026</span>
            </div>
          </div>

          <div className="rounded-2xl p-6 mb-8"
            style={{ background: 'linear-gradient(135deg, #0d1120, #060c1a)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-slate-300 text-sm leading-relaxed">
              VoxVPN ("VoxVPN", "we", "our") provides VPN services designed to protect user privacy and security. This Acceptable Use Policy outlines what users may and may not do while using our service. By using VoxVPN, you acknowledge that you have read and agree to this policy.
            </p>
          </div>

          <div className="space-y-6">
            {sections.map((section, i) => (
              <div key={i} className="rounded-2xl p-6"
                style={{ background: 'linear-gradient(135deg, #0d1120, #060c1a)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 className="text-white text-lg font-bold mb-4">{section.title}</h2>
                {section.text && <p className="text-slate-400 text-sm leading-relaxed mb-4">{section.text}</p>}
                {section.list && (
                  <ul className="space-y-1.5">
                    {section.list.map((item, k) => (
                      <li key={k} className="flex items-start gap-2 text-slate-400 text-sm">
                        <span className="text-cyan-400 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-8 mt-8 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,212,255,0.02))', border: '1px solid rgba(0,212,255,0.2)' }}>
            <h2 className="text-white text-lg font-bold mb-2">Contact</h2>
            <p className="text-slate-300 text-sm font-semibold mb-4">VoxTelefony Communications LLC</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="mailto:abuse@voxvpn.net" className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors">abuse@voxvpn.net</a>
              <a href="mailto:admin@voxdigits.com" className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors">admin@voxdigits.com</a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}