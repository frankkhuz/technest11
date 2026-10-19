"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench, MapPin, Store, BadgeCheck, Send, Plus } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { isAdminUser } from "@/app/lib/auth";
import { apiJson } from "@/app/lib/api";
import {
  NIGERIAN_STATES,
  VENDOR_TYPE_LABELS,
  type Rating,
  type RepairService,
  type VendorType,
} from "@/app/types/backend";
import { Chip, RatingBadge, Pill, formatDate } from "@/app/component/ui/kit";
import { RowListSkeleton } from "@/app/component/ui/Skeleton";

const ACCENT = "#C2542D";

type DirectoryVendor = {
  id: string;
  name: string;
  vendorTypes: VendorType[];
  brands: string[];
  states: string[];
  city?: string | null;
  repairServices: string[];
  identityVerified: boolean;
  rating: Rating;
  memberSince: string;
};

const TYPE_FILTERS: VendorType[] = ["repairs", "phone_dealer", "gadgets", "accessories"];

export default function VendorDirectory() {
  const router = useRouter();
  const { user } = useAuth();
  const [type, setType] = useState<VendorType>("repairs");
  const [state, setState] = useState("");
  const [service, setService] = useState("");
  const [vendors, setVendors] = useState<DirectoryVendor[]>([]);
  const [services, setServices] = useState<RepairService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiJson<{ services: RepairService[] }>("/api/repair-triage/services").then((r) => setServices(r.data?.services ?? []));
  }, []);

  useEffect(() => {
    const q = new URLSearchParams({ type });
    if (state) q.set("state", state);
    if (type === "repairs" && service) q.set("repairService", service);
    Promise.resolve()
      .then(() => setLoading(true))
      .then(() => apiJson<{ vendors: DirectoryVendor[] }>(`/api/vendors/directory?${q}`))
      .then((r) => setVendors(r.data?.vendors ?? []))
      .finally(() => setLoading(false));
  }, [type, state, service]);

  const serviceName = (id: string) => services.find((s) => s.id === id)?.issue ?? id.replace(/-/g, " ");

  const requestHref =
    type === "repairs"
      ? `/requests/new?type=repair${service ? `&service=${service}` : ""}`
      : `/requests/new?type=${type === "accessories" ? "accessory" : "buy"}`;

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--ink)" }}>
            <Store className="w-4.5 h-4.5" style={{ color: ACCENT }} /> TechNest Vendors
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>
            Approved vendors and what they do. Post a request and they&apos;ll send you offers — TechNest arranges the deal.
          </p>
        </div>
        <button
          onClick={() => router.push(user ? requestHref : `/auth/login?from=${encodeURIComponent(requestHref)}`)}
          className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg"
          style={{ background: ACCENT, color: "#fff", cursor: "pointer" }}
        >
          <Send className="w-3.5 h-3.5" /> Get quotes
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 mb-3" style={{ scrollbarWidth: "none" }}>
        {TYPE_FILTERS.map((t) => (
          <Chip key={t} active={type === t} onClick={() => setType(t)}>
            {VENDOR_TYPE_LABELS[t]}
          </Chip>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="text-xs px-3 py-2 rounded-lg outline-none"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--ink)", cursor: "pointer" }}
        >
          <option value="">All states</option>
          {NIGERIAN_STATES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        {type === "repairs" && (
          <select
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg outline-none"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--ink)", cursor: "pointer" }}
          >
            <option value="">Any repair</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.issue}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <RowListSkeleton count={3} />
      ) : vendors.length === 0 ? (
        <div className="text-center py-12 rounded-2xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <Wrench className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--ink-soft)" }} />
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--ink)" }}>
            No vendors here yet
          </p>
          <p className="text-xs mb-4" style={{ color: "var(--ink-soft)" }}>
            Post a request anyway — TechNest will find someone for you.
          </p>
          {user?.userType !== "vendor" && !isAdminUser(user) && (
            <button
              onClick={() => router.push("/become-vendor")}
              className="inline-flex items-center gap-1 text-xs font-semibold"
              style={{ color: ACCENT, cursor: "pointer" }}
            >
              <Plus className="w-3.5 h-3.5" /> Run a business? Become a vendor
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {vendors.map((v) => (
            <div key={v.id} className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <p className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: "var(--ink)" }}>
                    <span className="truncate">{v.name}</span>
                    {v.identityVerified && (
                      <BadgeCheck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#1d9bf0" }} aria-label="Verified" />
                    )}
                  </p>
                  <p className="inline-flex items-center gap-1 text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>
                    <MapPin className="w-3 h-3" />
                    {v.city ? `${v.city} · ` : ""}
                    {v.states.length ? v.states.join(", ") : "Nationwide"}
                  </p>
                </div>
                <RatingBadge rating={v.rating} />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {v.vendorTypes.map((t) => (
                  <Pill key={t} tone="accent" size="xs">
                    {VENDOR_TYPE_LABELS[t] ?? t}
                  </Pill>
                ))}
                {v.repairServices.slice(0, 4).map((s) => (
                  <Pill key={s} size="xs">
                    {serviceName(s)}
                  </Pill>
                ))}
                {v.repairServices.length > 4 && <Pill size="xs">+{v.repairServices.length - 4} more</Pill>}
                {v.brands.slice(0, 4).map((b) => (
                  <Pill key={b} size="xs">
                    {b}
                  </Pill>
                ))}
              </div>
              <p className="text-[11px] mt-2" style={{ color: "var(--ink-soft)" }}>
                On TechNest since {formatDate(v.memberSince)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
