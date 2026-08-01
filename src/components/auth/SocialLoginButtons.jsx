import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#ffffff" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#ffffff" aria-hidden="true">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <rect x="2" y="2" width="9.5" height="9.5" fill="#F25022"/>
    <rect x="12.5" y="2" width="9.5" height="9.5" fill="#7FBA00"/>
    <rect x="2" y="12.5" width="9.5" height="9.5" fill="#00A4EF"/>
    <rect x="12.5" y="12.5" width="9.5" height="9.5" fill="#FFB900"/>
  </svg>
);

const PROVIDERS = [
  { id: 'facebook',  label: 'Facebook',  Icon: FacebookIcon,  bg: 'bg-[#2d63e8] hover:bg-[#2455c7] text-white',   ring: 'ring-white/20' },
  { id: 'apple',     label: 'Apple',     Icon: AppleIcon,     bg: 'bg-black hover:bg-neutral-900 text-white border border-white/15', ring: 'ring-white/20' },
  { id: 'microsoft', label: 'Microsoft', Icon: MicrosoftIcon, bg: 'bg-[#3b82f6] hover:bg-[#2563eb] text-white',   ring: 'ring-white/20' },
];

export default function SocialLoginButtons({ redirectUrl = '/dashboard' }) {
  const [loadingProvider, setLoadingProvider] = useState(null);
  const [error, setError] = useState('');

  const handleSocialLogin = async (providerId) => {
    setLoadingProvider(providerId);
    setError('');
    try {
      await base44.auth.loginWithProvider(providerId, redirectUrl);
    } catch (err) {
      setError(`${providerId} sign-in failed. Please try again.`);
      setLoadingProvider(null);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-center text-red-400 text-xs">{error}</p>
      )}
      {PROVIDERS.map(({ id, label, Icon, bg, ring }) => (
        <button
          key={id}
          onClick={() => handleSocialLogin(id)}
          disabled={loadingProvider !== null}
          className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed ${bg} ring-1 ${ring}`}
        >
          {loadingProvider === id ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Icon />
          )}
          Continue with {label}
        </button>
      ))}
    </div>
  );
}