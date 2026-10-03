"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "framer-motion";

const SLIDES = [
  { src: "/images/people/man-portrait.jpg", alt: "Smiling TechNest user holding his phone", tag: "Real people", title: "Trade with verified Nigerians" },
  { src: "/images/gadgets/phone.jpg", alt: "Smartphone", tag: "Phones", title: "UK used & brand new" },
  { src: "/images/gadgets/laptop.jpg", alt: "Laptop", tag: "Laptops", title: "Work-ready machines" },
  { src: "/images/people/woman-sofa.jpg", alt: "A buyer enjoying her new phone at home", tag: "Happy buyers", title: "Fair prices, no scams" },
  { src: "/images/gadgets/camera.jpg", alt: "Camera", tag: "Cameras", title: "Capture more for less" },
  { src: "/images/gadgets/watch.jpg", alt: "Smartwatch", tag: "Wearables", title: "Swap into something new" },
  { src: "/images/gadgets/headphones.jpg", alt: "Headphones", tag: "Audio", title: "Sound that fits your budget" },
];

const HOLD_MS = 4200;
const SWIPE_PX = 60;

const DEPTH_POSE = [
  { rotate: 0, scale: 1, x: 0, y: 0, opacity: 1 },
  { rotate: 6, scale: 0.92, x: 22, y: 12, opacity: 0.9 },
  { rotate: -7, scale: 0.86, x: -22, y: 22, opacity: 0.75 },
];

const cardVariants = (reduce: boolean) => ({
  enter: (dir: number) =>
    reduce
      ? { opacity: 0 }
      : dir === 1
        ? { ...DEPTH_POSE[2], opacity: 0, scale: 0.8 }
        : { x: -320, y: 0, rotate: -18, opacity: 0, scale: 1 },
  exit: (dir: number) =>
    reduce
      ? { opacity: 0 }
      : dir === 1
        ? { x: -220, y: 24, rotate: -14, scale: 0.92, opacity: 0, zIndex: 20, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] as const, opacity: { duration: 0.3 } } }
        : { ...DEPTH_POSE[2], scale: 0.8, opacity: 0, zIndex: 0 },
});

function shuffledOrder(): number[] {
  const rest = SLIDES.map((_, i) => i).slice(1);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [0, ...rest];
}

export default function HeroSlideshow() {
  const [index, setIndex] = useState(0);
  const [order, setOrder] = useState(() => SLIDES.map((_, i) => i));
  const [direction, setDirection] = useState<1 | -1>(1);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  const go = useCallback((delta: 1 | -1) => {
    setDirection(delta);
    setIndex((i) => (i + delta + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => setOrder(shuffledOrder()));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => go(1), HOLD_MS);
    return () => clearTimeout(id);
  }, [index, paused, go]);

  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_PX) go(1);
    else if (info.offset.x > SWIPE_PX) go(-1);
  };

  const deck = DEPTH_POSE.map((_, d) => order[(index + d) % SLIDES.length]);
  const current = SLIDES[deck[0]];

  return (
    <div
      className="relative w-full h-full select-none"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured on TechNest"
    >
      <div
        className="absolute inset-[8%] rounded-full blur-3xl opacity-60 pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--hp-accent-soft), var(--hp-purple-bg) 60%, transparent 75%)" }}
      />

      <div className="absolute inset-[7%]">
        <AnimatePresence initial={false} custom={direction}>
          {deck
            .map((slideIdx, depth) => ({ slideIdx, depth }))
            .reverse()
            .map(({ slideIdx, depth }) => {
              const slide = SLIDES[slideIdx];
              const isFront = depth === 0;
              const pose = DEPTH_POSE[depth];
              return (
                <motion.div
                  key={slide.src}
                  custom={direction}
                  variants={cardVariants(!!reduceMotion)}
                  initial="enter"
                  animate={{ ...pose, zIndex: 10 - depth }}
                  exit="exit"
                  transition={{ type: "spring", stiffness: 210, damping: 26 }}
                  drag={isFront ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.6}
                  onDragEnd={isFront ? onDragEnd : undefined}
                  className={`absolute inset-0 rounded-[2rem] overflow-hidden ${isFront ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"}`}
                  style={{
                    background: "var(--hp-purple-bg)",
                    boxShadow: isFront
                      ? "0 30px 60px -24px rgba(26,21,32,0.55)"
                      : "0 16px 30px -18px rgba(26,21,32,0.4)",
                    border: "4px solid var(--hp-surface)",
                  }}
                  aria-hidden={!isFront}
                >
                  <motion.div
                    className="absolute inset-0"
                    initial={{ scale: 1.12 }}
                    animate={{ scale: isFront && !reduceMotion ? 1 : 1.12 }}
                    transition={{ duration: HOLD_MS / 1000 + 1, ease: "linear" }}
                  >
                    <Image
                      src={slide.src}
                      alt={slide.alt}
                      fill
                      draggable={false}
                      sizes="(max-width: 640px) 85vw, 420px"
                      style={{ objectFit: "cover" }}
                      priority={slideIdx === 0}
                    />
                  </motion.div>
                  {!isFront && <div className="absolute inset-0" style={{ background: "rgba(26,21,32,0.18)" }} />}
                </motion.div>
              );
            })}
        </AnimatePresence>

        <div className="absolute inset-0 z-30 pointer-events-none rounded-[2rem] overflow-hidden">
          <div
            className="absolute inset-x-0 bottom-0 h-2/5"
            style={{ background: "linear-gradient(to top, rgba(10,6,14,0.72), transparent)" }}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={current.src}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-5 right-5 bottom-5"
            >
              <span
                className="inline-block text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full mb-2"
                style={{ background: "var(--hp-accent)", color: "#fff" }}
              >
                {current.tag}
              </span>
              <p className="text-white text-lg sm:text-xl font-bold leading-tight" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                {current.title}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
