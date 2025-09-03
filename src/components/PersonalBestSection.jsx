import { ExternalLink } from "lucide-react"
import * as SiIcons from "react-icons/si"
import { CiLink, CiGrid41, CiGrid2H } from "react-icons/ci";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

const projects = [
  {
    id:1,
    title: "Masked Face Detection",
    description: "A deep learning project that detects whether individuals are wearing face masks using MobileNet and EfficientNet architectures. Focused on real-time image classification and public health monitoring.",
    image: "/projects/Project - Mask Detection.png",
    tags: ["Python", "Deep Learning", "Computer Vision", "Github"],
    // demoUrl:"#..."
    githubUrl: "https://github.com/WacimN/SF-mask-detection"
  },
  {
    id:2,
    title: "French Mobile Network Analysis",
    description: "Big data pipeline analyzing mobile network coverage in France using Hadoop, Kafka, Spark, and Opensearch. Includes visualization and processing of large-scale geospatial data from ANFR.",
    image: "/projects/Project - French Mobile.png",
    tags: ["Python", "Hadoop", "Spark", "Opensearch"],
    // demoUrl:"#..."
    githubUrl: "https://github.com/pierreprudh/Antens_Map"
  },
  {
    id: 3,
    title: "Animal Face Recognition",
    description: "A computer vision system built with TensorFlow/Keras to detect and classify animal faces. Demonstrates convolutional neural networks applied to wildlife image recognition.",
    image: "/projects/Project - Animal face recognition.png",
    tags: ["Python", "Deep Learning", "Computer Vision", "Keras"],
    githubUrl: "https://github.com/pierreprudh/Animal_face_recognition"
  },
  {
    id: 4,
    title: "File Analysis Tool",
    description: "A Python utility for processing CSV/XLSX files, extracting structured data, and automatically generating JSON summaries and PDF dashboards for reporting.",
    image: "/projects/Project - Default.jpg",
    tags: ["Python", "Pandas", "Data Visualization"],
    githubUrl: "https://github.com/pierreprudh/File-Analysis"
  },
  {
    id: 5,
    title: "Cars customer clustering",
    description: "Clustering and segmentation of car customers using unsupervised learning techniques like KMeans. Built for a car brand to explore marketing insights from customer data.",
    image: "/projects/Project - Cars.jpg",
    tags: ["Python", "Machine Learning", "Clustering", "Pandas", "Plotly"],
    //githubUrl: "https://github.com/pierreprudh/BMW-Study-case"
  }
]


export const PersonalBestSection = () => {
  const [gridCols, setGridCols] = useState(() => {
    const saved = localStorage.getItem("gridCols");
    return saved ? Number(saved) : 1;
  });

  const handleToggleGrid = () => {
    setGridCols((prev) => {
      const next = prev === 1 ? 3 : 1;
      localStorage.setItem("gridCols", next);
      return next;
    });
  };

  const gridClass = `grid grid-cols-1 sm:grid-cols-${gridCols} lg:grid-cols-${gridCols} gap-8`;

  return <section id="best" className="py-24 px-4 relative">
    <div className="container mx-auto max-w-5xl">
      <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center"> Featured {" "}
        <span className="text-primary">
           Projects
        </span>
        </h2>

        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Here are some of my recent projects. Some project are for study and other are personal project.
        </p>

        <div className="flex justify-end mb-6">
          <button
            onClick={handleToggleGrid}
            className="p-2 text-muted-foreground hover:text-primary transition"
            aria-label="Toggle grid layout"
          >
            {gridCols === 1 ? <CiGrid2H size={24} /> : <CiGrid41 size={24} />}
          </button>
        </div>

        <div className={gridClass}>
          {projects.map((project,key) => (
            <div key={key} className="group bg-card rounded-lg overflow-hidden shadow-xs card-hover">
              <div className="h-48 overflow-hidden ">
                <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
              </div>
              <div className="p-6">
                  <div className="flex text-center justify-center flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <span className="px-2 py-1 text-xs font-medium border animate-hover rounded-full bg-primary/10 justify-center text-center text-secondary-foreground hover:scale-105 hover:shadow-md transition-transform transition-shadow duration-500">
                      {tag}
                    </span>
                  ))}
                </div>

              <h3 className="text-xl font-semibold mb-3 text-center justify-center">
                {project.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-4 whitespace-pre-line">
                {project.description}
              </p>
              <div className="flex justify-between items-center">
                  <div className="flex space-x-3">
                    {/* <a href={project.demoUrl}>

                      <CiLink />
                    </a> */}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        className="text-foreground/80 hover:text-primary transition-colors duration-300"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <SiIcons.SiGithub size={25} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

        </div>
        <hr className="my-12 border-muted" />
        <div className="text-center mt-12">
          <a
            href="https://github.com/pierreprudh"
            className="cosmic-button w-fit flex items-center mx-auto gap-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            Check my github <SiIcons.SiGithub size={20} />
          </a>
        </div>
    </div>
  </section>
}