import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-slate-950/95 backdrop-blur-sm z-50 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <img src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/60e9935e0_b1efe46e-2927-4692-89eb-53a6f756c8a6.png" alt="VoxVPN" className="h-10 w-auto" />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
            <a href="#servers" className="text-slate-300 hover:text-white transition-colors">Servers</a>
            <a href="#pricing" className="text-slate-300 hover:text-white transition-colors">Pricing</a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors">Admin</a>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <button className="text-slate-300 hover:text-white transition-colors">Log In</button>
            <button className="px-6 py-2 bg-cyan-500 text-slate-950 font-semibold rounded-full hover:bg-cyan-400 transition-colors">
              Get Protected
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-slate-800 space-y-3 pt-4">
            <a href="#features" className="block text-slate-300 hover:text-white transition-colors">Features</a>
            <a href="#servers" className="block text-slate-300 hover:text-white transition-colors">Servers</a>
            <a href="#pricing" className="block text-slate-300 hover:text-white transition-colors">Pricing</a>
            <button className="w-full px-4 py-2 bg-cyan-500 text-slate-950 font-semibold rounded-lg hover:bg-cyan-400 transition-colors">
              Get Protected
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}