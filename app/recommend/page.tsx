"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  History,
  MessageSquarePlus,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import Navbar from "../component/layout/Navbar";
import { useAuth } from "../hooks/useAuth";
import {
  gadgets,
  gadgetCategories,
  formatPrice,
  type GadgetCategoryKey,
} from "../data/gadget";

const ACCENT = "#C2542D";

type RecommenderReply = {
  type: "question" | "recommendation";
  message: string;
  catalogMatches?: { id: string; reason: string }[];
  generalSuggestions?: { name: string; reason: string }[];
};

type DisplayMessage = {
  role: "user" | "assistant";
  content: string;
  structured?: RecommenderReply;
  synthetic?: boolean;
};

type HistoryItem = { id: string; title: string; updatedAt: string };

const GREETING: DisplayMessage = {
  role: "assistant",
  content: "",
  synthetic: true,
  structured: {
    type: "question",
    message:
      "Tell me what you're trying to do — e.g. \"I want 4 cameras for my house\" or \"I need a camera to cover a wedding\" — and I'll ask a couple of quick questions before recommending real gadgets.",
  },
};

const EXAMPLE_PROMPTS = [
  "I want 4 cameras for my house",
  "I need a camera to cover a wedding, something mobile",
  "My area has no 24/7 light — what do I need to keep my devices charged?",
];

function categoryLabel(id: GadgetCategoryKey) {
  return gadgetCategories.find((c) => c.id === id)?.label ?? id;
}

function parseAssistantContent(content: string): RecommenderReply {
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed.message === "string") return parsed;
  } catch {
    // fall through
  }
  return { type: "recommendation", message: content };
}

