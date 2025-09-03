import { Briefcase, Code, User, Sparkles  } from "lucide-react"

export const LastRunSection = () => {
  return <section id="lastrun" className="py-24 px-4 relative">
    {" "}
    <div className="container mx-auto max-w-5xl">
      <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
        About <span className="text-primary">Me</span>
      </h2>

      <div className="grid gr-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 ">
          <h3 className="text-2xl font-semibold">Engineering Student & Data Science Enthusiast</h3>
          <p className="text-muted-foreground">
            Currently studying at ENSIIE, I’m passionate about data science, AI, and large-scale data analytics. I’ve gained hands-on experience through internships and personal projects involving predictive modeling, data visualization, and infrastructure tools.
          </p>
          <p className="text-muted-foreground">
            I enjoy turning complex problems into actionable insights, and love building tools that blend machine learning with clean, user-friendly interfaces.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
            <a href="#contact" className="cosmic-button" >
              {" "}
              Contact Me
            </a>
            <a
              href="/CV.pdf"
              className="px-6 py-2 rounded-full border border-primary text-primary hover:bg-primary/10 transition-colors duration-300"
              download
            >
              {" "}
              ⬇️ CV
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="gradient-border p-6 card-hover">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Code  className="h-6 w-6 text-primary"/>
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-lg">
                  Data Scientist/Analyst
                </h4>
                <p className="text-muted-foreground">
                  Building Model and Dashboard/Insights
                </p>
              </div>
            </div>
          </div>

          <div className="gradient-border p-6 card-hover">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Sparkles  className="h-6 w-6 text-primary"/>
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-lg">
                  Curious & Motivated
                </h4>
                <p className="text-muted-foreground">
                  Always looking to learn and take on new challenges.
                </p>
              </div>
            </div>
          </div>

          <div className="gradient-border p-6 card-hover">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Briefcase  className="h-6 w-6 text-primary"/>
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-lg">
                  Work
                </h4>
                <p className="text-muted-foreground">
                  International Internship at <span className="text-blue-800">Limpide Energy</span>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </section>
}