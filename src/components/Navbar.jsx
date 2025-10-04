import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "../lib/utils";

const navItems = [
  {
    name: "Home", href: "#hero"
  },
  {
    name: "Last Run", href: "#lastrun"
  },
  {
    name: "Personal Best", href: "#best"
  },
  {
    name: "Highlight", href: "#highlight"
  }
]

export const Navbar = () => {

  const [isScrolled, setisScrolled] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setisScrolled(currentScrollY > lastScrollY && currentScrollY > 10);
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Gestion fermeture du menu mobile lors d'un clic à l'extérieur (hors bouton menu)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isAccordionOpen &&
        !event.target.closest("nav") &&
        !event.target.closest("button[aria-label='Open Menu']")
      ) {
        setIsAccordionOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAccordionOpen]);


  return <nav className={cn(
  "fixed w-full z-40 transition-all duration-300 py-4 sm:py-6",
  isScrolled ? "opacity-0 -translate-y-full pointer-events-none" : "opacity-100 translate-y-0"
)}>
    <div className={cn(
      "container rounded-full py-4 sm:py-5 px-6 sm:px-8 md:px-10 lg:px-12 max-w-screen-sm sm:max-w-screen-md md:max-w-screen-lg lg:max-w-7xl",
      "bg-white/20 dark:bg-white/5 backdrop-blur-xl shadow-2xl ring-1 ring-white/40 dark:ring-white/10 border border-white/30 dark:border-white/5"
    )}>
    <div className={cn(
      "flex w-full items-center justify-between transition-all duration-500",
      isAccordionOpen ? "justify-center" : ""
    )}>
      <a className="text-2xl font-bold text-primary flex items-center"
         href="#hero">
        <span className="relative z-10">
          <span className="text-glow text-foreground">
              Strava
          </span>{" "}
          Dashboard
        </span>
      </a>

      {/*Desktop version*/}

      <div className="hidden md:flex space-x-10">
        {navItems.map((item, key) => (
          <a key = {key} href={item.href} className="text-lg text-foreground/80 hover:text-primary transition-colors duration-500">
            {item.name}
          </a>
        ))}
      </div>

      {/*Mobile version*/}

      {!isAccordionOpen && (
        <button
          onClick={() => setIsAccordionOpen(true)}
          className="md:hidden p-2 text-foreground z-50"
          aria-label="Open Menu"
        >
          <Menu size={24} />
        </button>
      )}

    </div>

    <div
      className={cn(
        "md:hidden w-full overflow-hidden transition-all duration-500 ease-in-out flex flex-col items-center gap-y-4 z-0 -mt-4 px-4",
        isAccordionOpen ? "max-h-[500px] opacity-100 py-4" : "max-h-0 opacity-0"
      )}
    >
      {navItems.map((item, key) => (
        <a
          key={key}
          href={item.href}
          className="text-xl text-foreground/80 hover:text-primary transition-colors duration-300"
          onClick={() => setIsAccordionOpen(false)}
          size
        >
          {item.name}
        </a>
      ))}
    </div>
    </div>
  </nav>

}
