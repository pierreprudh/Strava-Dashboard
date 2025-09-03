import { Mail, MapPin, Phone } from "lucide-react"
import { SiLinkedin } from "react-icons/si"
import { cn } from "../lib/utils"


export const ContactSection = () => {

  return <section id="contact" className="py-4  px-4 relative bg-secondary/30">
  <div className="container mx-auto max-w-5xl">
      <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
        Get in <span className="text-primary"> Touch </span>
      </h2>

      <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
        You want to have more informations, feel free to contact me !
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 items-start">
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm flex flex-col items-center text-center space-y-4 transition-transform duration-300 hover:scale-105">
          <div className="p-3 rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">Email</h4>
            <a href="mailto:prudh.pierre@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
              prudh.pierre@gmail.com
            </a>
          </div>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl shadow-sm flex flex-col items-center text-center space-y-4 transition-transform duration-300 hover:scale-105">
          <div className="p-3 rounded-full bg-primary/10">
            <Phone className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">Phone</h4>
            <a href="tel:0778820320" className="text-muted-foreground hover:text-primary transition-colors">
              07 78 82 03 20
            </a>
          </div>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl shadow-sm flex flex-col items-center text-center space-y-4 transition-transform duration-300 hover:scale-105">
          <div className="p-3 rounded-full bg-primary/10">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">Location</h4>
            <span className="text-muted-foreground">Paris, France</span>
          </div>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl shadow-sm flex flex-col items-center text-center space-y-4 transition-transform duration-300 hover:scale-105">
          <div className="p-3 rounded-full bg-primary/10">
            <SiLinkedin className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">LinkedIn</h4>
            <a href="https://www.linkedin.com/in/pierre-prudhomme-14b145222/" target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
              pierre-prudhomme
            </a>
          </div>
        </div>
      </div>

  </div>
  </section>
}