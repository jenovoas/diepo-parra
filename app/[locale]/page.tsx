
import { HeroSlider } from "@/components/sections/HeroSlider";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { AboutSection } from "@/components/sections/AboutSection";

import { ContactSection } from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-transparent relative">

      {/* Hero Section */}
      <HeroSlider />

      {/* Services Section */}
      <ServicesSection />

      {/* About Section */}
      <AboutSection />



      {/* Contact Section */}
      <ContactSection />
    </div>
  );
}
