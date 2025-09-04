import React, { useEffect, useRef } from "react";

/**
 * ViewportBottomBlur
 * Fixed bottom-of-viewport overlay that uses backdrop-filter to blur
 * content behind it, with a soft vertical mask that "wipes" upward
 * as the user scrolls. Progress is tied to scroll position.
 */
export const ViewportBottomBlur = ({
  blur = 14,
  maxHeight = "22vh",
  distance = 480, // px over which the wipe completes
  fadeOutStart = 480, // px after which overlay starts to fade out
  fadeOutRange = 240, // px over which overlay fades to 0
  className = "",
}) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const update = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      const p = Math.max(0, Math.min(1, y / distance));
      // Fade overlay out after a certain scroll depth
      const fade = y <= fadeOutStart ? 1 : Math.max(0, 1 - (y - fadeOutStart) / Math.max(1, fadeOutRange));
      el.style.setProperty("--vb-progress", String(p));
      el.style.setProperty("--vb-opacity", String(fade));
      raf = 0;
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [distance]);

  const style = {
    "--vb-blur": `${blur}px`,
    "--vb-h": typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
  };

  return <div ref={ref} className={`vb-overlay ${className}`} style={style} />;
};

export default ViewportBottomBlur;
