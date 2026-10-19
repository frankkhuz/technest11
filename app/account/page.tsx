"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  Mail,
  Phone,
  ShieldCheck,
  Bell,
  Megaphone,
  LogOut,
  Download,
  Trash2,
  MessageCircle,
  ChevronRight,
  Star,
  Scale,
  ScanLine,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { apiFetch, apiJson, jsonBody } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { isValidNigerianPhone, NIGERIA_PHONE_TITLE } from "@/app/lib/validation";
import type { IdentityInfo, PhoneInfo } from "@/app/types/backend";
import { ResendVerificationButton } from "@/app/component/layout/ApiNotices";
import {
  PageShell,
  Card,
  Button,
  Pill,
  Modal,
  Field,
  ErrorText,
  Notice,
  fieldClass,
  fieldStyle,
  ACCENT,
} from "@/app/component/ui/kit";
import { PageSkeleton } from "@/app/component/ui/Skeleton";

function Row({
  Icon,
  title,
  desc,
  right,
  children,
}: {
  Icon: LucideIcon;
  title: string;
  desc?: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="py-4 first:pt-0 last:pb-0" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--accent-soft)", color: ACCENT }}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
            {title}
          </p>
          {desc && (
            <div className="text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>
              {desc}
            </div>
          )}
        </div>
        {right && <div className="flex-shrink-0">{right}</div>}
      </div>
      {children && <div className="mt-3 sm:pl-12">{children}</div>}
    </div>
  );
}

function Toggle({ on, onChange, disabled }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className="w-10 h-6 rounded-full relative transition-colors disabled:opacity-50"
      style={{ background: on ? ACCENT : "var(--border)", cursor: "pointer" }}
    >
      <span className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all" style={{ left: on ? 20 : 4 }} />
    </button>
  );
}

