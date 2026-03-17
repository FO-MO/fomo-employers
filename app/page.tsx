import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import Features from "@/components/landing/Features";
import ForCompanies from "@/components/landing/ForCompanies";
import SocialProof from "@/components/landing/SocialProof";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <Features />
      <ForCompanies />
      <SocialProof />
      <CTASection />
      <Footer />
    </div>
  );
}
