import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';

export default function CookiePolicy() {
  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />
      <div className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <h1 className="text-4xl font-black text-white mb-2">Cookie Policy</h1>
        <p className="text-slate-500 text-sm mb-10">Last updated: January 1, 2024</p>
        <div className="space-y-8 text-slate-400 text-sm leading-relaxed">
          {[
            { title: 'What Are Cookies?', content: 'Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and provide a better browsing experience.' },
            { title: 'Cookies We Use', content: 'VoxVPN uses only essential cookies required for the website to function: session cookies (to keep you logged in), authentication tokens (to remember your login status), and CSRF tokens (to protect against cross-site attacks). We do NOT use advertising, tracking, or third-party analytics cookies.' },
            { title: 'Strictly Necessary Cookies', content: 'These cookies are essential for the website to work and cannot be disabled. They do not store personally identifiable information and are deleted when you close your browser or log out.' },
            { title: 'How to Control Cookies', content: 'You can control cookies through your browser settings. Disabling essential cookies may affect website functionality. Refer to your browser\'s help documentation for instructions on managing cookies.' },
            { title: 'Contact', content: 'For cookie-related questions: privacy@voxvpn.net' },
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