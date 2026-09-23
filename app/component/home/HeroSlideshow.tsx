"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

const SLIDES = [
  { src: "/images/people/man-portrait.jpg", alt: "Smiling TechNest user holding his phone" },
  { src: "/images/gadgets/phone.jpg", alt: "Smartphone" },
  { src: "/images/gadgets/laptop.jpg", alt: "Laptop" },
  { src: "/images/gadgets/camera.jpg", alt: "Camera" },
  { src: "/images/gadgets/watch.jpg", alt: "Smartwatch" },
  { src: "/images/gadgets/headphones.jpg", alt: "Headphones" },
];

const HOLD_MS = 2800;
const SLIDE_DURATION = 0.5;

export default function HeroSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, HOLD_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-full h-full mx-auto overflow-hidden rounded-[2rem]" style={{ background: "var(--hp-purple-bg)" }}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={SLIDES[index].src}
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ duration: SLIDE_DURATION, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={SLIDES[index].src}
            alt={SLIDES[index].alt}
            fill
            sizes="(max-width: 640px) 90vw, 420px"
            style={{ objectFit: "cover" }}
            priority={index === 0}
          />
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {SLIDES.map((s, i) => (
          <span
            key={s.src}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === index ? 18 : 6,
              background: i === index ? "#fff" : "rgba(255,255,255,0.5)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
