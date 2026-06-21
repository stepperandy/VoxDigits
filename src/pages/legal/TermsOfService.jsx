import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';
import { FileText, Mail, Globe } from 'lucide-react';

const sections = [
  {
    title: '1. Eligibility',
    text: 'Users must be at least 18 years old or have authorization from a parent or legal guardian.',
  },
  {
    title: '2. Service Description',
    text: 'VoxVPN provides VPN services designed to enhance privacy and security while using the internet.',
  },
  {
    title: '3. User Responsibilities',
    text: 'Users agree not to:',
    list: [
      'Violate applicable laws',
      'Distribute malware',
      'Conduct fraudulent activity',
      'Attempt unauthorized access to systems',
      'Abuse network resources',
    ],
  },
  {
    title: '4. Subscriptions',
    text: 'Paid subscriptions provide access to premium features and VPN servers. Subscription fees are billed according to the selected plan.',
  },
  {
    title: '5. Refunds',
    text: "Refund requests are reviewed according to VoxVPN's refund policy and applicable law.",
  },
  {
    title: '6. Service Availability',
    text: 'We strive to maintain service availability but do not guarantee uninterrupted operation.',
  },
  {
    title: '7. Limitation of Liability',
    text: 'VoxVPN is provided on an "as is" basis. To the maximum extent permitted by law, VoxDigits Communications LLC shall not be liable for indirect, incidental, or consequential damages arising from service use.',
  },
  {
    title: '8. Termination',
    text: 'We may suspend or terminate accounts that violate these Terms.',
  },
  {
    title: '9. Modifications',
    text: 'We may update these Terms at any time. Continued use of the service constitutes acceptance of updated terms.',
  },
];

export default function TermsOfService() {
  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
              style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
              <FileText size={28} className="text-cyan-400" />
            </div>
            <h1 className="text-white text-3xl sm:text-4xl font-black tracking-tight mb-3">VoxVPN Terms of Service</h1>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
              style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
              <FileText size={13} className="text-cyan-400" />
              <span className="text-cyan-400 text-xs font-semibold">Effective Date: June 21, 2026</span>
            </div>
          </div>

          {/* Intro */}
          <div className="rounded-2xl p-6 mb-8"
            style={{ background: 'linear-gradient(135deg, #0d1120, #060c1a)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-slate-300 text-sm leading-relaxed">
              By accessing or using VoxVPN, you agree to these Terms of Service.
            </p>
          </div>

          {/* Sections */}
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

          {/* Contact section */}
          <div className="rounded-2xl p-8 mt-8 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,212,255,0.02))', border: '1px solid rgba(0,212,255,0.2)' }}>
            <h2 className="text-white text-lg font-bold mb-2">10. Contact</h2>
            <p className="text-slate-300 text-sm font-semibold mb-4">VoxDigits Communications LLC</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
        </div>
      </div>
      <Footer />
    </div>
  );
}