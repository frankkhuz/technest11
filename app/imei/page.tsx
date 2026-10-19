"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ScanLine, ShieldAlert, CheckCircle2, AlertTriangle, FileUp, Undo2 } from "lucide-react";
import { apiJson, jsonBody, uploadFiles } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import type { ImeiCheckResult, StolenReport } from "@/app/types/backend";
import {
  PageShell,
  Card,
  Field,
  Button,
  ErrorText,
  EmptyState,
  Notice,
  StatusPill,
  fieldClass,
  fieldStyle,
  formatDate,
} from "@/app/component/ui/kit";
import { RowListSkeleton } from "@/app/component/ui/Skeleton";

const digits = (s: string) => s.replace(/\D/g, "");

function CheckTab() {
  const [imei, setImei] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<ImeiCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const check = async () => {
    if (digits(imei).length !== 15) return setError("An IMEI has 15 digits — dial *#06# on the phone.");
    setChecking(true);
    setError(null);
    setResult(null);
    const r = await apiJson<ImeiCheckResult>("/api/imei/check", jsonBody({ imei, deviceName: deviceName.trim() || undefined }));
    setChecking(false);
    if (!r.ok || !r.data) return setError(r.message);
    setResult(r.data);
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <Field label="IMEI" hint="Dial *#06# on the phone, or look in Settings → About. Spaces and dashes are fine.">
          <input
            value={imei}
            onChange={(e) => setImei(e.target.value.replace(/[^\d\s-]/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && check()}
            placeholder="e.g. 35 391110 123456 7"
            inputMode="numeric"
            className={`${fieldClass} font-mono-tech`}
            style={fieldStyle}
          />
        </Field>
        <Field label="What the seller says it is" optional hint="We'll tell you if the IMEI belongs to a different model.">
          <input value={deviceName} onChange={(e) => setDeviceName(e.target.value)} placeholder="e.g. iPhone 13 Pro" className={fieldClass} style={fieldStyle} />
        </Field>
        <ErrorText>{error}</ErrorText>
        <Button Icon={ScanLine} onClick={check} loading={checking}>
          Check IMEI
        </Button>
      </Card>

      {result && (
        <Card
          style={{
            border: `1.5px solid ${result.reportedStolen ? "#DC2626" : result.modelMatch === "mismatch" ? "#d97706" : "#16a34a"}`,
          }}
        >
          {result.reportedStolen ? (
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-8 h-8 flex-shrink-0" style={{ color: "#DC2626" }} />
              <div>
                <p className="text-base font-bold" style={{ color: "#DC2626" }}>
                  Reported stolen — don&apos;t buy this phone
                </p>
                <p className="text-sm mt-1" style={{ color: "var(--ink)" }}>
                  This IMEI (ending {result.imeiLast4}) has a {result.stolenReport?.status ?? "open"} stolen report
                  {result.stolenReport?.policeStation ? ` filed at ${result.stolenReport.policeStation}` : ""}
                  {result.stolenReport?.reportedAt ? ` on ${formatDate(result.stolenReport.reportedAt)}` : ""}. The owner has been told
                  it was checked.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              {result.modelMatch === "mismatch" ? (
                <AlertTriangle className="w-8 h-8 flex-shrink-0" style={{ color: "#d97706" }} />
              ) : (
                <CheckCircle2 className="w-8 h-8 flex-shrink-0" style={{ color: "#16a34a" }} />
              )}
              <div>
                <p className="text-base font-bold" style={{ color: "var(--ink)" }}>
                  {result.valid ? "Valid IMEI · not reported stolen" : "Not a valid IMEI"}
                </p>
                {result.device && (
                  <p className="text-sm mt-1" style={{ color: "var(--ink)" }}>
                    Belongs to: <strong>{result.device.brand} {result.device.model}</strong>
                  </p>
                )}
                {result.modelMatch === "mismatch" && (
                  <p className="text-sm mt-1" style={{ color: "#d97706" }}>
                    That&apos;s not a {deviceName} — ask the seller why, and check the phone&apos;s Settings.
                  </p>
                )}
                {result.modelMatch === "match" && (
                  <p className="text-sm mt-1" style={{ color: "#16a34a" }}>
                    Matches the model you entered.
                  </p>
                )}
                <p className="text-xs mt-2" style={{ color: "var(--ink-soft)" }}>
                  We never store the full IMEI for a check.
                </p>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function ReportsTab() {
  const router = useRouter();
  const { user } = useAuth();
  const [reports, setReports] = useState<StolenReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ imei: "", brand: "", model: "", policeStation: "", incidentDate: "", description: "" });
  const [extract, setExtract] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const r = await apiJson<{ reports: StolenReport[] }>("/api/imei/stolen-reports");
    setReports(r.data?.reports ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) load();
    else setLoading(false);
  }, [user]);

  if (!user) {
    return (
      <EmptyState
        Icon={ShieldAlert}
        title="Report a stolen phone"
        body="Reporting blocks its IMEI from being listed on TechNest, and we alert you if anyone checks it."
        action={<Button onClick={() => router.push("/auth/login?from=/imei?tab=reports")}>Sign in to report</Button>}
      />
    );
  }

  const submit = async () => {
    if (digits(form.imei).length !== 15) return setError("Enter the 15-digit IMEI (it's on the box or your receipt).");
    if (!form.brand.trim() || !form.model.trim() || !form.policeStation.trim()) return setError("Brand, model and police station are required.");
    if (!extract) return setError("Add a photo of the police extract.");
    setSaving(true);
    setError(null);
    try {
      const [doc] = await uploadFiles([extract]);
      const r = await apiJson(
        "/api/imei/stolen-reports",
        jsonBody({ ...form, incidentDate: form.incidentDate || undefined, description: form.description || undefined, policeReportUrl: doc.url })
      );
      if (!r.ok) return setError(r.message);
      setShowForm(false);
      setForm({ imei: "", brand: "", model: "", policeStation: "", incidentDate: "", description: "" });
      setExtract(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setSaving(false);
    }
  };

  const recovered = async (id: string) => {
    if (!window.confirm("Mark this phone as recovered? Its IMEI stops being blocked.")) return;
    const r = await apiJson(`/api/imei/stolen-reports/${id}/recovered`, { method: "PATCH" });
    if (r.ok) load();
    else setError(r.message);
  };

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="space-y-4">
      {!showForm ? (
        <Button variant="danger" Icon={ShieldAlert} onClick={() => setShowForm(true)}>
          Report my phone stolen
        </Button>
      ) : (
        <Card className="space-y-3">
          <Notice tone="amber">
            Your report blocks the IMEI straight away. An admin confirms it against the police extract — confirmed reports take down
            any listing with that IMEI.
          </Notice>
          <Field label="IMEI">
            <input value={form.imei} onChange={set("imei")} inputMode="numeric" className={`${fieldClass} font-mono-tech`} style={fieldStyle} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Brand">
              <input value={form.brand} onChange={set("brand")} placeholder="Apple" className={fieldClass} style={fieldStyle} />
            </Field>
            <Field label="Model">
              <input value={form.model} onChange={set("model")} placeholder="iPhone 13 Pro" className={fieldClass} style={fieldStyle} />
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Police station">
              <input value={form.policeStation} onChange={set("policeStation")} placeholder="Ikeja Police Division, Lagos" className={fieldClass} style={fieldStyle} />
            </Field>
            <Field label="When it happened" optional>
              <input type="date" value={form.incidentDate} onChange={set("incidentDate")} className={fieldClass} style={fieldStyle} />
            </Field>
          </div>
          <Field label="What happened" optional>
            <textarea value={form.description} onChange={set("description")} rows={2} className={`${fieldClass} resize-none`} style={fieldStyle} />
          </Field>
          <Field label="Police extract">
            <label
              className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm cursor-pointer"
              style={{ border: `1.5px dashed ${extract ? "#16a34a" : "var(--border)"}`, color: extract ? "#16a34a" : "var(--ink-soft)" }}
            >
              <FileUp className="w-4 h-4" /> {extract ? extract.name : "Upload a photo of the extract"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setExtract(e.target.files?.[0] ?? null)} />
            </label>
          </Field>
          <ErrorText>{error}</ErrorText>
          <div className="flex gap-2">
            <Button onClick={submit} loading={saving}>
              Submit report
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {loading ? (
        <RowListSkeleton count={2} />
      ) : reports.length === 0 ? (
        !showForm && <p className="text-sm" style={{ color: "var(--ink-soft)" }}>You haven&apos;t reported any phones.</p>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <Card key={r._id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                    {r.brand} {r.model}
                  </p>
                  <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                    IMEI ending {r.imeiLast4 ?? r.imei?.slice(-4)} · {r.policeStation} · reported {formatDate(r.createdAt)}
                  </p>
                  {r.reviewNotes && (
                    <p className="text-xs mt-1" style={{ color: "var(--ink)" }}>
                      {r.reviewNotes}
                    </p>
                  )}
                  {!!r.hits?.length && (
                    <p className="text-xs mt-1 font-semibold" style={{ color: "#DC2626" }}>
                      Checked or listed {r.hits.length} time{r.hits.length === 1 ? "" : "s"} since you reported it
                    </p>
                  )}
                </div>
                <StatusPill status={r.status} />
              </div>
              {(r.status === "pending" || r.status === "confirmed") && (
                <button
                  onClick={() => recovered(r._id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold mt-3"
                  style={{ color: "#16a34a", cursor: "pointer" }}
                >
                  <Undo2 className="w-3.5 h-3.5" /> I got it back
                </button>
              )}
            </Card>
          ))}
        </div>
      )}
      {!showForm && error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}

function ImeiContent() {
  const params = useSearchParams();
  const [tab, setTab] = useState<"check" | "reports">(params.get("tab") === "reports" ? "reports" : "check");
  return (
    <PageShell title="IMEI Check" Icon={ScanLine} subtitle="Free: is the number valid, which model is it, and has it been reported stolen?" width="max-w-2xl">
      <div className="flex gap-1 p-1 rounded-xl w-fit mb-5" style={{ background: "var(--border)" }}>
        {[
          { t: "check", label: "Check a phone" },
          { t: "reports", label: "My stolen reports" },
        ].map(({ t, label }) => (
          <button
            key={t}
            onClick={() => setTab(t as "check" | "reports")}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: tab === t ? "var(--accent)" : "transparent", color: tab === t ? "#fff" : "var(--ink-soft)" }}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "check" ? <CheckTab /> : <ReportsTab />}
    </PageShell>
  );
}

export default function ImeiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "var(--bg)" }} />}>
      <ImeiContent />
    </Suspense>
  );
}
