import { ArrowUp  } from "lucide-react";

export const Footer = () => {

  return <footer className="py-12 px-4 bg-card relative border-t border-border mt-12 pt-8 flex flex-wrapped justify-between items-center">
    <p className="text-sm text-muted-foregound ">&copy; {new Date().getFullYear()} Prudhomme Pierre. All rights reserved.</p>
    <a href="#hero" className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors duration-[2000] scroll-smooth">
      <ArrowUp size={20}/>
    </a>

  </footer>
}