function PhoneVerification({ onVerified }: { onVerified: () => void }) {
  const [info, setInfo] = useState<PhoneInfo | null>(null);
  const [phone, setPhone] = useState("");
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waiting, setWaiting] = useState<{ url: string; method: string; code?: string } | null>(null);
  const poll = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = async () => {
    const r = await apiJson<PhoneInfo>("/api/phone");
    if (r.data) {
      setInfo(r.data);
      if (!phone && (r.data.pending?.phone || r.data.phone)) setPhone(r.data.pending?.phone ?? r.data.phone ?? "");
      if (r.data.phoneVerified) {
        setWaiting(null);
        if (poll.current) clearInterval(poll.current);
        onVerified();
      }
    }
  };

  useEffect(() => {
    load();
    return () => {
      if (poll.current) clearInterval(poll.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = async () => {
    if (!isValidNigerianPhone(phone)) return setError(NIGERIA_PHONE_TITLE);
    setStarting(true);
    setError(null);
    const r = await apiJson<{ method: string; whatsappUrl: string; code?: string }>("/api/phone/verify", jsonBody({ phone }));
    setStarting(false);
    if (!r.ok || !r.data) return setError(r.message);
    setWaiting({ url: r.data.whatsappUrl, method: r.data.method, code: r.data.code });
    window.open(r.data.whatsappUrl, "_blank", "noopener");
    // Poll while they're in WhatsApp — automatic checks land in seconds.
    if (poll.current) clearInterval(poll.current);
    poll.current = setInterval(load, 5000);
  };

  if (!info) return null;

  if (info.phoneVerified) {
    return (
      <Row
        Icon={Phone}
        title="Phone number"
        desc={`${info.phone} · verified${info.verifiedVia === "admin" ? " by TechNest" : " on WhatsApp"}`}
        right={<Pill tone="green" Icon={CheckCircle2}>Verified</Pill>}
      />
    );
  }

  return (
    <Row
      Icon={Phone}
      title="Verify my number"
      desc="A verified WhatsApp number earns a “Phone verified” badge on your listings."
      right={<Pill tone="amber">Not verified</Pill>}
    >
      {waiting ? (
        <div className="space-y-2">
          <Notice tone="accent">
            {waiting.method === "whatsapp" ? (
              <>
                Send the pre-filled message{waiting.code ? ` (code ${waiting.code})` : ""} from <strong>{phone}</strong> — we&apos;ll
                verify you automatically.
              </>
            ) : (
              <>Send us a message on WhatsApp from <strong>{phone}</strong> — our team verifies it by hand, usually within a few hours.</>
            )}
          </Notice>
          <div className="flex gap-2 flex-wrap">
            <a
              href={waiting.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl no-underline"
              style={{ background: "#25d366", color: "#fff" }}
            >
              <MessageCircle className="w-4 h-4" /> Open WhatsApp
            </a>
            <Button variant="outline" onClick={load}>
              I&apos;ve sent it
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08012345678"
            className={`${fieldClass} max-w-[220px]`}
            style={fieldStyle}
          />
          <Button Icon={MessageCircle} variant="whatsapp" onClick={start} loading={starting}>
            Verify on WhatsApp
          </Button>
        </div>
      )}
      {info.pending && !waiting && (
        <p className="text-[11px] mt-2" style={{ color: "var(--ink-soft)" }}>
          Waiting on {info.pending.phone} ({info.pending.method}). Start again to get a new link.
        </p>
      )}
      <div className="mt-2">
        <ErrorText>{error}</ErrorText>
      </div>
    </Row>
  );
}

function DeleteAccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { clearSession } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSaving(true);
    setError(null);
    const r = await apiJson("/api/me", { method: "DELETE", body: JSON.stringify({ password }) });
    setSaving(false);
    if (!r.ok) return setError(r.message);
    clearSession();
    router.push("/?accountDeleted=1");
  };

  return (
    <Modal open={open} onClose={onClose} title="Delete your account" Icon={Trash2} width="max-w-sm">
      <div className="space-y-3">
        <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
          Your personal details are wiped and you&apos;re signed out everywhere. Open listings, requests and orders are closed.
          Records of past deals stay, without your name, because the other side needs them.
        </p>
        <Field label="Your password">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={fieldClass} style={fieldStyle} />
        </Field>
        <Field label='Type "DELETE" to confirm'>
          <input value={confirm} onChange={(e) => setConfirm(e.target.value)} className={fieldClass} style={fieldStyle} />
        </Field>
        {error && <Notice tone="red">{error}</Notice>}
        <Button variant="danger" Icon={Trash2} onClick={submit} loading={saving} disabled={!password || confirm !== "DELETE"} full>
          Delete my account
        </Button>
      </div>
    </Modal>
  );
}

const LINKS: { label: string; href: string; Icon: LucideIcon }[] = [
  { label: "Notifications", href: "/notifications", Icon: Bell },
  { label: "Ratings & reviews", href: "/reviews", Icon: Star },
  { label: "Problems with a deal", href: "/disputes", Icon: Scale },
  { label: "IMEI check & stolen phones", href: "/imei", Icon: ScanLine },
];

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoading, refreshUser, clearSession } = useAuth();
  const [identity, setIdentity] = useState<IdentityInfo | null>(null);
  const [prefs, setPrefs] = useState({ notifications: true, announcements: true });
  const [savingPref, setSavingPref] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/auth/login?from=/account");
      return;
    }
    setPrefs({
      notifications: user.emailPrefs?.notifications !== false,
      announcements: user.emailPrefs?.announcements !== false,
    });
    apiJson<IdentityInfo>("/api/identity").then((r) => setIdentity(r.data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, !!user]);

  const savePref = async (key: "notifications" | "announcements", v: boolean) => {
    const next = { ...prefs, [key]: v };
    setPrefs(next);
    setSavingPref(true);
    const r = await apiJson("/api/me/email-preferences", { method: "PATCH", body: JSON.stringify({ [key]: v }) });
    setSavingPref(false);
    if (!r.ok) {
      setPrefs(prefs);
      setMsg(r.message);
    }
  };

  const logoutAll = async () => {
    if (!window.confirm("Sign out on every device, including this one?")) return;
    setBusy("logout");
    await apiJson("/api/auth/logout-all", { method: "POST" });
    clearSession();
    router.push("/auth/login");
  };

  const exportData = async () => {
    setBusy("export");
    try {
      const res = await apiFetch("/api/me/export");
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `technest-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setMsg("Couldn't download your data — please try again.");
    } finally {
      setBusy(null);
    }
  };

  if (isLoading || !user) {
    return <PageShell title="Account & Safety" Icon={Settings}><PageSkeleton /></PageShell>;
  }

  const idStatus = identity?.status ?? user.identityStatus ?? "none";

  return (
    <PageShell title="Account & Safety" Icon={Settings} subtitle={`${user.name} · ${user.email}`}>
      <div className="space-y-5">
        {msg && <Notice tone="red">{msg}</Notice>}

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "var(--ink-soft)" }}>
            Trust & verification
          </p>
          <Row
            Icon={Mail}
            title="Email address"
            desc={user.email}
            right={user.isVerified === false ? <Pill tone="amber">Not confirmed</Pill> : <Pill tone="green" Icon={CheckCircle2}>Confirmed</Pill>}
          >
            {user.isVerified === false && <ResendVerificationButton />}
          </Row>
          <PhoneVerification onVerified={refreshUser} />
          <Row
            Icon={ShieldCheck}
            title="Get verified"
            desc={
              idStatus === "verified"
                ? "You have the Verified seller badge."
                : idStatus === "pending"
                  ? "Your ID check is being reviewed."
                  : idStatus === "rejected"
                    ? identity?.rejectionReason ?? "Your last check wasn't approved — you can try again."
                    : "A free ID + selfie check that earns a Verified seller badge."
            }
            right={
              idStatus === "verified" ? (
                <Pill tone="blue" Icon={ShieldCheck}>Verified</Pill>
              ) : (
                <Button variant={idStatus === "pending" ? "outline" : "soft"} onClick={() => router.push("/account/verify")}>
                  {idStatus === "pending" ? "View" : idStatus === "rejected" ? "Try again" : "Start"}
                </Button>
              )
            }
          />
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "var(--ink-soft)" }}>
            Emails
          </p>
          <Row
            Icon={Bell}
            title="Notification emails"
            desc="Offers, orders, listing updates. In-app notifications stay on."
            right={<Toggle on={prefs.notifications} onChange={(v) => savePref("notifications", v)} disabled={savingPref} />}
          />
          <Row
            Icon={Megaphone}
            title="Announcements"
            desc="News and offers from TechNest."
            right={<Toggle on={prefs.announcements} onChange={(v) => savePref("announcements", v)} disabled={savingPref} />}
          />
          <p className="text-[11px] mt-3" style={{ color: "var(--ink-soft)" }}>
            Security emails (email confirmation, password reset) are always sent.
          </p>
        </Card>

        <Card className="p-0 sm:p-0 overflow-hidden">
          {LINKS.map(({ label, href, Icon }, i) => (
            <button
              key={href}
              onClick={() => router.push(href)}
              className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-[var(--accent-soft)]"
              style={{ borderTop: i ? "1px solid var(--border)" : undefined, cursor: "pointer" }}
            >
              <Icon className="w-4 h-4" style={{ color: ACCENT }} />
              <span className="flex-1 text-sm" style={{ color: "var(--ink)" }}>
                {label}
              </span>
              <ChevronRight className="w-4 h-4" style={{ color: "var(--ink-soft)" }} />
            </button>
          ))}
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "var(--ink-soft)" }}>
            Privacy & security
          </p>
          <Row
            Icon={LogOut}
            title="Log out everywhere"
            desc="Lost a phone? End every session, including this one."
            right={<Button variant="outline" onClick={logoutAll} loading={busy === "logout"}>Log out all</Button>}
          />
          <Row
            Icon={Download}
            title="Download my data"
            desc="Everything TechNest holds about you, as a JSON file."
            right={<Button variant="outline" onClick={exportData} loading={busy === "export"}>Download</Button>}
          />
          <Row
            Icon={Trash2}
            title="Delete my account"
            desc="Permanent. You'll be told first if something needs settling (commission owed, an open dispute)."
            right={<Button variant="danger" onClick={() => setDeleting(true)}>Delete</Button>}
          />
        </Card>
      </div>
      <DeleteAccountModal open={deleting} onClose={() => setDeleting(false)} />
    </PageShell>
  );
}
