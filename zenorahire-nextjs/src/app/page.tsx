import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import LogoBar from "@/components/sections/LogoBar";
import Services from "@/components/sections/Services";
import HowItWorks from "@/components/sections/HowItWorks";
import Industries from "@/components/sections/Industries";
import RolesWeClose from "@/components/sections/RolesWeClose";
import Testimonials from "@/components/sections/Testimonials";
import CTA from "@/components/sections/CTA";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <LogoBar />
      <Services />
      <HowItWorks />
      <Industries />
      <div id="roles">
        <RolesWeClose />
      </div>
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
