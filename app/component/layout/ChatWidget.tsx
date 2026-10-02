"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircle, X, Send, Loader2, Sparkles, MessageSquareText } from "lucide-react";
import { apiFetch } from "@/app/lib/api";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  links?: { label: string; href: string }[];
  whatsapp?: string;
};

const ACCENT = "#C2542D";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm the TechNest assistant. Ask me about selling, swapping, buying, or how valuation and IMEI checks work.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await apiFetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: data.message || "Something went wrong." },
        ]);
      } else {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: data.data.reply,
            links: data.data.links,
            whatsapp: data.data.whatsapp,
          },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Network error — please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-3">
      {open && (
        <div
          className="w-[min(92vw,360px)] h-[min(70vh,520px)] rounded-2xl overflow-hidden flex flex-col shadow-2xl"
          style={{
            background: "#fff",
            border: "1px solid rgba(10,10,10,0.1)",
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ background: ACCENT }}
          >
            <div className="flex items-center gap-2 text-white text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              TechNest Assistant
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5"
            style={{ background: "#FAFAFA" }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col gap-1.5 ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className="max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed"
                  style={
                    m.role === "user"
                      ? { background: ACCENT, color: "#fff" }
                      : {
                          background: "#fff",
                          color: "#0A0A0A",
                          border: "1px solid rgba(10,10,10,0.08)",
                        }
                  }
                >
                  {m.content}
                </div>
                {!!m.links?.length && (
                  <div className="flex flex-wrap gap-1.5 max-w-[85%]">
                    {m.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-lg no-underline"
                        style={{ background: "rgba(194,84,45,0.1)", color: ACCENT }}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
                {m.whatsapp && (
                  <a
                    href={`https://wa.me/${m.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg no-underline"
                    style={{ background: "#25d366", color: "#fff" }}
                  >
                    <MessageSquareText className="w-3.5 h-3.5" /> Chat with a person
                  </a>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div
                  className="rounded-xl px-3 py-2"
                  style={{
                    background: "#fff",
                    border: "1px solid rgba(10,10,10,0.08)",
                  }}
                >
                  <Loader2
                    className="w-4 h-4 animate-spin"
                    style={{ color: ACCENT }}
                  />
                </div>
              </div>
            )}
          </div>

          <div
            className="flex items-center gap-2 p-2.5 flex-shrink-0"
            style={{ borderTop: "1px solid rgba(10,10,10,0.08)" }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask something..."
              className="flex-1 text-sm px-3 py-2 rounded-lg outline-none"
              style={{
                background: "#FAFAFA",
                color: "#0A0A0A",
                border: "1px solid rgba(10,10,10,0.1)",
              }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 disabled:opacity-40"
              style={{ background: ACCENT, color: "#fff", cursor: "pointer" }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close assistant" : "Open assistant"}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        style={{ background: ACCENT, color: "#fff", cursor: "pointer" }}
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
}
