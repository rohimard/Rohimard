import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/home/Hero";
import { ProductLines } from "@/components/home/ProductLines";
import { WhyUs } from "@/components/home/WhyUs";
import { DigitalExperience } from "@/components/home/DigitalExperience";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Testimonials } from "@/components/home/Testimonials";
import { CtaSection } from "@/components/home/CtaSection";

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />

      <main className="flex-1">
        <Hero />
        <ProductLines />
        <WhyUs />
        <DigitalExperience />
        <HowItWorks />
        <Testimonials />
        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}
