import { useState, useEffect } from "react"
import { cn } from "../lib/utils";
import * as SiIcons from "react-icons/si"
import { VscVscode } from "react-icons/vsc"

const skills = [
  // Data Science
  {name : "Python", level:90, category: "Data Science", icon: "SiPython"},
  {name : "R", level:70, category: "Data Science", icon: "SiR"},
  {name : "Machine Learning", level:80, category: "Data Science", icon: "SiTensorflow"},
  {name : "Deep Learning", level:75, category: "Data Science", icon: "SiPytorch"},
  {name : "Statistical Analysis", level:70, category: "Data Science", icon: "SiChartdotjs"},
  {name : "Data Manipulation", level:80, category: "Data Science", icon: "SiPandas"},
  {name : "Computer Vision", level:75, category: "Data Science", icon: "SiOpencv"},
  {name : "SQL", level:75, category: "Data Science", icon: "SiMysql"},
  { name: "Clustering", level: 70, category: "Data Science", icon: "SiKeras" },


  // Data Visualization
  {name : "Plotly", level:75, category: "Visualization", icon: "SiPlotly"},
  {name : "Streamlit", level:75, category: "Visualization", icon: "SiStreamlit"},

  // Big Data
  {name : "Hadoop", level:65, category: "Big Data", icon: "SiApachehadoop"},
  {name : "Kafka", level:60, category: "Big Data", icon: "SiApachekafka"},
  {name : "Spark", level:65, category: "Big Data", icon: "SiApachespark"},
  { name: "Dataiku", level: 50, category: "Data Science", icon: "SiDataiku" },
  { name: "OpenSearch", level: 60, category: "Data Science", icon: "SiOpensearch" },

  // Tools
  {name : "Git/Github", level:85, category: "Tools", icon: "SiGithub"},
  {name : "LaTeX", level:80, category: "Tools", icon: "SiLatex"},
  {name : "Docker", level:60, category: "Tools", icon: "SiDocker"},
  {name: "Hugging Face", level: 65, category: "Tools", icon: "SiHuggingface" },
  {name : "Vs Code", level:75, category: "Tools", icon: "VscVscode"},

  // Others
  {name : "React", level:60, category: "Others", icon: "SiReact"}
]

const categories = ["all", "Data Science", "Visualization", "Big Data", "Tools", "Others"]

export const GraphicsSection =  () => {

  const [activeCategory, setActiveCategory] = useState("all")
  const [animatingCategory, setAnimatingCategory] = useState(activeCategory)
  const filteredSkills = skills.filter((skill) => activeCategory === "all" || skill.category === activeCategory)

  useEffect(() => {
    setAnimatingCategory(null);
    const timeout = setTimeout(() => {
      setAnimatingCategory(activeCategory);
    }, 300);
    return () => clearTimeout(timeout);
  }, [activeCategory]);

  return <section id="graphics" className="py-24 px-4 relative bg-secondary/30">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          My <span className="text-primary">Skills </span>
        </h2>

        <div className="relative flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category, key) => (
            <button
              key={key}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "relative px-5 py-2 rounded-full transition-all duration-700 ease-in-out capitalize",
                activeCategory === category
                  ? "bg-primary text-primary-foreground scale-105"
                  : "text-foreground hover:bg-secondary"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        <div
          className={cn(
            "grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6 transition-all duration-700 ease-in-out",
            animatingCategory === activeCategory ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          {filteredSkills.map((skill, key) =>
          (
            <div key={key} className="bg-card p-6 rounded-lg shadow-xs card-hover transition-opacity duration-700 ease-in-out opacity-100 hover:scale-105 hover:shadow-md transition-transform transition-shadow duration-500">
              <div className="text-left mb-4 flex items-center">
                {(() => {
                  if (skill.icon === "VscVscode") return <VscVscode className="text-2xl mr-2" />;
                  const IconComponent = skill.icon ? SiIcons[skill.icon] : null;
                  return IconComponent ? <IconComponent className="text-2xl mr-2" /> : null;
                })()}
                <h3 className="font-semibold text-lg">{skill.name}</h3>
              </div>
              <div className="w-full bg-secondary/50 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full origin-left transition-all duration-1000 ease-in-out"
                  style={{width: skill.level + "%"}}
                />
              </div>
              <div className="text-right mt-1 ">
                <span className="text-sm text-muted-foreground">{skill.level}%</span>
              </div>
            </div>
          )
          )}
        </div>
      </div>

  </section>
}