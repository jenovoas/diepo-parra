
import { Navbar } from "@/components/sections/Navbar";
import { AnimatedBackground } from "@/components/sections/AnimatedBackground";
import { HeroSlider } from "@/components/sections/HeroSlider";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { MedicalInfoSection } from "@/components/sections/MedicalInfoSection";
import { ContactSection } from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-transparent relative">
      <AnimatedBackground />

      {/* Hero Section */}
      <HeroSlider />

      {/* Services Section */}
      <ServicesSection />

      {/* About Section */}
      <AboutSection />

      {/* Medical Info Section */}
      <MedicalInfoSection />

      {/* Contact Section */}
      <ContactSection />
    </div>
  );
}
