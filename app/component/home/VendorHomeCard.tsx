"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Check,
  Clock,
  LayoutDashboard,
  Package,
  Send,
  Settings,
  ShieldCheck,
  Store,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type { AuthUser } from "@/app/lib/auth";
import { apiJson } from "@/app/lib/api";
import { RatingBadge } from "@/app/component/ui/kit";

type VendorSummary = {
  newRequests?: number;
  pendingOrders?: number;
  unreadNotifications?: number;
  activeListings?: number;
  rating?: { average: number; count: number } | null;
};

const ACCENT = "#C2542D";
const CARD_BG = "linear-gradient(135deg, #1A1520, #241C22)";

type StepState = "done" | "current" | "todo";

function Steps({ steps }: { steps: { label: string; state: StepState }[] }) {
  return (
    <ol className="grid grid-cols-3 gap-2 mt-5">
      {steps.map(({ label, state }, i) => (
        <li key={label} className="min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
              style={
                state === "done"
                  ? { background: "#16a34a", color: "#fff" }
                  : state === "current"
                    ? { background: ACCENT, color: "#fff", boxShadow: "0 0 0 4px rgba(194,84,45,0.25)" }
                    : { background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }
              }
            >
              {state === "done" ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : i + 1}
            </span>
            {i < steps.length - 1 && (
              <span
                className="h-0.5 flex-1 rounded-full"
                style={{ background: state === "done" ? "#16a34a" : "rgba(255,255,255,0.12)" }}
              />
            )}
          </div>
          <p
            className="text-[11px] sm:text-xs leading-tight"
            style={{ color: state === "todo" ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.85)" }}
          >
            {label}
          </p>
        </li>
      ))}
    </ol>
  );
}

function CardButton({ onClick, children, primary }: { onClick: () => void; children: React.ReactNode; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-xl text-sm font-semibold whitespace-nowrap"
      style={
        primary
          ? { background: ACCENT, color: "#fff" }
          : { background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.14)" }
      }
    >
      {children}
    </button>
  );
}

/**
 * The home page's vendor section for someone who is already a vendor —
 * instead of pitching "Become a vendor" again:
 * - application not finished → finish it
 * - submitted, awaiting approval → status + what they can do meanwhile
 * - verified → shortcuts into their vendor hub and profile
 */
export default function VendorHomeCard({ user }: { user: AuthUser }) {
  const router = useRouter();
  const profile = user.vendorProfile;
  // Prefer the backend's explicit application status; fall back to the old
  // "has a vendor phone" heuristic on backends that don't send it yet.
  const appStatus =
    user.vendorApplication?.status ??
    (user.vendorVerified ? "approved" : profile?.phone ? "submitted" : "not_started");
  const submitted = appStatus === "submitted";

  // Badge counts for verified vendors (GET /api/vendor/summary). Optional:
  // if the endpoint isn't there, the shortcuts simply show no badges.
  const [summary, setSummary] = useState<VendorSummary | null>(null);
  useEffect(() => {
    if (!user.vendorVerified) return;
    let cancelled = false;
    apiJson<VendorSummary>("/api/vendor/summary").then((r) => {
      if (!cancelled && r.ok && r.data) setSummary(r.data);
    });
    return () => {
      cancelled = true;
    };
  }, [user.vendorVerified]);
  const idState = user.identityVerified ? "verified" : (user.identityStatus ?? "none");
  const name = profile?.businessName || user.name?.split(" ")[0] || "your shop";

  // ── Verified vendor: their hub, not a pitch ──────────────────────────────
  if (user.vendorVerified) {
    const links: { label: string; href: string; Icon: LucideIcon; badge?: number }[] = [
      { label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard, badge: summary?.unreadNotifications },
      { label: "Requests", href: "/requests", Icon: Send, badge: summary?.newRequests },
      { label: "Orders", href: "/orders", Icon: Package, badge: summary?.pendingOrders },
      { label: "Profile", href: "/account", Icon: Settings },
    ];
    const trustTodo = [
      !user.identityVerified && idState !== "pending" && { label: "Verify your ID", href: "/account/verify" },
      !user.phoneVerified && { label: "Verify your phone", href: "/account" },
    ].filter(Boolean) as { label: string; href: string }[];

    return (
      <div className="rounded-2xl p-5 sm:p-8" style={{ background: CARD_BG }}>
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(194,84,45,0.18)", color: ACCENT }}
          >
            <Store className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-lg sm:text-xl text-white truncate flex items-center gap-1.5">
              <span className="truncate">{name}</span>
              <BadgeCheck className="w-5 h-5 flex-shrink-0" style={{ color: "#1d9bf0" }} aria-label="Verified vendor" />
            </h3>
            <p className="text-white/60 text-sm">
              Verified vendor{profile?.city ? ` · ${profile.city}` : ""}
              {summary?.activeListings !== undefined
                ? ` · ${summary.activeListings} active listing${summary.activeListings === 1 ? "" : "s"}`
                : " — here's your shop at a glance."}
            </p>
            {summary?.rating && summary.rating.count > 0 && (
              <div className="mt-1 [&_*]:!text-white/90">
                <RatingBadge rating={summary.rating} />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-5">
          {links.map(({ label, href, Icon, badge }) => (
            <button
              key={href}
              onClick={() => router.push(href)}
              className="relative flex flex-col items-center justify-center gap-1.5 rounded-xl py-3 min-h-[68px]"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
              aria-label={badge ? `${label} (${badge} new)` : label}
            >
              {!!badge && badge > 0 && (
                <span
                  className="num absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ background: ACCENT, color: "#fff" }}
                >
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
              <Icon className="w-5 h-5" style={{ color: ACCENT }} />
              <span className="text-[11px] sm:text-xs font-medium text-white/85">{label}</span>
            </button>
          ))}
        </div>

        {trustTodo.length > 0 && (
          <div
            className="mt-4 rounded-xl px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-2"
            style={{ background: "rgba(29,155,240,0.1)", border: "1px solid rgba(29,155,240,0.25)" }}
          >
            <ShieldCheck className="w-4 h-4 flex-shrink-0" style={{ color: "#1d9bf0" }} />
            <span className="text-xs text-white/80 flex-1 min-w-[10rem]">Buyers trust fully verified sellers more.</span>
            {trustTodo.map((t) => (
              <button
                key={t.href + t.label}
                onClick={() => router.push(t.href)}
                className="text-xs font-semibold underline underline-offset-2"
                style={{ color: "#7cc4f8" }}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Application rejected: say why and let them fix it ────────────────────
  if (appStatus === "rejected") {
    const reason = user.vendorApplication?.rejectionReason;
    return (
      <div className="rounded-2xl p-5 sm:p-8" style={{ background: CARD_BG }}>
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(220,38,38,0.18)", color: "#f87171" }}
          >
            <XCircle className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-lg sm:text-xl text-white">Your vendor application needs changes</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              {reason ? (
                <>
                  TechNest&apos;s note: <span className="text-white/85">&ldquo;{reason}&rdquo;</span>
                </>
              ) : (
                "TechNest couldn't approve your application as submitted."
              )}{" "}
              Update your details and send it again.
            </p>
          </div>
        </div>
        <Steps
          steps={[
            { label: "Vendor account", state: "done" },
            { label: "Fix business details", state: "current" },
            { label: "TechNest approval", state: "todo" },
          ]}
        />
        <div className="flex flex-wrap gap-2 mt-5">
          <CardButton primary onClick={() => router.push("/become-vendor")}>
            Fix and resubmit →
          </CardButton>
        </div>
      </div>
    );
  }

  // ── Applied, waiting for TechNest approval ───────────────────────────────
  if (submitted) {
    return (
      <div className="rounded-2xl p-5 sm:p-8" style={{ background: CARD_BG }}>
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(217,119,6,0.18)", color: "#f59e0b" }}
          >
            <Clock className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-lg sm:text-xl text-white">Your vendor application is under review</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              We&apos;re checking {profile?.businessName ? <strong className="text-white/80">{profile.businessName}</strong> : "your business details"}.
              {idState === "verified" || idState === "pending"
                ? " You'll be notified as soon as you're approved."
                : " Verifying your ID now usually speeds up approval."}
            </p>
          </div>
        </div>
        <Steps
          steps={[
            { label: "Business details", state: "done" },
            {
              label: idState === "pending" ? "ID check in review" : idState === "rejected" ? "Re-upload ID" : "Verify your ID",
              state: idState === "verified" ? "done" : "current",
            },
            { label: "TechNest approval", state: idState === "verified" ? "current" : "todo" },
          ]}
        />
        <div className="flex flex-wrap gap-2 mt-5">
          {idState !== "verified" && idState !== "pending" && (
            <CardButton primary onClick={() => router.push("/account/verify")}>
              <ShieldCheck className="w-4 h-4" /> {idState === "rejected" ? "Re-verify ID" : "Verify my ID"}
            </CardButton>
          )}
          <CardButton primary={idState === "verified" || idState === "pending"} onClick={() => router.push("/become-vendor")}>
            View application
          </CardButton>
        </div>
      </div>
    );
  }

  // ── Vendor account, application not finished ────────────────────────────
  return (
    <div className="rounded-2xl p-5 sm:p-8" style={{ background: CARD_BG }}>
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(194,84,45,0.18)", color: ACCENT }}
        >
          <Store className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-lg sm:text-xl text-white">Finish setting up your vendor account</h3>
          <p className="text-white/60 text-sm leading-relaxed">
            Add your business details to start getting buy leads, swap requests and customer requests.
          </p>
        </div>
      </div>
      <Steps
        steps={[
          { label: "Vendor account", state: "done" },
          { label: "Business details", state: "current" },
          { label: "TechNest approval", state: "todo" },
        ]}
      />
      <div className="flex flex-wrap gap-2 mt-5">
        <CardButton primary onClick={() => router.push("/become-vendor")}>
          Complete my application →
        </CardButton>
      </div>
    </div>
  );
}
