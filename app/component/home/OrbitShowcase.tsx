"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const ORBIT_ITEMS = [
  { src: "/images/gadgets/phone.jpg", alt: "Smartphone" },
  { src: "/images/gadgets/laptop.jpg", alt: "Laptop" },
  { src: "/images/gadgets/camera.jpg", alt: "Camera" },
  { src: "/images/gadgets/watch.jpg", alt: "Smartwatch" },
  { src: "/images/gadgets/headphones.jpg", alt: "Headphones" },
];

const ORBIT_DURATION = 26; // seconds for one full loop
const RADIUS_RATIO = 0.44; // orbit radius as a fraction of the container's width
const THUMB_RATIO = 0.17; // thumbnail size as a fraction of the container's width

export default function OrbitShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setSize(el.offsetWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const radius = size * RADIUS_RATIO;
  const thumbSize = Math.max(40, size * THUMB_RATIO);

  return (
    <div ref={containerRef} className="relative w-full h-full mx-auto" style={{ perspective: "1000px" }}>
      {/* Soft glow backdrop */}
      <div
        className="absolute inset-[8%] rounded-full"
        style={{ background: "var(--hp-purple-bg)", filter: "blur(4px)" }}
      />

      {/* Central portrait — stays fixed while gadgets orbit around it */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="absolute rounded-full overflow-hidden shadow-2xl z-10"
        style={{ inset: "18%", border: "4px solid var(--hp-surface)" }}
      >
        <Image
          src="/images/people/man-portrait.jpg"
          alt="Smiling TechNest user holding his phone"
          fill
          sizes="(max-width: 640px) 60vw, 320px"
          style={{ objectFit: "cover" }}
          priority
        />
      </motion.div>

      {/* Orbit ring — rotates as a whole; each thumbnail counter-rotates so it
          stays upright while travelling around the circle, like a satellite.
          Radius/size are measured from the container so this scales correctly
          on both the mobile and desktop hero sizes instead of clipping. */}
      {size > 0 && (
        <motion.div
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotate: 360 }}
          transition={{ duration: ORBIT_DURATION, repeat: Infinity, ease: "linear" }}
        >
          {ORBIT_ITEMS.map((item, i) => {
            const angle = (360 / ORBIT_ITEMS.length) * i;
            return (
              <div
                key={item.src}
                className="absolute top-1/2 left-1/2"
                style={{
                  width: thumbSize,
                  height: thumbSize,
                  transform: `rotate(${angle}deg) translateX(${radius}px) rotate(-${angle}deg) translate(-50%, -50%)`,
                }}
              >
                <motion.div
                  className="w-full h-full rounded-full overflow-hidden shadow-lg"
                  style={{ border: "3px solid var(--hp-surface)" }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: ORBIT_DURATION, repeat: Infinity, ease: "linear" }}
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="80px"
                    style={{ objectFit: "cover" }}
                  />
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
