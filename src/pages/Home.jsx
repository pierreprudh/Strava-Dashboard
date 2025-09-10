import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "../components/ThemeToggle";
import { AuroraBackground } from "../components/AuroraBackground";
import { Navbar } from "../components/Navbar";
import { HeroSection } from "../components/HeroSection";
import { LastRunSection } from "../components/LastRunSection";
import { GraphicsSection } from "../components/GraphicsSection";
import { PersonalBestSection } from "../components/PersonalBestSection";
import { ContactSection } from "../components/ContactSection";
import { Footer } from "../components/Footer";
import { ViewportBottomBlur } from "../components/ViewportBottomBlur";

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
        <nav
          aria-label="Section dock"
          className="hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 z-50 flex-col gap-2 p-1.5 rounded-2xl backdrop-blur-md bg-background/60 border shadow-lg"
        >
          {[
            { id: "hero", label: "Home", emoji: "🏠", ref: heroRef },
            { id: "last", label: "Last run", emoji: "🏃", ref: lastRunRef },
            { id: "pb", label: "Bests", emoji: "🏅", ref: pbRef },
            { id: "graph", label: "Charts", emoji: "📈", ref: graphicsRef },
            { id: "contact", label: "Contact", emoji: "✉️", ref: contactRef },
          ].map(({ id, label, emoji, ref }) => (
            <button
              key={id}
              type="button"
              onClick={() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className={[
                "group relative grid place-items-center w-10 h-10 rounded-xl motion-safe:transition-transform duration-200 will-change-transform",
                "scale-90 hover:scale-115 active:scale-95",
                activeSection === id ? "ring-2 ring-primary/60 shadow-md" : "ring-0",
              ].join(" ")}
              title={label}
              aria-label={label}
            >
              <span className="text-xl select-none" aria-hidden>{emoji}</span>
              <span className="pointer-events-none absolute -right-2 top-1/2 -translate-y-1/2 translate-x-full whitespace-nowrap rounded-md border bg-popover px-2 py-1 text-xs opacity-0 shadow group-hover:opacity-100">
                {label}
              </span>
            </button>
          ))}
        </nav>
        <main>
          <section id="hero" ref={heroRef} className="scroll-mt-24">
            <HeroSection />
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
    {/* Fixed bottom-of-viewport blur wipe */}
    <ViewportBottomBlur blur={14} maxHeight="22vh" distance={520} />
    {/* Keep theme switch above the blur */}
    <ThemeToggle />
    </div>
  );
};
