"use client";
import { useEffect, useRef } from "react";

type GadgetType = "phone" | "watch" | "headphones";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vrot: number;
  type: GadgetType;
};

const LINK_DIST = 140;
const MOUSE_RADIUS = 130;

function pickType(): GadgetType {
  const r = Math.random();
  if (r < 0.5) return "phone";
  if (r < 0.75) return "watch";
  return "headphones";
}

export default function SectionBackground({
  dark,
  minCount = 18,
  maxCount = 60,
  density = 16000,
}: {
  dark: boolean;
  minCount?: number;
  maxCount?: number;
  density?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const strokeColor = dark
      ? "rgba(255,255,255,0.4)"
      : "rgba(2,0,68,0.32)";
    const dimStrokeColor = dark
      ? "rgba(255,255,255,0.22)"
      : "rgba(2,0,68,0.16)";
    const dotColor = dark
      ? "rgba(255,255,255,0.5)"
      : "rgba(2,0,68,0.45)";
    const linkAlpha = dark ? 0.14 : 0.11;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: Particle[] = [];
    const mouse = { x: -9999, y: -9999 };

    // Phones / low-power devices: fewer particles, 30fps. Data Saver: still.
    type NavInfo = Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
    const nav = navigator as NavInfo;
    const saveData = !!nav.connection?.saveData;
    const lowPower =
      window.matchMedia("(pointer: coarse)").matches ||
      (navigator.hardwareConcurrency || 8) <= 4 ||
      (nav.deviceMemory ?? 8) <= 4;
    const cap = lowPower ? Math.min(maxCount, 16) : maxCount;
    const frameMs = lowPower ? 1000 / 30 : 0;
    let lastFrame = 0;

    const makeParticles = () => {
      const count = Math.min(
        cap,
        Math.max(minCount, Math.floor((width * height) / density))
      );
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        size: 16 + Math.random() * 12,
        rot: (Math.random() - 0.5) * 0.6,
        vrot: (Math.random() - 0.5) * 0.004,
        type: pickType(),
      }));
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeParticles();
    };

    const drawPhone = (size: number) => {
      const w = size * 0.56;
      const h = size;
      const r = w * 0.26;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, r);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.1;
      ctx.stroke();

      // inner screen bezel
      ctx.beginPath();
      ctx.roundRect(-w / 2 + 2, -h / 2 + 3.5, w - 4, h - 7, r * 0.6);
      ctx.strokeStyle = dimStrokeColor;
      ctx.lineWidth = 0.75;
      ctx.stroke();

      // camera dot
      ctx.beginPath();
      ctx.arc(0, -h / 2 + 2.6, 1, 0, Math.PI * 2);
      ctx.fillStyle = dotColor;
      ctx.fill();

      // home indicator
      ctx.beginPath();
      ctx.roundRect(-w * 0.16, h / 2 - 2.4, w * 0.32, 1.3, 1);
      ctx.fillStyle = dimStrokeColor;
      ctx.fill();
    };

    const drawWatch = (size: number) => {
      const s = size * 0.58;
      const r = s * 0.28;
      // lugs (top/bottom strap stubs)
      ctx.strokeStyle = dimStrokeColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(-s * 0.28, -size / 2, s * 0.56, size * 0.18, 1.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(-s * 0.28, size / 2 - size * 0.18, s * 0.56, size * 0.18, 1.5);
      ctx.stroke();

      // face
      ctx.beginPath();
      ctx.roundRect(-s / 2, -s / 2, s, s, r);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.1;
      ctx.stroke();

      // crown
      ctx.beginPath();
      ctx.roundRect(s / 2, -1.2, 2.4, 2.4, 0.6);
      ctx.fillStyle = dimStrokeColor;
      ctx.fill();
    };

    const drawHeadphones = (size: number) => {
      const r = size * 0.46;
      ctx.beginPath();
      ctx.arc(0, -size * 0.08, r, Math.PI * 1.08, Math.PI * 1.92);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      const cupW = size * 0.22;
      const cupH = size * 0.36;
      for (const side of [-1, 1]) {
        const cx = side * r * 0.98;
        const cy = size * 0.22;
        ctx.beginPath();
        ctx.roundRect(cx - cupW / 2, cy - cupH / 2, cupW, cupH, cupW * 0.4);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    const drawGadget = (p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.type === "phone") drawPhone(p.size);
      else if (p.type === "watch") drawWatch(p.size);
      else drawHeadphones(p.size);
      ctx.restore();
    };

    const step = (now: number = performance.now()) => {
      if (frameMs && running && now - lastFrame < frameMs) {
        frame = requestAnimationFrame(step);
        return;
      }
      lastFrame = now;
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < MOUSE_RADIUS) {
          const force = (1 - dist / MOUSE_RADIUS) * 0.06;
          p.vx += (dx / (dist || 1)) * force;
          p.vy += (dy / (dist || 1)) * force;
        }

        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;

        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK_DIST) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(239,63,35,${
              linkAlpha * (1 - d / LINK_DIST)
            })`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      for (const p of particles) drawGadget(p);

      if (running) frame = requestAnimationFrame(step);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    let frame = 0;
    let running = false;
    let visible = true;
    let allowed = false; // flipped once the page has loaded and gone idle
    const start = () => {
      if (!allowed || running || !visible || document.hidden) return;
      running = true;
      frame = requestAnimationFrame(step);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    // Only re-seed particles when the width really changes. On phones the
    // URL bar showing/hiding and content loading change the height
    // constantly; re-seeding then made the background visibly "jump".
    let lastW = -1;
    let lastH = -1;
    const ro = new ResizeObserver(() => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      if (w === lastW && Math.abs(h - lastH) < 40) return;
      lastW = w;
      lastH = h;
      resize();
    });
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    // Pause the animation while it is scrolled off-screen or the tab is
    // hidden — it was running every frame on every page, even out of view.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    resize();
    // Paint one still frame right away, but only start animating once the
    // page has loaded and the main thread is idle — so the background never
    // competes with the page's own loading on a phone.
    step();
    let idleHandle: number | undefined;
    const begin = () => {
      if (saveData) return;
      const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
        .requestIdleCallback;
      const go = () => {
        allowed = true;
        start();
      };
      idleHandle = ric ? ric(go, { timeout: 3000 }) : window.setTimeout(go, 1200);
    };
    if (document.readyState === "complete") begin();
    else window.addEventListener("load", begin, { once: true });
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("load", begin);
      if (idleHandle !== undefined) {
        const cic = (window as Window & { cancelIdleCallback?: (h: number) => void }).cancelIdleCallback;
        if (cic) cic(idleHandle);
        else clearTimeout(idleHandle);
      }
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [dark, minCount, maxCount, density]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