export default function RecommendPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [messages, setMessages] = useState<DisplayMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }
    fetch("/api/gadget-recommend/history")
      .then((res) => (res.ok ? res.json() : { conversations: [] }))
      .then((data) => setHistory(data.conversations ?? []))
      .catch(() => setHistory([]));
  }, [user]);

  const loadConversation = async (id: string) => {
    setLoading(true);
    setHistoryOpen(false);
    try {
      const res = await fetch(`/api/gadget-recommend/${id}`);
      if (!res.ok) throw new Error("not found");
      const data = await res.json();
      const loaded: DisplayMessage[] = (data.messages ?? []).map(
        (m: { role: "user" | "assistant"; content: string }) => ({
          role: m.role,
          content: m.content,
          structured: m.role === "assistant" ? parseAssistantContent(m.content) : undefined,
        })
      );
      setMessages(loaded.length ? loaded : [GREETING]);
      setConversationId(id);
    } catch {
      // leave current conversation as-is if the load fails
    } finally {
      setLoading(false);
    }
  };

  const startNewConversation = () => {
    setMessages([GREETING]);
    setConversationId(undefined);
    setHistoryOpen(false);
  };

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
      const res = await fetch("/api/gadget-recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...apiHistory, { role: "user", content: text }],
          conversationId,
        }),
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
        const reply: RecommenderReply = data.reply;
        setMessages((m) => [
          ...m,
          { role: "assistant", content: JSON.stringify(reply), structured: reply },
        ]);
        if (data.conversationId) {
          const isNew = !conversationId;
          setConversationId(data.conversationId);
          if (isNew && user) {
            setHistory((h) => [
              { id: data.conversationId, title: text.slice(0, 80), updatedAt: new Date().toISOString() },
              ...h,
            ]);
          }
        }
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
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5" style={{ color: ACCENT }} />
              <h1 className="text-2xl font-bold" style={{ color: "var(--ink)" }}>
                AI Gadget Recommender
              </h1>
            </div>
            <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
              Describe what you need — the AI asks follow-up questions, then recommends real
              gadgets.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {user && (
              <button
                onClick={() => setHistoryOpen((v) => !v)}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                style={{
                  background: historyOpen ? "var(--accent-soft)" : "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--ink)",
                  cursor: "pointer",
                }}
                aria-label="Past conversations"
              >
                <History className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={startNewConversation}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--ink)",
                cursor: "pointer",
              }}
              aria-label="New conversation"
            >
              <MessageSquarePlus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!authLoading && !user && (
          <div
            className="mb-4 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2"
            style={{ background: "var(--accent-soft)", color: "var(--ink)" }}
          >
            <HelpCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: ACCENT }} />
            <span>
              You&apos;re browsing as a guest — the AI still works, but{" "}
              <button
                onClick={() => router.push("/auth/login")}
                className="font-semibold underline"
                style={{ color: ACCENT, cursor: "pointer" }}
              >
                sign in
              </button>{" "}
              to save your conversations to your account.
            </span>
          </div>
        )}

        {historyOpen && user && (
          <div
            className="mb-4 rounded-xl overflow-hidden"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            {history.length === 0 ? (
              <p className="text-xs px-4 py-3" style={{ color: "var(--ink-soft)" }}>
                No saved conversations yet.
              </p>
            ) : (
              history.map((h) => (
                <button
                  key={h.id}
                  onClick={() => loadConversation(h.id)}
                  className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                  style={{
                    color: "var(--ink)",
                    borderBottom: "1px solid var(--border)",
                    cursor: "pointer",
                    background: conversationId === h.id ? "var(--accent-soft)" : "transparent",
                  }}
                >
                  {h.title}
                </button>
              ))
            )}
          </div>
        )}

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
                  style={{
                    background: "var(--accent-soft)",
                    color: ACCENT,
                    cursor: "pointer",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          <div
            className="flex items-center gap-2 p-3"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Describe what you need..."
              className="flex-1 text-sm px-3.5 py-2.5 rounded-xl outline-none"
              style={{
                background: "var(--bg)",
                color: "var(--ink)",
                border: "1px solid var(--border)",
              }}
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
      style={
        role === "assistant"
          ? { background: ACCENT, color: "#fff" }
          : { background: "var(--accent-soft)", color: ACCENT }
      }
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

        {!!reply?.catalogMatches?.length && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {reply.catalogMatches.map((match) => {
              const gadget = gadgets.find((g) => g.id === match.id);
              if (!gadget) return null;
              return (
                <div
                  key={match.id}
                  className="rounded-xl p-3"
                  style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: "var(--accent-soft)", color: ACCENT }}
                    >
                      {categoryLabel(gadget.gadgetCategory)}
                    </span>
                    {gadget.badge && (
                      <span className="text-[10px] font-medium" style={{ color: "var(--ink-soft)" }}>
                        {gadget.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                    {gadget.name}
                  </p>
                  <p className="text-xs mb-1.5" style={{ color: "var(--ink-soft)" }}>
                    {gadget.spec}
                  </p>
                  <p className="text-sm font-bold mb-1.5" style={{ color: "var(--ink)" }}>
                    {formatPrice(gadget.priceUkUsed)}
                    <span className="text-xs font-normal" style={{ color: "var(--ink-soft)" }}>
                      {" "}
                      – {formatPrice(gadget.priceBrandNew)}
                    </span>
                  </p>
                  <p className="text-xs mb-2 leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                    {match.reason}
                  </p>
                  <a
                    href="/buy"
                    className="text-xs font-semibold inline-flex items-center gap-1"
                    style={{ color: ACCENT }}
                  >
                    View on TechNest <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              );
            })}
          </div>
        )}

        {!!reply?.generalSuggestions?.length && (
          <div
            className="rounded-xl p-3 space-y-2"
            style={{ background: "var(--accent-soft)" }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: ACCENT }}>
              Also worth considering
            </p>
            {reply.generalSuggestions.map((s, i) => (
              <div key={i}>
                <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                  {s.name}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                  {s.reason}
                </p>
              </div>
            ))}
            <p className="text-[11px] italic pt-1" style={{ color: "var(--ink-soft)" }}>
              Not in our catalog yet — ask a vendor via WhatsApp to source it for you.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
