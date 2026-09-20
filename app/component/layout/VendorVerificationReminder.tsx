"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";

const ACCENT = "#C2542D";
const DISMISS_KEY = "tn_vendor_reminder_dismissed";

function readDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export default function VendorVerificationReminder() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [dismissed, setDismissed] = useState(readDismissed);

  const isUnverifiedVendor = user?.userType === "vendor" && !user.vendorVerified;
  const open = !isLoading && isUnverifiedVendor && !dismissed;

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore — private browsing / storage blocked
    }
    setDismissed(true);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={dismiss}
    >
      <div
        className="rounded-2xl w-full max-w-sm p-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "var(--accent-soft)", color: ACCENT }}
        >
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h3
          className="text-lg font-bold text-center mb-1"
          style={{ color: "var(--ink)", fontFamily: "Space Grotesk, sans-serif" }}
        >
          You&apos;re browsing as a vendor
        </h3>
        <p className="text-sm text-center mb-6" style={{ color: "var(--ink-soft)" }}>
          Complete your vendor profile — business details and shop address — to get verified and
          unlock your vendor dashboard, swap requests, and buy leads.
        </p>
        <div className="space-y-2">
          <button
            onClick={() => {
              dismiss();
              router.push("/become-vendor");
            }}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: ACCENT, color: "#fff", cursor: "pointer" }}
          >
            Complete My Profile
          </button>
          <button
            onClick={dismiss}
            className="w-full py-2 text-xs"
            style={{ color: "var(--ink-soft)", cursor: "pointer" }}
          >
            Maybe later — let me browse first
          </button>
        </div>
      </div>
    </div>
  );
}
