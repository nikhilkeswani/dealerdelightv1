import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import InstantPreviewSection from "@/components/InstantPreviewSection";
import ProblemsSection from "@/components/ProblemsSection";
import ResultsSection from "@/components/ResultsSection";
import PlatformDemo from "@/components/PlatformDemo";
import CTASection from "@/components/CTASection";
import TestimonialsSection from "@/components/TestimonialsSection";
import TemplatesSection from "@/components/TemplatesSection";
import PricingSection from "@/components/PricingSection";
import SignupSection from "@/components/SignupSection";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import BackToTop from "@/components/BackToTop";

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <MobileNav />
      <BackToTop />
      <HeroSection />
      <HowItWorksSection />
      <InstantPreviewSection />
      <ProblemsSection />
      <ResultsSection />
      <PlatformDemo />
      <CTASection />
      <TestimonialsSection />
      <TemplatesSection />
      <PricingSection />
      <SignupSection />
      <Footer />
    </div>
  );
}
