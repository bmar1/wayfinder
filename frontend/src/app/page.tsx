import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { Modernize } from "@/components/landing/Modernize";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { WhyWayfinder } from "@/components/landing/WhyWayfinder";
import { Faq } from "@/components/landing/Faq";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <Modernize />
        <HowItWorks />
        <WhyWayfinder />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
