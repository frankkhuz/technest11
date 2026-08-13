"use client";
import { useEffect, useState } from "react";
import { RotateCw } from "lucide-react";
import Ticker from "./Ticker";

export default function NetworkError({
  title = "CONNECTION LOST.",
  message = "We couldn't reach the server. Check your connection and try again.",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry: () => void;
}) {
  const [seconds, setSeconds] = useState(8);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          onRetry();
          return 8;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onRetry]);

  return (
    <div
      className="min-h-screen flex flex-col justify-between"
      style={{
        background: "var(--bg)",
        backgroundImage:
          "repeating-linear-gradient(0deg, var(--border) 0px, transparent 1px, transparent 64px, var(--border) 65px), repeating-linear-gradient(90deg, var(--border) 0px, transparent 1px, transparent 64px, var(--border) 65px)",
        backgroundSize: "65px 65px",
      }}
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <div
          className="mono-label inline-flex items-center gap-2 mb-6"
          style={{ color: "var(--accent)" }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full pulse-dot"
            style={{ background: "var(--accent)" }}
          />
          SYSTEM · OFFLINE
        </div>
        <h1
          className="text-5xl sm:text-6xl font-bold mb-4"
          style={{ color: "var(--ink)" }}
        >
          {title}
        </h1>
        <p
          className="text-sm max-w-md mb-8"
          style={{ color: "var(--ink-soft)" }}
        >
          {message}
        </p>
        <button
          onClick={() => {
            setSeconds(8);
            onRetry();
          }}
          className="mono-label inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-opacity hover:opacity-90"
          style={{
            background: "var(--accent)",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          <RotateCw size={14} /> RETRY NOW
        </button>
        <p className="mono-label mt-4" style={{ color: "var(--ink-soft)" }}>
          RETRYING AUTOMATICALLY IN {seconds}S
        </p>
      </div>
      <Ticker
        items={[
          "CHECKING CONNECTION",
          "NO DATA LOST",
          "OFFLINE MODE ACTIVE",
          "RETRYING AUTOMATICALLY",
        ]}
      />
    </div>
  );
}
