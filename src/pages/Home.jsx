import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "../components/ThemeToggle";
import { AuroraBackground } from "../components/AuroraBackground";
import { Navbar } from "../components/Navbar";
import { HeroSection } from "../components/HeroSection";
import ScrollAnimation from "../components/ScrollAnimation";
import { LastRunSection } from "../components/LastRunSection";
import { GraphicsSection } from "../components/GraphicsSection";
import { PersonalBestSection } from "../components/PersonalBestSection";
import { ContactSection } from "../components/ContactSection";
import { Footer } from "../components/Footer";


export const Home = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const heroRef = useRef(null);
    const lastRunRef = useRef(null);
    const pbRef = useRef(null);
    const graphicsRef = useRef(null);
    const contactRef = useRef(null);
    const [activeSection, setActiveSection] = useState("hero");

    useEffect(() => {
      const observer = new MutationObserver(() => {
        setIsDarkMode(document.documentElement.classList.contains("dark"));
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      setIsDarkMode(document.documentElement.classList.contains("dark"));
      return () => observer.disconnect();
    }, []);

  useEffect(() => {
    const sections = [
      { id: "hero", el: heroRef.current },
      { id: "last", el: lastRunRef.current },
      { id: "pb", el: pbRef.current },
      { id: "graph", el: graphicsRef.current },
      { id: "contact", el: contactRef.current },
    ].filter(s => s.el);

    if (!sections.length) return;

    const io = new IntersectionObserver((entries) => {
      // Pick the entry most in view
      const best = entries
        .filter(e => e.isIntersecting)
        .sort((a,b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];
      if (!best) return;
      const match = sections.find(s => s.el === best.target);
      if (match) setActiveSection(match.id);
    }, { root: null, threshold: [0.25, 0.5, 0.75] });

    sections.forEach(s => io.observe(s.el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">

    <AuroraBackground className="!bg-transparent pointer-events-none filter hue-rotate-[210deg] saturate-150" />

    <div className="relative z-10">
        <Navbar />
        {/* Left Dock (Apple-like icon bar) */}

        <main>
          <section id="hero" ref={heroRef} className="scroll-mt-24">
            <HeroSection />
          </section>
          <section className="scroll-mt-24">
            <ScrollAnimation />
          </section>
          <section id="last" ref={lastRunRef} className="scroll-mt-24">
            <LastRunSection />
          </section>
          <section id="pb" ref={pbRef} className="scroll-mt-24">
            <PersonalBestSection />
          </section>
          <section id="graph" ref={graphicsRef} className="scroll-mt-24">
            <GraphicsSection />
          </section>
          <section id="contact" ref={contactRef} className="scroll-mt-24">
            <ContactSection />
          </section>
        </main>
        <Footer />
    </div>
    {/* Keep theme switch above the blur */}
    <ThemeToggle />
    </div>
  );
};
