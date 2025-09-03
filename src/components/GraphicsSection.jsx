import { useState, useEffect } from "react"
import { cn } from "../lib/utils";
import * as SiIcons from "react-icons/si"
import { VscVscode } from "react-icons/vsc"



const categories = ["all", "Data Science", "Visualization", "Big Data", "Tools", "Others"]

export const GraphicsSection =  () => {



  return <section id="graphics" className="py-24 px-4 relative bg-secondary/30">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          <span className="text-primary">Graphics </span>
        </h2>

      </div>

  </section>
}