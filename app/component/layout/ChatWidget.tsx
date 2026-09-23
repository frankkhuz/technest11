"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";

type ChatMessage = { role: "user" | "assistant"; content: string };

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
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: data.error || "Something went wrong." },
        ]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
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
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
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
