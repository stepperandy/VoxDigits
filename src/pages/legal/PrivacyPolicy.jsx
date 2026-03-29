import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';

export default function PrivacyPolicy() {
  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />
      <div className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <h1 className="text-4xl font-black text-white mb-2">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-10">Last updated: January 1, 2024</p>
        <div className="space-y-8 text-slate-400 text-sm leading-relaxed">
          {[
            { title: '1. Information We Collect', content: 'VoxVPN collects only the minimal information necessary to provide our service. This includes your email address for account creation, payment information processed by our third-party payment provider, and anonymous aggregate usage statistics. We do NOT collect your browsing history, IP addresses, DNS queries, or any personally identifiable data related to your VPN usage.' },
            { title: '2. No-Logs Policy', content: 'VoxVPN maintains a strict no-logs policy. We do not record, store, or share: your browsing activity, connection timestamps, session durations, DNS queries, originating IP addresses, or data content. This policy has been independently audited by third-party security firms.' },
            { title: '3. Data We Store', content: 'We store only: your email address and hashed password, subscription and payment records (payment details handled by Stripe), and customer support communications you initiate. This data is stored securely and encrypted at rest.' },
            { title: '4. How We Use Your Data', content: 'We use your data exclusively to: provide and improve our VPN service, process payments and manage subscriptions, send important service updates and security notices, and respond to customer support requests.' },
            { title: '5. Third-Party Services', content: 'We use Stripe for payment processing and Vultr for server infrastructure. These providers have their own privacy policies. We share no personally identifiable VPN usage data with any third parties.' },
            { title: '6. Your Rights', content: 'You have the right to access your personal data, request deletion of your account and data, opt out of marketing communications, and request a copy of your data in a portable format. Contact us at privacy@voxvpn.net to exercise these rights.' },
            { title: '7. Contact', content: 'For privacy inquiries: privacy@voxvpn.net' },
          ].map(({ title, content }) => (
            <div key={title}>
              <h2 className="text-white font-bold text-base mb-3">{title}</h2>
              <p>{content}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}