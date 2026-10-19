"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, IdCard, Camera, CheckCircle2, Clock, Lock, XCircle } from "lucide-react";
import { apiJson, jsonBody, uploadFiles } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { ID_TYPE_LABELS, type IdentityInfo } from "@/app/types/backend";
import {
  PageShell,
  Card,
  Field,
  Button,
  ErrorText,
  Notice,
  fieldClass,
  fieldStyle,
  formatDate,
  ACCENT,
} from "@/app/component/ui/kit";
import { PageSkeleton } from "@/app/component/ui/Skeleton";

type Bank = { name: string; code: string };

function FileTile({
  label,
  hint,
  Icon,
  file,
  onPick,
  capture,
}: {
  label: string;
  hint: string;
  Icon: typeof IdCard;
  file: File | null;
  onPick: (f: File | null) => void;
  capture?: "user" | "environment";
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <button
      type="button"
      onClick={() => ref.current?.click()}
      className="rounded-xl p-4 text-left flex items-center gap-3"
      style={{
        border: `1.5px dashed ${file ? "#16a34a" : "var(--border)"}`,
        background: "var(--bg)",
        cursor: "pointer",
      }}
    >
      {file ? (
        <img src={URL.createObjectURL(file)} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
      ) : (
        <div className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--accent-soft)", color: ACCENT }}>
          <Icon className="w-6 h-6" />
        </div>
      )}
      <span className="min-w-0">
        <span className="block text-sm font-semibold" style={{ color: "var(--ink)" }}>
          {label}
        </span>
        <span className="block text-xs" style={{ color: file ? "#16a34a" : "var(--ink-soft)" }}>
          {file ? file.name : hint}
        </span>
      </span>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        capture={capture}
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />
    </button>
  );
}

export default function VerifyIdentityPage() {
  const router = useRouter();
  const { user, isLoading, refreshUser } = useAuth();
  const [info, setInfo] = useState<IdentityInfo | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [fullName, setFullName] = useState("");
  const [idType, setIdType] = useState("nin_slip");
  const [idDoc, setIdDoc] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/auth/login?from=/account/verify");
      return;
    }
    setFullName((n) => n || user.name);
    apiJson<IdentityInfo>("/api/identity").then((r) => setInfo(r.data ?? { status: "none" }));
    apiJson<{ banks: Bank[] }>("/api/payout-account/banks").then((r) => setBanks(r.data?.banks ?? []));
  }, [isLoading, user, router]);

  const submit = async () => {
    setError(null);
    const bank = banks.find((b) => b.code === bankCode);
    if (!fullName.trim()) return setError("Enter your name exactly as it is on your ID.");
    if (!idDoc || !selfie) return setError("Add a photo of your ID and a selfie.");
    if (!bank) return setError("Pick your bank.");
    if (!/^\d{10}$/.test(accountNumber)) return setError("Enter your 10-digit account number.");

    setSaving(true);
    try {
      // Private uploads: only the public_id is sent back, never a URL.
      const [doc, face] = await uploadFiles([idDoc, selfie], "private");
      const r = await apiJson<IdentityInfo>(
        "/api/identity",
        jsonBody({
          fullName: fullName.trim(),
          idType,
          idDocumentId: doc.publicId,
          selfieId: face.publicId,
          bankCode,
          bankName: bank.name,
          accountNumber,
        })
      );
      if (!r.ok) return setError(r.message);
      setInfo(r.data ?? { status: "pending" });
      setRetry(false);
      refreshUser();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed — please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!info) {
    return (
      <PageShell title="Get verified" Icon={ShieldCheck}>
        <PageSkeleton />
      </PageShell>
    );
  }

  const showForm = info.status === "none" || (info.status === "rejected" && retry);

  return (
    <PageShell
      title="Get verified"
      Icon={ShieldCheck}
      subtitle="A free identity check. Verified sellers get a badge buyers trust — and their listings stand out."
      width="max-w-2xl"
    >
      {info.status === "verified" && (
        <Card className="text-center py-10">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3" style={{ color: "#1d9bf0" }} />
          <p className="text-lg font-bold" style={{ color: "var(--ink)", fontFamily: "Space Grotesk, sans-serif" }}>
            You&apos;re verified
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
            {info.fullName} · {ID_TYPE_LABELS[info.idType ?? ""] ?? info.idType}
          </p>
        </Card>
      )}

      {info.status === "pending" && (
        <Card className="text-center py-10">
          <Clock className="w-12 h-12 mx-auto mb-3" style={{ color: "#d97706" }} />
          <p className="text-lg font-bold" style={{ color: "var(--ink)", fontFamily: "Space Grotesk, sans-serif" }}>
            Being reviewed
          </p>
          <p className="text-sm mt-1 max-w-sm mx-auto" style={{ color: "var(--ink-soft)" }}>
            Submitted {formatDate(info.submittedAt)}. We&apos;ll notify you as soon as it&apos;s checked — usually within a day.
          </p>
          {info.bankName && (
            <p className="text-xs mt-3" style={{ color: "var(--ink-soft)" }}>
              {info.bankName} ····{info.accountLast4}
            </p>
          )}
        </Card>
      )}

      {info.status === "rejected" && !retry && (
        <Card className="text-center py-10">
          <XCircle className="w-12 h-12 mx-auto mb-3" style={{ color: "#DC2626" }} />
          <p className="text-lg font-bold" style={{ color: "var(--ink)", fontFamily: "Space Grotesk, sans-serif" }}>
            Not approved
          </p>
          <p className="text-sm mt-1 max-w-sm mx-auto mb-5" style={{ color: "var(--ink-soft)" }}>
            {info.rejectionReason ?? "We couldn't confirm your identity from those photos."}
          </p>
          <Button onClick={() => setRetry(true)}>Try again</Button>
        </Card>
      )}

      {showForm && (
        <div className="space-y-4">
          <Card className="space-y-4">
            <Field label="Full name (as on your ID)">
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={fieldClass} style={fieldStyle} />
            </Field>
            <Field label="ID type">
              <select value={idType} onChange={(e) => setIdType(e.target.value)} className={fieldClass} style={{ ...fieldStyle, cursor: "pointer" }}>
                {Object.entries(ID_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid sm:grid-cols-2 gap-3">
              <FileTile label="Photo of your ID" hint="All four corners, readable" Icon={IdCard} file={idDoc} onPick={setIdDoc} capture="environment" />
              <FileTile label="A selfie" hint="Face the camera, good light" Icon={Camera} file={selfie} onPick={setSelfie} capture="user" />
            </div>
          </Card>
          <Card className="space-y-4">
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                Your bank account
              </p>
              <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                We check the account name matches the name on your ID.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <select value={bankCode} onChange={(e) => setBankCode(e.target.value)} className={fieldClass} style={{ ...fieldStyle, cursor: "pointer" }}>
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
                inputMode="numeric"
                className={fieldClass}
                style={fieldStyle}
              />
            </div>
          </Card>
          <Notice tone="neutral">
            <span className="inline-flex items-start gap-1">
              <Lock className="w-3 h-3 mt-0.5 flex-shrink-0" /> Your ID and selfie are stored privately. Only TechNest reviewers can
              open them, through short-lived links.
            </span>
          </Notice>
          <ErrorText>{error}</ErrorText>
          <Button onClick={submit} loading={saving} Icon={ShieldCheck} full>
            Submit for review
          </Button>
        </div>
      )}
    </PageShell>
  );
}
