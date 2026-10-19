"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Plus, ChevronRight, Users, MapPin, Tag } from "lucide-react";
import { apiJson } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { formatPrice } from "@/app/lib/helpers";
import {
  REQUEST_TYPE_LABELS,
  idOf,
  type DeviceRequest,
} from "@/app/types/backend";
import { PageShell, Button, EmptyState, StatusPill, Chip, timeAgo } from "@/app/component/ui/kit";
import { RowListSkeleton } from "@/app/component/ui/Skeleton";

const ACCENT = "#C2542D";
const FILTERS = ["all", "open", "accepted", "completed", "expired", "cancelled"] as const;

export default function MyRequestsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [requests, setRequests] = useState<DeviceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");

  useEffect(() => {
    if (isLoading) return;
    if (!user) return;
    apiJson<{ requests: DeviceRequest[] }>("/api/requests")
      .then((r) => setRequests(r.data?.requests ?? []))
      .finally(() => setLoading(false));
  }, [isLoading, user]);

  const shown = requests.filter((r) => filter === "all" || r.status === filter);

  return (
    <PageShell
      title="My Requests"
      Icon={Send}
      subtitle="Tell vendors what you need — they compete with offers, TechNest arranges the deal."
      actions={
        <Button Icon={Plus} onClick={() => router.push("/requests/new")}>
          New request
        </Button>
      }
    >
      {!isLoading && !user ? (
        <EmptyState
          Icon={Send}
          title="Get offers from vendors"
          body="Buying, selling, swapping or fixing a device? Post one request and compare offers from matching vendors near you."
          action={
            <Button onClick={() => router.push("/auth/login?from=/requests/new")}>Sign in to post a request</Button>
          }
        />
      ) : loading ? (
        <RowListSkeleton count={4} />
      ) : requests.length === 0 ? (
        <EmptyState
          Icon={Send}
          title="No requests yet"
          body="Post what you're looking for and matching vendors send you their best offers."
          action={<Button onClick={() => router.push("/requests/new")}>Post a request</Button>}
        />
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1 mb-4" style={{ scrollbarWidth: "none" }}>
            {FILTERS.map((f) => (
              <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
                {f === "all" ? "All" : f[0].toUpperCase() + f.slice(1)}
              </Chip>
            ))}
          </div>
          <div className="space-y-3">
            {shown.map((r) => {
              const offers = r.offers?.filter((o) => o.status !== "withdrawn") ?? [];
              const best = offers.length ? Math.min(...offers.map((o) => o.price)) : null;
              return (
                <button
                  key={idOf(r)}
                  onClick={() => router.push(`/requests/${idOf(r)}`)}
                  className="w-full text-left rounded-2xl p-4 flex items-center gap-3 card-hover"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer" }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: ACCENT }}>
                        {REQUEST_TYPE_LABELS[r.type] ?? r.type}
                      </span>
                      <StatusPill status={r.status} />
                    </div>
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--ink)" }}>
                      {r.deviceName}
                      {r.storage ? ` · ${r.storage}` : ""}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs flex-wrap" style={{ color: "var(--ink-soft)" }}>
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3 h-3" /> {offers.length} offer{offers.length === 1 ? "" : "s"}
                      </span>
                      {best !== null && r.status === "open" && (
                        <span className="inline-flex items-center gap-1" style={{ color: "#16a34a" }}>
                          <Tag className="w-3 h-3" /> from {formatPrice(best)}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {r.city ? `${r.city}, ` : ""}
                        {r.state}
                      </span>
                      <span>{timeAgo(r.createdAt)}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "var(--ink-soft)" }} />
                </button>
              );
            })}
            {shown.length === 0 && (
              <p className="text-sm text-center py-8" style={{ color: "var(--ink-soft)" }}>
                No {filter} requests.
              </p>
            )}
          </div>
        </>
      )}
    </PageShell>
  );
}
