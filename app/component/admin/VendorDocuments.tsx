"use client";

import { useEffect, useState } from "react";
import { FileCheck2, RefreshCw } from "lucide-react";
import { apiJson } from "@/app/lib/api";
import { ID_TYPE_LABELS } from "@/app/types/backend";
import { Pill, formatDateTime } from "@/app/component/ui/kit";
import { DocGallery, type Doc } from "./DocViewer";

type IdentityPerson = {
  userId: string;
  identity: {
    fullName?: string;
    idType?: string;
    bankName?: string;
    accountLast4?: string;
    accountName?: string;
    nameMatch?: boolean | "match" | "mismatch" | "partial" | null;
    submittedAt?: string;
    idDocumentUrl?: string;
    idDocumentMime?: string | null;
    selfieUrl?: string;
    selfieMime?: string | null;
    rejectionReason?: string;
    status?: string;
  };
};

export type VendorIdentity = IdentityPerson["identity"];

const ID_STATUSES = ["pending", "verified", "rejected"] as const;

function matchPill(m: IdentityPerson["identity"]["nameMatch"]) {
  if (m === true || m === "match") return <Pill size="xs" tone="green">Bank name matches ID</Pill>;
  if (m === false || m === "mismatch") return <Pill size="xs" tone="red">Bank name doesn&apos;t match ID</Pill>;
  if (m === "partial") return <Pill size="xs" tone="amber">Partial name match</Pill>;
  return null;
}

/**
 * Everything a vendor submitted — CAC certificate, ID document and selfie —
 * viewable in place, so the admin can check it before approving.
 * The ID photos come from GET /api/admin/identity (signed links), matched
 * to this vendor by user id.
 */
export default function VendorDocuments({
  vendorId,
  businessName,
  identityStatus,
  cacCertificateUrl,
  cacCertificateMime,
  identity,
}: {
  vendorId: string;
  businessName?: string;
  identityStatus?: string;
  cacCertificateUrl?: string;
  cacCertificateMime?: string | null;
  /** From GET /api/admin/vendors/pending when the backend includes it:
   *  an object = their ID check, null = never did one, undefined = unknown. */
  identity?: VendorIdentity | null;
}) {
  const embedded = identity !== undefined;
  const [person, setPerson] = useState<IdentityPerson | null>(
    identity ? { userId: vendorId, identity } : null
  );
  const [state, setState] = useState<"loading" | "ready" | "error">(embedded ? "ready" : "loading");
  const [msg, setMsg] = useState("");
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // Look in the vendor's own status first, then the rest.
    const order = [
      ...(ID_STATUSES as readonly string[]).filter((s) => s === identityStatus),
      ...ID_STATUSES.filter((s) => s !== identityStatus),
    ];
    (async () => {
      // Data came with the vendor list (and no manual reload asked for).
      if (embedded && nonce === 0) return;
      // Newer backends: one call for this user.
      const one = await apiJson<IdentityPerson | { person: IdentityPerson }>(`/api/admin/identity/${vendorId}`);
      if (cancelled) return;
      if (one.ok && one.data) {
        const p = "person" in one.data ? one.data.person : one.data;
        if (p?.identity) {
          setPerson({ ...p, userId: vendorId });
          setState("ready");
          return;
        }
      }
      // Older backends: scan the identity lists for this user.
      for (const s of order) {
        const r = await apiJson<{ people: IdentityPerson[] }>(`/api/admin/identity?status=${s}`);
        if (cancelled) return;
        if (!r.ok) {
          setMsg(r.message);
          setState("error");
          return;
        }
        const hit = r.data?.people?.find((p) => String(p.userId) === String(vendorId));
        if (hit) {
          setPerson(hit);
          setState("ready");
          return;
        }
        // Only the vendor's own status bucket can hold them, unless the
        // status we have is missing/stale — then keep looking.
        if (identityStatus && identityStatus !== "none" && s === identityStatus) break;
      }
      if (!cancelled) {
        setPerson(null);
        setState("ready");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [vendorId, identityStatus, nonce, embedded]);

  const id = person?.identity;
  const docs: Doc[] = [
    { url: cacCertificateUrl, label: "CAC certificate", mime: cacCertificateMime },
    { url: id?.idDocumentUrl, label: ID_TYPE_LABELS[id?.idType ?? ""] ?? "ID document", mime: id?.idDocumentMime },
    { url: id?.selfieUrl, label: "Selfie", mime: id?.selfieMime },
  ];
  const submittedCount = docs.filter((d) => d.url).length;

  return (
    <div className="rounded-2xl p-4" style={{ background: "var(--border)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-soft)" }}>
          <FileCheck2 className="w-3.5 h-3.5" /> Submitted documents
          {state === "ready" && <span className="num normal-case tracking-normal font-medium">· {submittedCount} of 3</span>}
        </p>
        <button
          onClick={() => {
            setState("loading");
            setNonce((n) => n + 1);
          }}
          aria-label="Reload documents"
          title="Signed links expire — reload for fresh ones"
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ color: "var(--ink-soft)" }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${state === "loading" ? "animate-spin" : ""}`} />
        </button>
      </div>

      {state === "loading" ? (
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((k) => (
            <div key={k} className="skeleton rounded-lg" style={{ aspectRatio: "4/3" }} />
          ))}
        </div>
      ) : (
        <DocGallery docs={docs} className="grid grid-cols-3 gap-2" />
      )}

      {state === "error" && (
        <p className="text-xs mt-2" style={{ color: "#DC2626" }}>
          Couldn&apos;t load ID documents{msg ? `: ${msg}` : ""}. The CAC certificate can still be viewed.
        </p>
      )}

      {state === "ready" && id && (
        <div className="mt-3 space-y-1.5 text-xs" style={{ color: "var(--ink)" }}>
          {id.fullName && (
            <p>
              <span style={{ color: "var(--ink-soft)" }}>Name on ID:</span> <strong>{id.fullName}</strong>
              {businessName ? <span style={{ color: "var(--ink-soft)" }}> · business “{businessName}”</span> : null}
            </p>
          )}
          {id.bankName && (
            <p>
              <span style={{ color: "var(--ink-soft)" }}>Bank:</span> {id.bankName} ····{id.accountLast4}
              {id.accountName ? ` · “${id.accountName}”` : ""}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-1.5">
            {matchPill(id.nameMatch)}
            {id.submittedAt && <span style={{ color: "var(--ink-soft)" }}>ID submitted {formatDateTime(id.submittedAt)}</span>}
          </div>
          {id.rejectionReason && <p style={{ color: "#DC2626" }}>ID rejected: {id.rejectionReason}</p>}
        </div>
      )}

      {state === "ready" && !id && (
        <p className="text-xs mt-3" style={{ color: "#d97706" }}>
          No ID check submitted yet — only the CAC certificate is available. You can ask the vendor to verify their ID
          before approving.
        </p>
      )}
      <p className="text-[11px] mt-2" style={{ color: "var(--ink-soft)" }}>
        Tap a document to inspect it full-screen. If one stops loading, use ↻ for a fresh link.
      </p>
    </div>
  );
}
