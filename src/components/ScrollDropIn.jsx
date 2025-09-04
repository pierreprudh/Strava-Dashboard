import React, { useEffect, useRef, useState } from "react";

/**
 * ScrollDropIn
 * Reveals children with a subtle drop/bounce when scrolled into view.
 *
 * Props:
 * - from: 'down' | 'up' — starting direction (default 'down')
 * - distance: number — px to offset initially (default 24)
 * - duration: number — ms for animation (default 700)
 * - delay: number — ms delay (default 0)
 * - threshold: number — intersection threshold (default 0.2)
 * - once: boolean — animate only once (default true)
 */
export const ScrollDropIn = ({
  children,
  from = "down",
  distance = 24,
  duration = 700,
  delay = 0,
  threshold = 0.2,
  once = true,
  persist = true, // keep visible after first reveal
  className = "",
}) => {
  const ref = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let done = false;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setActive(true);
          if (once || persist) {
            done = true;
            io.disconnect();
          }
        } else if (!once && !done && !persist) {
          setActive(false);
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once]);

  const style = {
    "--sd-from-y": `${from === "up" ? -distance : distance}px`,
    "--sd-duration": `${duration}ms`,
    "--sd-delay": `${delay}ms`,
  };

  return (
    <div ref={ref} className={`sd-wrap ${active ? "sd-active" : ""} ${className}`} style={style}>
      <div className="sd-content w-full">{children}</div>
    </div>
  );
};

export default ScrollDropIn;
