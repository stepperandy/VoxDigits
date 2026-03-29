import { Mail, Phone } from 'lucide-react';

const footerSections = [
  {
    title: 'VPN for Countries',
    links: ['VPN for USA', 'VPN for UK', 'VPN for Canada', 'VPN for Australia', 'VPN for Germany', 'VPN for France', 'VPN for Japan'],
  },
  {
    title: 'VPN Download by OS',
    links: ['Windows VPN', 'Mac VPN', 'Linux VPN', 'iOS VPN', 'Android VPN', 'Router VPN', 'Chrome Extension'],
  },
  {
    title: 'Features',
    links: ['No-Logs Policy', 'Kill Switch', 'Split Tunneling', 'AES-256 Encryption', 'DNS Leak Protection', 'IPv6 Leak Protection'],
  },
  {
    title: 'Solutions',
    links: ['VPN for Streaming', 'VPN for Gaming', 'VPN for Torrenting', 'VPN for Business', 'VPN for Travel'],
  },
  {
    title: 'About VPN',
    links: ['What is a VPN?', 'How VPN Works', 'VPN Protocols', 'WireGuard VPN', 'OpenVPN'],
  },
  {
    title: 'Payment',
    links: ['Credit Card', 'PayPal', 'Crypto', 'Bank Transfer'],
  },
  {
    title: 'Get Help',
    links: ['Support Center', 'Live Chat', 'Contact Us', 'Status Page', 'Bug Bounty'],
  },
  {
    title: 'Legal Offers',
    links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Refund Policy'],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#060910] border-t border-white/5 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Top: logo + columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <img
              src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/60e9935e0_b1efe46e-2927-4692-89eb-53a6f756c8a6.png"
              alt="VoxVPN"
              className="h-10 w-auto mb-4"
            />
            <p className="text-slate-500 text-xs leading-relaxed mb-4">
              Your privacy is our priority. Stay protected, stay unrestricted.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <Mail size={13} className="text-cyan-500" />
                <a href="mailto:support@voxvpn.net" className="hover:text-cyan-400 transition-colors">support@voxvpn.net</a>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <Phone size={13} className="text-cyan-500" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>

          {/* Footer link columns */}
          {footerSections.slice(0, 4).map((section) => (
            <div key={section.title}>
              <h4 className="text-white text-xs font-bold mb-4 uppercase tracking-wider">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-slate-500 text-xs hover:text-cyan-400 transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Second row of columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12 lg:ml-[20%]">
          {footerSections.slice(4).map((section) => (
            <div key={section.title}>
              <h4 className="text-white text-xs font-bold mb-4 uppercase tracking-wider">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-slate-500 text-xs hover:text-cyan-400 transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* App store badges */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-2 px-4 py-2 bg-[#0d1120] border border-white/10 rounded-lg hover:border-cyan-500/30 transition-colors">
              <span className="text-lg">🍎</span>
              <div>
                <div className="text-slate-500 text-[9px]">Download on the</div>
                <div className="text-white text-xs font-semibold">App Store</div>
              </div>
            </a>
            <a href="#" className="flex items-center gap-2 px-4 py-2 bg-[#0d1120] border border-white/10 rounded-lg hover:border-cyan-500/30 transition-colors">
              <span className="text-lg">🤖</span>
              <div>
                <div className="text-slate-500 text-[9px]">Get it on</div>
                <div className="text-white text-xs font-semibold">Google Play</div>
              </div>
            </a>
          </div>

          {/* Payment icons */}
          <div className="flex items-center gap-2">
            {['VISA', 'MC', 'AMEX', 'PayPal', 'BTC'].map((p) => (
              <span key={p} className="px-2 py-1 bg-[#0d1120] border border-white/10 rounded text-xs text-slate-400 font-medium">{p}</span>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 text-center text-slate-600 text-xs flex flex-col sm:flex-row justify-between">
          <span>© 2024 VoxVPN. All rights reserved.</span>
          <div className="flex gap-4 justify-center mt-2 sm:mt-0">
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}