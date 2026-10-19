"use client";

import { useCallback, useEffect, useState } from "react";
import { Users, Phone, LogOut, CheckCircle2, XCircle } from "lucide-react";
import { apiJson } from "@/app/lib/api";
import { Button, Chip, Pill, formatDateTime } from "@/app/component/ui/kit";
import { SectionBody, SearchBox, ListState, RefreshButton } from "./shared";

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  userType?: string;
  phone?: string | null;
  phoneVerified?: boolean;
  phoneVerifiedVia?: string;
  phoneVerification?: { phone?: string; method?: string; requestedAt?: string } | null;
  identityVerified?: boolean;
  vendorVerified?: boolean;
  createdAt?: string;
};

export default function UsersSection() {
  const [q, setQ] = useState("");
  const [phonePending, setPhonePending] = useState(false);
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (q.trim()) qs.set("q", q.trim());
    if (phonePending) qs.set("phonePending", "true");
    const r = await apiJson<{ users: AdminUser[] }>(`/api/admin/users?${qs}`);
    setError(r.ok ? null : r.message);
    setRows(r.data?.users ?? []);
    setLoading(false);
  }, [q, phonePending]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const setPhone = async (u: AdminUser, verified: boolean) => {
    if (verified && !window.confirm(`Only verify a number you've seen message TechNest on WhatsApp. Verify ${u.phoneVerification?.phone ?? u.phone}?`)) return;
    setBusy(u._id);
    const r = await apiJson<{ user: AdminUser }>(`/api/admin/users/${u._id}/phone`, { method: "PATCH", body: JSON.stringify({ verified }) });
    setBusy(null);
    if (!r.ok) return setMsg(r.message);
    setRows((xs) => xs.map((x) => (x._id === u._id ? { ...x, ...(r.data?.user ?? { phoneVerified: verified }) } : x)));
  };

  const signOut = async (u: AdminUser) => {
    if (!window.confirm(`Sign ${u.name} out on every device?`)) return;
    setBusy(`out-${u._id}`);
    const r = await apiJson(`/api/admin/users/${u._id}/sign-out`, { method: "POST" });
    setBusy(null);
    setMsg(r.ok ? `${u.name} was signed out everywhere.` : r.message);
  };

  return (
    <SectionBody>
      <div className="flex items-center gap-2 flex-wrap mb-1">
        <div className="flex-1 min-w-[220px]">
          <SearchBox value={q} onChange={setQ} placeholder="Name, email or phone…" />
        </div>
        <div className="flex items-center gap-2 mb-4">
          <Chip active={phonePending} onClick={() => setPhonePending((v) => !v)}>
            Phone waiting for check
          </Chip>
          <RefreshButton onClick={load} />
        </div>
      </div>
      {msg && (
        <p className="text-xs mb-3" style={{ color: "var(--ink)" }}>
          {msg}
        </p>
      )}
      <ListState loading={loading} error={error} empty={rows.length === 0} EmptyIcon={Users} emptyText={q ? "No users match" : "Search for a user"}>
        <div className="space-y-2">
          {rows.map((u) => {
            const pending = u.phoneVerification?.phone && !u.phoneVerified;
            return (
              <div key={u._id} className="rounded-xl p-4 flex flex-wrap items-center justify-between gap-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                    {u.name}{" "}
                    <span className="text-xs font-normal capitalize" style={{ color: "var(--ink-soft)" }}>
                      · {u.userType}
                    </span>
                  </p>
                  <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                    {u.email} {u.createdAt ? `· joined ${formatDateTime(u.createdAt)}` : ""}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {u.phoneVerified ? (
                      <Pill tone="green" Icon={Phone} size="xs">
                        {u.phone} · verified{u.phoneVerifiedVia ? ` via ${u.phoneVerifiedVia}` : ""}
                      </Pill>
                    ) : pending ? (
                      <Pill tone="amber" Icon={Phone} size="xs">
                        Wants {u.phoneVerification!.phone} verified · {u.phoneVerification!.method}
                      </Pill>
                    ) : u.phone ? (
                      <Pill size="xs" Icon={Phone}>
                        {u.phone}
                      </Pill>
                    ) : null}
                    {u.identityVerified && <Pill tone="blue" size="xs">ID verified</Pill>}
                    {u.vendorVerified && <Pill tone="accent" size="xs">Approved vendor</Pill>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {u.phoneVerified ? (
                    <Button size="sm" variant="outline" Icon={XCircle} onClick={() => setPhone(u, false)} loading={busy === u._id}>
                      Unverify phone
                    </Button>
                  ) : (
                    (pending || u.phone) && (
                      <Button size="sm" Icon={CheckCircle2} onClick={() => setPhone(u, true)} loading={busy === u._id}>
                        Verify phone
                      </Button>
                    )
                  )}
                  <Button size="sm" variant="danger" Icon={LogOut} onClick={() => signOut(u)} loading={busy === `out-${u._id}`}>
                    Sign out
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </ListState>
    </SectionBody>
  );
}
