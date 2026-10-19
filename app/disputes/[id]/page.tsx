"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Scale, ArrowLeft } from "lucide-react";
import { apiJson } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { userIdOf } from "@/app/lib/auth";
import type { Dispute } from "@/app/types/backend";
import DisputeThread from "@/app/component/shared/DisputeThread";
import { PageShell, EmptyState, Button } from "@/app/component/ui/kit";
import { RowListSkeleton } from "@/app/component/ui/Skeleton";

export default function DisputePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push(`/auth/login?from=/disputes/${id}`);
      return;
    }
    apiJson<{ dispute: Dispute }>(`/api/disputes/${id}`).then((r) => {
      if (r.ok && r.data) setDispute(r.data.dispute);
      else setError(r.message);
    });
  }, [isLoading, user, router, id]);

  return (
    <PageShell title="Dispute" Icon={Scale}>
      <button
        onClick={() => router.push("/disputes")}
        className="inline-flex items-center gap-1 text-xs font-medium mb-4"
        style={{ color: "var(--ink-soft)" }}
      >
        <ArrowLeft className="w-3.5 h-3.5" /> All disputes
      </button>
      {error ? (
        <EmptyState Icon={Scale} title="Can't open this dispute" body={error} action={<Button onClick={() => router.push("/disputes")}>Back</Button>} />
      ) : !dispute ? (
        <RowListSkeleton count={3} />
      ) : (
        <DisputeThread dispute={dispute} onChange={setDispute} viewerId={userIdOf(user)} />
      )}
    </PageShell>
  );
}
