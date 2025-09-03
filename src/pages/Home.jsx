import { useEffect, useState } from "react";
import { ThemeToggle } from "../components/ThemeToggle";
import { AuroraBackground } from "../components/AuroraBackground";
import { Navbar } from "../components/Navbar";
import { HeroSection } from "../components/HeroSection";
import { LastRunSection } from "../components/LastRunSection";
import { GraphicsSection } from "../components/GraphicsSection";
import { PersonalBestSection } from "../components/PersonalBestSection";
import { ContactSection } from "../components/ContactSection";
import { Footer } from "../components/Footer";

export const Home = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
      const observer = new MutationObserver(() => {
        setIsDarkMode(document.documentElement.classList.contains("dark"));
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      setIsDarkMode(document.documentElement.classList.contains("dark"));
      return () => observer.disconnect();
    }, []);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">

    {/* Aurora background with orange tone */}
    <AuroraBackground className="!bg-transparent pointer-events-none filter hue-rotate-[210deg] saturate-150" />

    <div className="relative z-10">
        <ThemeToggle />
        <Navbar />
        <main>
          <HeroSection />
          <LastRunSection/>
          <PersonalBestSection />
          <GraphicsSection />

          <ContactSection />
        </main>
        <Footer />
    </div>
    </div>
  );
};
