"use client";

import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  CheckCircle2,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import VoiceInputButton from "../shared/VoiceInputButton";
import { repairServices } from "../../data/repairs";
import { gadgets, formatPrice } from "../../data/gadget";

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
  "My laptop keeps overheating",
];

export default function RepairChatPanel() {
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
    <div
      className="rounded-2xl flex flex-col overflow-hidden"
      style={{ background: "var(--surface)", border: `1.5px solid ${ACCENT}` }}
    >
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: ACCENT, color: "#fff" }}
        >
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: "var(--ink)" }}>
            Ask the Repair AI
          </p>
          <p className="text-[10px]" style={{ color: "var(--ink-soft)" }}>
            Troubleshoot now, no waiting
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-4 space-y-3"
        style={{ minHeight: 320, maxHeight: 440 }}
      >
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}
        {loading && (
          <div className="flex items-start gap-2">
            <Avatar role="assistant" />
            <div
              className="rounded-2xl rounded-tl-sm px-3.5 py-2.5"
              style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
            >
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: ACCENT }} />
            </div>
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="px-3 pb-2.5 flex flex-wrap gap-1.5">
          {EXAMPLE_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              className="text-[11px] px-2.5 py-1.5 rounded-full transition-colors"
              style={{ background: "var(--accent-soft)", color: ACCENT, cursor: "pointer" }}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1.5 p-2.5" style={{ borderTop: "1px solid var(--border)" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Describe the problem..."
          className="flex-1 text-sm px-3 py-2.5 rounded-xl outline-none min-w-0"
          style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border)" }}
        />
        <VoiceInputButton
          accent={ACCENT}
          onTranscript={(text) => setInput((prev) => (prev ? `${prev} ${text}` : text))}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          aria-label="Send"
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40"
          style={{ background: ACCENT, color: "#fff", cursor: "pointer" }}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function Avatar({ role }: { role: "user" | "assistant" }) {
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
      style={role === "assistant" ? { background: ACCENT, color: "#fff" } : { background: "var(--accent-soft)", color: ACCENT }}
    >
      {role === "assistant" ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
    </div>
  );
}

function MessageBubble({ message }: { message: DisplayMessage }) {
  const isUser = message.role === "user";
  const reply = message.structured;

  if (isUser) {
    return (
      <div className="flex items-start gap-2 justify-end">
        <div
          className="max-w-[80%] rounded-2xl rounded-tr-sm px-3.5 py-2 text-xs leading-relaxed"
          style={{ background: ACCENT, color: "#fff" }}
        >
          {message.content}
        </div>
        <Avatar role="user" />
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <Avatar role="assistant" />
      <div className="max-w-[88%] space-y-2">
        <div
          className="rounded-2xl rounded-tl-sm px-3.5 py-2 text-xs leading-relaxed"
          style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border)" }}
        >
          {reply?.message ?? message.content}
        </div>

        {!!reply?.quickFixSteps?.length && (
          <div className="rounded-xl p-2.5" style={{ background: "rgba(22,163,74,0.08)" }}>
            <p className="text-[9px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#16a34a" }}>
              Try this first
            </p>
            <ol className="space-y-1">
              {reply.quickFixSteps.map((step, i) => (
                <li key={i} className="text-[11px] flex items-start gap-1.5" style={{ color: "var(--ink)" }}>
                  <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: "#16a34a" }} />
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        {!!reply?.repairMatches?.length && (
          <div className="space-y-1.5">
            {reply.repairMatches.map((match) => {
              const service = repairServices.find((r) => r.id === match.id);
              if (!service) return null;
              return (
                <div
                  key={match.id}
                  className="rounded-xl p-2.5"
                  style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold" style={{ color: "var(--ink)" }}>
                      {service.issue}
                    </p>
                    <p className="text-xs font-bold" style={{ color: ACCENT }}>
                      {formatPrice(service.priceMin)}–{formatPrice(service.priceMax)}
                    </p>
                  </div>
                  <p className="text-[10px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                    {match.reason}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {!!reply?.productMatches?.length && (
          <div className="grid grid-cols-1 gap-1.5">
            {reply.productMatches.map((match) => {
              const gadget = gadgets.find((g) => g.id === match.id);
              if (!gadget) return null;
              return (
                <Link
                  key={match.id}
                  href="/buy"
                  className="rounded-xl p-2.5 no-underline block"
                  style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
                >
                  <p className="text-xs font-semibold" style={{ color: "var(--ink)" }}>
                    {gadget.name}
                  </p>
                  <p className="text-xs font-bold mb-0.5" style={{ color: "var(--ink)" }}>
                    {formatPrice(gadget.priceUkUsed)}
                  </p>
                  <span className="text-[10px] font-semibold inline-flex items-center gap-1" style={{ color: ACCENT }}>
                    View on TechNest <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        {reply?.suggestRepairerContact && (
          <a
            href="https://wa.me/2348186450477?text=Hi%2C%20I%20need%20help%20fixing%20my%20device%20%E2%80%94%20I%20was%20just%20chatting%20with%20the%20TechNest%20repair%20assistant."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold no-underline px-3.5 py-2 rounded-xl"
            style={{ background: "#25d366", color: "#fff" }}
          >
            <MessageCircle className="w-3.5 h-3.5" /> Talk to a repair partner
          </a>
        )}
      </div>
    </div>
  );
}
