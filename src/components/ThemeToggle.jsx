import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { cn } from "../lib/utils";

export const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
  const storedTheme = localStorage.getItem("theme")
  if (storedTheme === "dark"){
    setIsDarkMode(true)
    document.documentElement.classList.add("dark")
  } else {
    setIsDarkMode(false)
    document.documentElement.classList.remove("dark")
  }
  }, [])

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
      setIsDarkMode(false)
      document.dispatchEvent(new Event("themeChanged"));
    } else {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
      setIsDarkMode(true)
      document.dispatchEvent(new Event("themeChanged"));
    }
  }

  return (
    <button onClick={toggleTheme} className={cn(
      "fixed bottom-4 right-4 z-50 p-2 rounded-full transition-all duration-300 transform hover:scale-110 hover:rotate-6",
      "md:bottom-20 md:right-20 md:p-5",
      "bg-white/10 dark:bg-gray-800/10 backdrop-blur-md shadow-md",
      "focus:outline-hidden"
    )}>

      <div className="relative w-8 h-8 md:w-9 md:h-9 grid place-items-center">
        <Moon
          className={cn(
            "absolute transition-all duration-500 transform flex items-center justify-center",
            !isDarkMode
              ? "opacity-100 scale-100 rotate-0"
              : "opacity-0 scale-75 rotate-90",
            "text-blue-900"
          )}
        />
        <Sun
          className={cn(
            "absolute transition-all duration-500 transform flex items-center justify-center",
            isDarkMode
              ? "opacity-100 scale-100 rotate-0"
              : "opacity-0 scale-75 rotate-90",
            "text-yellow-300"
          )}
        />
      </div>
    </button>
  );
};