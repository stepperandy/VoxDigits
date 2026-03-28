import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Stats from '@/components/landing/Stats';
import Features from '@/components/landing/Features';
import Servers from '@/components/landing/Servers';
import Pricing from '@/components/landing/Pricing';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <div className="bg-slate-950">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <Servers />
      <Pricing />
      <Footer />
    </div>
  );
}