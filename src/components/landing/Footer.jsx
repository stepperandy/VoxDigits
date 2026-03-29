import { Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <img src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/60e9935e0_b1efe46e-2927-4692-89eb-53a6f756c8a6.png" alt="VoxVPN" className="h-12 w-auto" />
            </div>
            <p className="text-slate-400 text-sm">
              Your privacy is our priority. Stay protected, stay unrestricted.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-violet-400 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">Servers</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">Downloads</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-violet-400 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">Terms</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-violet-400" />
                <a href="mailto:support@voxvpn.net" className="hover:text-violet-400 transition-colors">
                  support@voxvpn.net
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-violet-400" />
                <span>+1 (555) 123-4567</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-400 text-sm">
            <p>&copy; 2024 VoxVPN. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-violet-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-violet-400 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}