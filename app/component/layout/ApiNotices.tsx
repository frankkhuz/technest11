"use client";

// One place that reacts to the backend errors every screen shares:
//  • email_not_verified → the message + a "Resend confirmation email" button
//  • service_unavailable → "Temporarily unavailable" with a retry
//  • 401 "You've been signed out" → back to /auth/login
// plus a slim banner when GET /api/health says the API is down.

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { MailWarning, CloudOff, RotateCcw, X, CheckCircle2 } from "lucide-react";
import { API_ERROR_EVENT, apiJson, type ApiErrorDetail } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { loginHref } from "@/app/lib/auth";
import { Modal, Button, ACCENT } from "@/app/component/ui/kit";

export function ResendVerificationButton({ full }: { full?: boolean }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [msg, setMsg] = useState<string | null>(null);

  const resend = async () => {
    setState("sending");
    const res = await apiJson("/api/auth/resend-verification", { method: "POST" });
    setMsg(res.message || (res.ok ? "Confirmation email sent — check your inbox." : null));
    setState(res.ok ? "sent" : "idle");
  };

  return (
    <div className={full ? "w-full" : undefined}>
      <Button
        onClick={resend}
        loading={state === "sending"}
        disabled={state === "sent"}
        Icon={state === "sent" ? CheckCircle2 : MailWarning}
        full={full}
      >
        {state === "sent" ? "Email sent" : "Resend confirmation email"}
      </Button>
      {msg && (
        <p className="text-xs mt-2" style={{ color: state === "sent" ? "#16a34a" : "#DC2626" }}>
          {msg}
        </p>
      )}
    </div>
  );
}

export default function ApiNotices() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const { clearSession } = useAuth();
  const [unverified, setUnverified] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState<ApiErrorDetail | null>(null);
  const [healthDown, setHealthDown] = useState(false);
  const redirecting = useRef(false);

  const onError = useCallback(
    (e: Event) => {
      const detail = (e as CustomEvent<ApiErrorDetail>).detail;
      if (detail.code === "email_not_verified") {
        setUnverified(detail.message || "Please confirm your email address to do this.");
      } else if (detail.code === "service_unavailable") {
        setUnavailable(detail);
      } else if (detail.code === "signed_out" && !redirecting.current) {
        redirecting.current = true;
        clearSession();
        router.push(loginHref(pathname));
        setTimeout(() => (redirecting.current = false), 3000);
      }
    },
    [clearSession, router, pathname]
  );

  useEffect(() => {
    window.addEventListener(API_ERROR_EVENT, onError);
    return () => window.removeEventListener(API_ERROR_EVENT, onError);
  }, [onError]);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json().then((b) => setHealthDown(!r.ok || b?.data?.status === "down")))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!unavailable) return;
    const t = setTimeout(() => setUnavailable(null), 12000);
    return () => clearTimeout(t);
  }, [unavailable]);

  return (
    <>
      {healthDown && (
        <div
          className="fixed top-0 inset-x-0 z-[70] text-center text-xs font-medium px-4 py-1.5"
          style={{ background: "#d97706", color: "#fff" }}
          role="status"
        >
          TechNest is having trouble right now — some things may not load. We&apos;re on it.
          <button
            onClick={() => setHealthDown(false)}
            aria-label="Dismiss"
            className="ml-2 align-middle"
            style={{ cursor: "pointer" }}
          >
            <X className="w-3.5 h-3.5 inline" />
          </button>
        </div>
      )}

      <Modal
        open={!!unverified}
        onClose={() => setUnverified(null)}
        title="Confirm your email first"
        Icon={MailWarning}
        width="max-w-sm"
      >
        <p className="text-sm mb-5" style={{ color: "var(--ink-soft)" }}>
          {unverified} We sent a confirmation link when you signed up — open it, then try again.
        </p>
        <ResendVerificationButton full />
        <button
          onClick={() => setUnverified(null)}
          className="w-full py-2 mt-2 text-xs"
          style={{ color: "var(--ink-soft)", cursor: "pointer" }}
        >
          Close
        </button>
      </Modal>

      <AnimatePresence>
        {unavailable && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-[65] rounded-2xl p-4 shadow-xl flex items-start gap-3"
            style={{
              bottom: "calc(84px + env(safe-area-inset-bottom))",
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
            role="alert"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(217,119,6,0.12)", color: "#d97706" }}
            >
              <CloudOff className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                Temporarily unavailable — try again
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>
                {unavailable.message}
                {unavailable.retryAfter ? ` Try again in about ${unavailable.retryAfter}s.` : ""}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-1 text-xs font-semibold mt-2"
                style={{ color: ACCENT, cursor: "pointer" }}
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retry
              </button>
            </div>
            <button
              onClick={() => setUnavailable(null)}
              aria-label="Dismiss"
              style={{ color: "var(--ink-soft)", cursor: "pointer" }}
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
