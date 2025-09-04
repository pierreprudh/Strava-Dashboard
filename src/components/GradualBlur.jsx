import React, { useEffect, useRef, useState } from "react";

/**
 * GradualBlur
 * A simple wrapper that overlays a blurred copy of its children and
 * animates a soft mask to reveal crisp content from left-to-right (or rtl).
 *
 * Props:
 * - blur: number (px) — blur intensity of the overlay
 * - duration: number (ms) — animation duration
 * - direction: 'ltr' | 'rtl' — reveal direction
 * - className: string — optional extra classes on the wrapper
 */
export const GradualBlur = ({
  children,
  blur = 12,
  duration = 1200,
  direction = "ltr",
  className = "",
  trigger = "view", // 'view' | 'mount' | 'manual'
  active: activeProp, // manual control if trigger='manual'
  threshold = 0.2,
  once = true,
  delay = 0,
}) => {
  const dirClass = direction === "rtl" ? "gb-rtl" : "";
  const ref = useRef(null);
  const [activeState, setActiveState] = useState(false);
  const active = trigger === "manual" ? !!activeProp : activeState;

  useEffect(() => {
    if (trigger === "mount") {
      const id = requestAnimationFrame(() => setActiveState(true));
      return () => cancelAnimationFrame(id);
    }
    if (trigger !== "view") return;
    const el = ref.current;
    if (!el) return;
    let done = false;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setActiveState(true);
          if (once) {
            done = true;
            io.disconnect();
          }
        } else if (!once && !done) {
          setActiveState(false);
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [trigger, threshold, once]);

  const style = {
    "--gb-blur": `${blur}px`,
    "--gb-duration": `${duration}ms`,
    "--gb-delay": `${delay}ms`,
  };

  return (
    <span ref={ref} className={`gb-wrap relative inline-block ${active ? "gb-active" : ""} ${className}`} style={style}>
      {/* Blurred overlay that gets masked away */}
      <span aria-hidden className={`gb-overlay absolute inset-0 ${dirClass}`}>
        {children}
      </span>
      {/* Crisp content below */}
      <span className="relative">{children}</span>
    </span>
  );
};

export default GradualBlur;
