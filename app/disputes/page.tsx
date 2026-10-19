"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Scale, Plus, ChevronRight } from "lucide-react";
import { apiJson } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { userIdOf } from "@/app/lib/auth";
import { DISPUTE_REASON_LABELS, nameOf, type Dispute } from "@/app/types/backend";
import { PageShell, Button, EmptyState, StatusPill, timeAgo } from "@/app/component/ui/kit";
import { RowListSkeleton } from "@/app/component/ui/Skeleton";

export default function DisputesPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/auth/login?from=/disputes");
      return;
    }
    apiJson<{ disputes: Dispute[] }>("/api/disputes")
      .then((r) => setDisputes(r.data?.disputes ?? []))
      .finally(() => setLoading(false));
  }, [isLoading, user, router]);

  return (
    <PageShell
      title="Problems with a deal"
      Icon={Scale}
      subtitle="Raise a problem within 7 days of a deal completing — TechNest staff step in and decide."
      actions={
        <Button Icon={Plus} onClick={() => router.push("/disputes/new")}>
          Report a problem
        </Button>
      }
    >
      {loading ? (
        <RowListSkeleton count={3} />
      ) : disputes.length === 0 ? (
        <EmptyState
          Icon={Scale}
          title="No disputes"
          body="If a device isn't as described, is faulty or never arrived, report it here and we'll sort it out."
        />
      ) : (
        <div className="space-y-3">
          {disputes.map((d) => {
            const raisedByMe =
              typeof d.raisedBy === "object" ? d.raisedBy?._id === userIdOf(user) : d.raisedBy === userIdOf(user);
            return (
              <button
                key={d._id}
                onClick={() => router.push(`/disputes/${d._id}`)}
                className="w-full text-left rounded-2xl p-4 flex items-center gap-3 card-hover"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer" }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <StatusPill status={d.status} />
                    <span className="text-xs font-semibold" style={{ color: "var(--ink)" }}>
                      {DISPUTE_REASON_LABELS[d.reason] ?? d.reason}
                    </span>
                  </div>
                  <p className="text-sm truncate" style={{ color: "var(--ink)" }}>
                    {d.sourceLabel ?? d.label ?? d.description}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>
                    {raisedByMe ? `Against ${nameOf(d.against, "the other side")}` : `Raised by ${nameOf(d.raisedBy, "the other side")}`} ·{" "}
                    {timeAgo(d.createdAt)}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "var(--ink-soft)" }} />
              </button>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
