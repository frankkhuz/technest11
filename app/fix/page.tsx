"use client";

import { useEffect, useRef, useState } from "react";
import {
  Wrench,
  Send,
  Loader2,
  Bot,
  User,
  CheckCircle2,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import Navbar from "../component/layout/Navbar";
import { repairServices } from "../data/repairs";
import { gadgets, formatPrice } from "../data/gadget";

const ACCENT = "#C2542D";

type TriageReply = {
  type: "question" | "diagnosis";
  message: string;
  quickFixSteps?: string[];
  repairMatches?: { id: string; reason: string }[];
  productMatches?: { id: string; reason: string }[];
  suggestRepairerContact?: boolean;
};

type DisplayMessage = {
  role: "user" | "assistant";
  content: string;
  structured?: TriageReply;
  synthetic?: boolean;
};

const GREETING: DisplayMessage = {
  role: "assistant",
  content: "",
  synthetic: true,
  structured: {
    type: "question",
    message:
      "What's going on with your device? e.g. \"my phone screen just went blank\" or \"my gadget stopped charging\" — I'll ask a few quick questions and figure out what's wrong.",
  },
};

const EXAMPLE_PROMPTS = [
  "My phone screen just went blank",
  "My gadget stopped charging",
  "My laptop keeps overheating and shutting down",
];

export default function FixMyDevicePage() {
  const [messages, setMessages] = useState<DisplayMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;

    const apiHistory = messages
      .filter((m) => !m.synthetic)
      .map((m) => ({ role: m.role, content: m.content }));
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/repair-triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...apiHistory, { role: "user", content: text }] }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: data.error || "Something went wrong.",
            structured: { type: "question", message: data.error || "Something went wrong." },
          },
        ]);
      } else {
        const reply: TriageReply = data.reply;
        setMessages((m) => [
          ...m,
          { role: "assistant", content: JSON.stringify(reply), structured: reply },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Network error — please try again.",
          structured: { type: "question", message: "Network error — please try again." },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 mb-1">
          <Wrench className="w-5 h-5" style={{ color: ACCENT }} />
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--ink)", fontFamily: "Space Grotesk, sans-serif" }}
          >
            Fix My Device
          </h1>
        </div>
        <p className="text-sm mb-6" style={{ color: "var(--ink-soft)" }}>
          Describe what&apos;s wrong — the AI will troubleshoot with you and point you to a repair
          if you need one.
        </p>

        <div
          className="rounded-2xl flex flex-col overflow-hidden"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-5 space-y-4"
            style={{ minHeight: "50vh", maxHeight: "62vh" }}
          >
            {messages.map((m, i) => (
              <MessageBubble key={i} message={m} />
            ))}
            {loading && (
              <div className="flex items-start gap-2.5">
                <Avatar role="assistant" />
                <div
                  className="rounded-2xl rounded-tl-sm px-4 py-3"
                  style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
                >
                  <Loader2 className="w-4 h-4 animate-spin" style={{ color: ACCENT }} />
                </div>
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="text-xs px-3 py-1.5 rounded-full transition-colors"
                  style={{ background: "var(--accent-soft)", color: ACCENT, cursor: "pointer" }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 p-3" style={{ borderTop: "1px solid var(--border)" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Describe the problem..."
              className="flex-1 text-sm px-3.5 py-2.5 rounded-xl outline-none"
              style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border)" }}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              aria-label="Send"
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40"
              style={{ background: ACCENT, color: "#fff", cursor: "pointer" }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Avatar({ role }: { role: "user" | "assistant" }) {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
      style={role === "assistant" ? { background: ACCENT, color: "#fff" } : { background: "var(--accent-soft)", color: ACCENT }}
    >
      {role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
    </div>
  );
}

function MessageBubble({ message }: { message: DisplayMessage }) {
  const isUser = message.role === "user";
  const reply = message.structured;

  if (isUser) {
    return (
      <div className="flex items-start gap-2.5 justify-end">
        <div
          className="max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed"
          style={{ background: ACCENT, color: "#fff" }}
        >
          {message.content}
        </div>
        <Avatar role="user" />
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5">
      <Avatar role="assistant" />
      <div className="max-w-[85%] space-y-3">
        <div
          className="rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed"
          style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border)" }}
        >
          {reply?.message ?? message.content}
        </div>

        {!!reply?.quickFixSteps?.length && (
          <div className="rounded-xl p-3" style={{ background: "rgba(22,163,74,0.08)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-wide mb-2" style={{ color: "#16a34a" }}>
              Try this first
            </p>
            <ol className="space-y-1.5">
              {reply.quickFixSteps.map((step, i) => (
                <li key={i} className="text-xs flex items-start gap-2" style={{ color: "var(--ink)" }}>
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#16a34a" }} />
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        {!!reply?.repairMatches?.length && (
          <div className="space-y-2">
            {reply.repairMatches.map((match) => {
              const service = repairServices.find((r) => r.id === match.id);
              if (!service) return null;
              return (
                <div
                  key={match.id}
                  className="rounded-xl p-3"
                  style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                      {service.issue}
                    </p>
                    <p className="text-sm font-bold" style={{ color: ACCENT }}>
                      {formatPrice(service.priceMin)} – {formatPrice(service.priceMax)}
                    </p>
                  </div>
                  <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: "var(--ink-soft)" }}>
                    Estimated — exact price confirmed on inspection
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                    {match.reason}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {!!reply?.productMatches?.length && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {reply.productMatches.map((match) => {
              const gadget = gadgets.find((g) => g.id === match.id);
              if (!gadget) return null;
              return (
                <a
                  key={match.id}
                  href="/buy"
                  className="rounded-xl p-3 no-underline block"
                  style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
                >
                  <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                    {gadget.name}
                  </p>
                  <p className="text-xs mb-1.5" style={{ color: "var(--ink-soft)" }}>
                    {gadget.spec}
                  </p>
                  <p className="text-sm font-bold mb-1" style={{ color: "var(--ink)" }}>
                    {formatPrice(gadget.priceUkUsed)}
                  </p>
                  <span className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: ACCENT }}>
                    View on TechNest <ArrowRight className="w-3 h-3" />
                  </span>
                </a>
              );
            })}
          </div>
        )}

        {reply?.suggestRepairerContact && (
          <a
            href="https://wa.me/2348186450477?text=Hi%2C%20I%20need%20help%20fixing%20my%20device%20%E2%80%94%20I%20was%20just%20chatting%20with%20the%20TechNest%20repair%20assistant."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold no-underline px-4 py-2.5 rounded-xl"
            style={{ background: "#25d366", color: "#fff" }}
          >
            <MessageCircle className="w-4 h-4" /> Talk to our repair partner on WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
