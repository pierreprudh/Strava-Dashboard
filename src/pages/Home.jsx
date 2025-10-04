import { useEffect, useState } from "react";
import { ThemeToggle } from "../components/ThemeToggle";
import { Navbar } from "../components/Navbar";
import { HeroSection } from "../components/HeroSection";
import { LastRunSection } from "../components/LastRunSection";
import { PersonalBestSection } from "../components/PersonalBestSection";
import { HighlightsSection } from "../components/HighlightsSection";
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



    <div className="relative z-10">
        <Navbar />
        {/* Left Dock (Apple-like icon bar) */}

        <main className="space-y-0">
          <div className="scroll-mt-24">
            <HeroSection />
          </div>
          <div className="scroll-mt-24">
            <LastRunSection />
          </div>
          <div className="scroll-mt-24">
            <PersonalBestSection />
          </div>
          <div className="scroll-mt-24">
            <HighlightsSection />
          </div>
        </main>
        <Footer />
    </div>
    {/* Keep theme switch above the blur */}
    <ThemeToggle />
    </div>
  );
};
