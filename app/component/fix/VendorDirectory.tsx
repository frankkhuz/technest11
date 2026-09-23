"use client";

import { useEffect, useState } from "react";
import { Wrench, Phone, MapPin, Plus, X, Loader2, Store } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { REPAIR_SPECIALTIES, type RepairSpecialty, type RepairVendor } from "@/app/lib/repairVendors";

const ACCENT = "#C2542D";

export default function VendorDirectory() {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<RepairVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchVendors = () =>
    fetch("/api/repair-vendors")
      .then((r) => r.json())
      .then((d) => setVendors(d.vendors ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));

  const refetch = () => {
    setLoading(true);
    fetchVendors();
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--ink)" }}>
            <Store className="w-4.5 h-4.5" style={{ color: ACCENT }} /> Repair Technicians
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>
            Real repairers on TechNest — see what they specialize in and reach out directly.
          </p>
        </div>
        {user && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg"
            style={{ background: "var(--accent-soft)", color: ACCENT, cursor: "pointer" }}
          >
            {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showForm ? "Cancel" : "List Your Business"}
          </button>
        )}
      </div>

      {showForm && (
        <VendorForm
          onSuccess={() => {
            setShowForm(false);
            refetch();
          }}
        />
      )}

      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="w-6 h-6 mx-auto animate-spin" style={{ color: "var(--ink-soft)" }} />
        </div>
      ) : vendors.length === 0 ? (
        <div
          className="text-center py-12 rounded-2xl"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <Wrench className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--ink-soft)" }} />
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--ink)" }}>
            No repairers listed yet
          </p>
          <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
            {user
              ? "Be the first — list your repair business above."
              : "Sign in to be the first repair technician listed here."}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {vendors.map((v) => (
            <div
              key={v.id}
              className="rounded-2xl p-4"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <p className="text-sm font-bold mb-1" style={{ color: "var(--ink)" }}>
                {v.businessName}
              </p>
              {v.area && (
                <p className="text-xs mb-2 flex items-center gap-1" style={{ color: "var(--ink-soft)" }}>
                  <MapPin className="w-3 h-3" /> {v.area}
                </p>
              )}
              <div className="flex flex-wrap gap-1 mb-3">
                {v.specialties.map((s) => (
                  <span
                    key={s}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{ background: "var(--accent-soft)", color: ACCENT }}
                  >
                    {s}
                  </span>
                ))}
              </div>
              <a
                href={`https://wa.me/${v.phone.replace(/\D/g, "")}?text=Hi%20${encodeURIComponent(
                  v.businessName
                )}%2C%20I%20found%20you%20on%20TechNest%20and%20need%20help%20fixing%20my%20device.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold no-underline px-3 py-1.5 rounded-lg"
                style={{ background: "#25d366", color: "#fff" }}
              >
                <Phone className="w-3.5 h-3.5" /> Contact
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VendorForm({ onSuccess }: { onSuccess: () => void }) {
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [specialties, setSpecialties] = useState<RepairSpecialty[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (s: RepairSpecialty) => {
    setSpecialties((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/repair-vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, phone, area, specialties }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not list your business.");
        setSubmitting(false);
        return;
      }
      onSuccess();
    } catch {
      setError("Network error — please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div
      className="rounded-2xl p-4 mb-4"
      style={{ background: "var(--surface)", border: `1.5px solid ${ACCENT}` }}
    >
      <div className="grid sm:grid-cols-2 gap-2.5 mb-2.5">
        <input
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Business / technician name"
          className="text-sm px-3.5 py-2.5 rounded-xl outline-none"
          style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border)" }}
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="WhatsApp number, e.g. 08012345678"
          className="text-sm px-3.5 py-2.5 rounded-xl outline-none"
          style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border)" }}
        />
      </div>
      <input
        value={area}
        onChange={(e) => setArea(e.target.value)}
        placeholder="Area (optional), e.g. Ikeja, Lagos"
        className="w-full text-sm px-3.5 py-2.5 rounded-xl outline-none mb-2.5"
        style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border)" }}
      />
      <p className="text-xs font-medium mb-1.5" style={{ color: "var(--ink-soft)" }}>
        What do you specialize in?
      </p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {REPAIR_SPECIALTIES.map((s) => (
          <button
            key={s}
            onClick={() => toggle(s)}
            className="text-xs px-3 py-1.5 rounded-full transition-colors"
            style={{
              background: specialties.includes(s) ? ACCENT : "var(--border)",
              color: specialties.includes(s) ? "#fff" : "var(--ink-soft)",
              cursor: "pointer",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-xs mb-2" style={{ color: "#DC2626" }}>
          {error}
        </p>
      )}

      <button
        onClick={submit}
        disabled={submitting || !businessName.trim() || !phone.trim() || specialties.length === 0}
        className="text-sm font-semibold px-5 py-2.5 rounded-xl inline-flex items-center gap-2 disabled:opacity-40"
        style={{ background: ACCENT, color: "#fff", cursor: "pointer" }}
      >
        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
        List My Business
      </button>
    </div>
  );
}
