"use client";

import { useEffect, useState } from "react";
import { Landmark, CheckCircle2, Loader2 } from "lucide-react";

const ACCENT = "#C2542D";

type Bank = { id: number; name: string; code: string };
type ExistingAccount = { bankName: string; accountName: string; accountNumberMasked: string };

export default function PayoutSetupCard() {
  const [existing, setExisting] = useState<ExistingAccount | null | undefined>(undefined);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ accountName: string; bankName: string } | null>(null);

  useEffect(() => {
    fetch("/api/payout-account")
      .then((r) => r.json())
      .then((d) => setExisting(d.account ?? null))
      .catch(() => setExisting(null));
    fetch("/api/payout-account/banks")
      .then((r) => r.json())
      .then((d) => setBanks(d.banks ?? []))
      .catch(() => {});
  }, []);

  const handleSubmit = async () => {
    setError(null);
    const bank = banks.find((b) => b.code === bankCode);
    if (!bank) return setError("Select your bank.");
    if (!/^\d{10}$/.test(accountNumber)) return setError("Enter a valid 10-digit account number.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/payout-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankCode, bankName: bank.name, accountNumber }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not set up payouts.");
        setSubmitting(false);
        return;
      }
      setSuccess({ accountName: data.accountName, bankName: data.bankName });
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Still loading whether an account already exists — render nothing to
  // avoid a flash of the setup form before we know.
  if (existing === undefined) return null;

  if (existing || success) {
    const bankName = success?.bankName ?? existing?.bankName;
    const accountLabel = success ? success.accountName : `${existing?.accountName} (${existing?.accountNumberMasked})`;
    return (
      <div
        className="rounded-2xl p-4 flex items-center gap-3"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(22,163,74,0.1)", color: "#16a34a" }}
        >
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
            Payouts set up — {bankName}
          </p>
          <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
            {accountLabel} · marketplace sales pay out here automatically
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Landmark className="w-4 h-4" style={{ color: ACCENT }} />
        <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
          Set up payouts
        </p>
      </div>
      <p className="text-xs mb-4" style={{ color: "var(--ink-soft)" }}>
        Add your bank account so buyers can pay you directly through TechNest checkout instead of
        negotiating on WhatsApp. Your listed price goes straight to this account.
      </p>

      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <select
          value={bankCode}
          onChange={(e) => setBankCode(e.target.value)}
          className="text-sm px-3.5 py-2.5 rounded-xl outline-none"
          style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border)" }}
        >
          <option value="">Select your bank</option>
          {banks.map((b) => (
            <option key={b.code} value={b.code}>
              {b.name}
            </option>
          ))}
        </select>
        <input
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
          placeholder="10-digit account number"
          className="text-sm px-3.5 py-2.5 rounded-xl outline-none"
          style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border)" }}
        />
      </div>

      {error && (
        <p className="text-xs mb-3" style={{ color: "#DC2626" }}>
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="text-sm font-semibold px-5 py-2.5 rounded-xl inline-flex items-center gap-2 disabled:opacity-40"
        style={{ background: ACCENT, color: "#fff", cursor: "pointer" }}
      >
        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
        Save Payout Details
      </button>
    </div>
  );
}
