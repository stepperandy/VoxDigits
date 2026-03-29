import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';

export default function RefundPolicy() {
  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />
      <div className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <h1 className="text-4xl font-black text-white mb-2">Refund Policy</h1>
        <p className="text-slate-500 text-sm mb-10">Last updated: January 1, 2024</p>
        <div className="space-y-8 text-slate-400 text-sm leading-relaxed">
          {[
            { title: '30-Day Money-Back Guarantee', content: 'VoxVPN offers a 30-day money-back guarantee for all new subscriptions. If you\'re not satisfied with our service for any reason within the first 30 days, contact us for a full refund — no questions asked.' },
            { title: 'How to Request a Refund', content: 'To request a refund: email support@voxvpn.net with the subject line "Refund Request", include your registered email address and reason for the refund. We will process eligible refunds within 5-10 business days.' },
            { title: 'Eligibility', content: 'Refunds are available for: new subscriptions within 30 days of purchase, and annual plan purchasers within 30 days. Refunds are not available for: accounts that have violated our Terms of Service, renewals after the 30-day period, or accounts suspended for abuse.' },
            { title: 'Renewal Cancellations', content: 'You can cancel your subscription at any time from your account dashboard. Cancellations take effect at the end of your current billing period. We do not offer prorated refunds for cancellations mid-period.' },
            { title: 'Contact', content: 'For refund requests: support@voxvpn.net' },
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