import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 240; // Adjust based on your extracted frames
const pad = (num, size) => String(num).padStart(size, "0");

const ScrollAnimation = () => {
  const canvasRef = useRef();
  const containerRef = useRef();
  const images = useRef([]);
  const frame = useRef(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Draw function
  const draw = (index) => {
    if (!canvasRef.current || !images.current[index]) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = images.current[index];

    // Set canvas size to match window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  // Preload all images
  useEffect(() => {
    let loadedCount = 0;

    for (let i = 1; i <= FRAME_COUNT; i += 1) {
      const img = new Image();
      img.src = `/frames/frame_${pad(i, 3)}.jpg`;
      img.onload = () => {
        loadedCount += 1;
        if (loadedCount === FRAME_COUNT) {
          setImagesLoaded(true);
          draw(0); // Draw first frame
        }
      };
      images.current.push(img);
    }

    return () => {
      images.current = [];
    };
  }, []);

  // Setup GSAP ScrollTrigger
  useEffect(() => {
    if (!imagesLoaded) return undefined;

    const animation = gsap.to(frame, {
      current: FRAME_COUNT - 1,
      snap: "current",
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom+=2000", // Adjust scroll distance
        scrub: 1, // Smooth scrubbing
        pin: true,
        onUpdate: () => draw(Math.floor(frame.current)),
      },
    });

    return () => {
      animation.kill();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [imagesLoaded]);

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full object-cover"
      />

      {/* Loading state */}
      {!imagesLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
          <div className="text-center">
            <div className="animate-pulse mb-4">Loading Animation...</div>
            <div className="w-32 h-1 bg-gray-600 rounded overflow-hidden">
              <div className="h-full bg-orange-500 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Fallback for mobile/slow devices */}
      <div className="absolute inset-0 md:hidden bg-gradient-to-b from-blue-600 to-orange-400 flex items-center justify-center">
        <div className="text-white text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Your Strava Journey</h2>
          <p>Scroll down to explore your running analytics</p>
        </div>
      </div>
    </div>
  );
};

export default ScrollAnimation;
