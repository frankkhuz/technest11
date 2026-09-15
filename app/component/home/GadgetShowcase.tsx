"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

const GADGETS = [
  { src: "/images/gadgets/phone.jpg", alt: "Smartphone", position: "50% 58%" },
  { src: "/images/gadgets/laptop.jpg", alt: "Laptop", position: "70% 40%" },
  { src: "/images/gadgets/camera.jpg", alt: "Camera", position: "50% 45%" },
  { src: "/images/gadgets/watch.jpg", alt: "Smartwatch", position: "22% 30%" },
  { src: "/images/gadgets/headphones.jpg", alt: "Headphones", position: "50% 45%" },
];

const INTERVAL_MS = 2800;

export default function GadgetShowcase() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % GADGETS.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const current = GADGETS[index];

  return (
    <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden shadow-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.src}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={current.src}
            alt={current.alt}
            fill
            sizes="(max-width: 1024px) 90vw, 480px"
            style={{ objectFit: "cover", objectPosition: current.position }}
            priority={index === 0}
          />
        </motion.div>
      </AnimatePresence>

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {GADGETS.map((g, i) => (
          <span
            key={g.src}
            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{
              background: i === index ? "#fff" : "rgba(255,255,255,0.5)",
              width: i === index ? "16px" : "6px",
            }}
          />
        ))}
      </div>
    </div>
  );
}
