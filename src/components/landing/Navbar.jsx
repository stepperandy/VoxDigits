import { Menu, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Servers', href: '#servers' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'VPN for Business', href: '#' },
  { label: 'Help', href: '#' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50">
      {/* Announcement bar */}
      <div className="bg-cyan-500/20 border-b border-cyan-500/30 py-2 px-4 text-center text-xs text-cyan-300">
        ⚡ Limited offer: Get VoxVPN Premium for 50% off — Today only!{' '}
        <a href="#pricing" className="underline font-semibold text-cyan-400 hover:text-cyan-300">Grab the deal</a>
      </div>

      {/* Main nav */}
      <nav className="bg-[#0a0e1a]/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <img
                src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/60e9935e0_b1efe46e-2927-4692-89eb-53a6f756c8a6.png"
                alt="VoxVPN"
                className="h-8 w-auto"
              />
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-slate-300 hover:text-white text-sm transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-3">
              <button className="text-slate-300 hover:text-white text-sm transition-colors">Log In</button>
              <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-bold rounded transition-all">
                Get Protected
              </button>
            </div>

            {/* Mobile toggle */}
            <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileOpen && (
            <div className="md:hidden pb-4 space-y-3 pt-2 border-t border-white/10">
              {navLinks.map((link) => (
                <a key={link.label} href={link.href} className="block text-slate-300 hover:text-white text-sm transition-colors">
                  {link.label}
                </a>
              ))}
              <button className="w-full py-2 bg-cyan-500 text-black text-sm font-bold rounded">Get Protected</button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}