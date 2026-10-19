"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Send,
  ShoppingBag,
  Wallet,
  Repeat,
  Wrench,
  Headphones,
  ImagePlus,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { apiJson, jsonBody, uploadFiles } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { loginHref } from "@/app/lib/auth";
import { formatPrice } from "@/app/lib/helpers";
import {
  NIGERIAN_STATES,
  REQUEST_CATEGORIES,
  idOf,
  type DeviceRequest,
  type RepairService,
  type RequestType,
} from "@/app/types/backend";
import {
  PageShell,
  Card,
  Field,
  Button,
  ErrorText,
  Notice,
  fieldClass,
  fieldStyle,
  humanize,
  ACCENT,
} from "@/app/component/ui/kit";

const TYPES: { id: RequestType; label: string; desc: string; Icon: LucideIcon }[] = [
  { id: "buy", label: "Buy", desc: "Find me a device", Icon: ShoppingBag },
  { id: "sell", label: "Sell", desc: "Vendors bid on mine", Icon: Wallet },
  { id: "swap", label: "Swap", desc: "Trade mine for another", Icon: Repeat },
  { id: "repair", label: "Repair", desc: "Fix my device", Icon: Wrench },
  { id: "accessory", label: "Accessory", desc: "Cases, chargers & more", Icon: Headphones },
];

const DEVICE_LABEL: Record<RequestType, string> = {
  buy: "What do you want to buy?",
  sell: "What are you selling?",
  swap: "What are you swapping?",
  repair: "Which device needs fixing?",
  accessory: "What accessory do you need?",
};

function NewRequestForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, isLoading } = useAuth();

  const initialType = (params.get("type") as RequestType) || "buy";
  const [type, setType] = useState<RequestType>(
    TYPES.some((t) => t.id === initialType) ? initialType : "buy"
  );
  const [category, setCategory] = useState<string>(params.get("category") || "phone");
  const [deviceName, setDeviceName] = useState(params.get("device") || "");
  const [storage, setStorage] = useState("");
  const [condition, setCondition] = useState("");
  const [wantedDevice, setWantedDevice] = useState("");
  const [issue, setIssue] = useState("");
  const [repairServiceId, setRepairServiceId] = useState(params.get("service") || "");
  const [snapchatStatus, setSnapchatStatus] = useState<"works" | "banned" | "unknown">("unknown");
  const [imei, setImei] = useState("");
  const [description, setDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [state, setState] = useState("Lagos");
  const [city, setCity] = useState("");
  const [autoSelect, setAutoSelect] = useState(false);
  const [hours, setHours] = useState("24");
  const [photos, setPhotos] = useState<File[]>([]);
  const [services, setServices] = useState<RepairService[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !user) router.replace(loginHref(`/requests/new?${params.toString()}`));
  }, [isLoading, user, router, params]);

  useEffect(() => {
    if (type !== "repair" || services.length) return;
    apiJson<{ services: RepairService[] }>("/api/repair-triage/services").then((r) =>
      setServices(r.data?.services ?? [])
    );
  }, [type, services.length]);

  const isDeviceOwner = type === "sell" || type === "swap" || type === "repair";
  const showImei = (type === "sell" || type === "swap") && category === "phone";
  const relevantServices = services.filter(
    (s) => s.appliesTo.includes("any") || s.appliesTo.includes(category)
  );

  const submit = async () => {
    setError(null);
    if (!deviceName.trim()) return setError("Tell vendors which device.");
    if (type === "swap" && !wantedDevice.trim()) return setError("Say what you want in exchange.");
    if (type === "repair" && !issue.trim() && !repairServiceId) return setError("Describe what's wrong.");
    if (showImei && imei && imei.replace(/\D/g, "").length !== 15) return setError("An IMEI has 15 digits.");

    setSubmitting(true);
    try {
      const images = (await uploadFiles(photos)).map((f) => f.url);
      const res = await apiJson<{ request: DeviceRequest; matchedVendors: number }>(
        "/api/requests",
        jsonBody({
          type,
          category,
          deviceName: deviceName.trim(),
          storage: storage.trim() || undefined,
          condition: condition || undefined,
          wantedDevice: type === "swap" ? wantedDevice.trim() : undefined,
          issue: type === "repair" ? issue.trim() || undefined : undefined,
          repairServiceId: type === "repair" ? repairServiceId || undefined : undefined,
          snapchatStatus: showImei ? snapchatStatus : undefined,
          imei: showImei && imei ? imei : undefined,
          description: description.trim() || undefined,
          images,
          budgetMin: Number(budgetMin) || undefined,
          budgetMax: Number(budgetMax) || undefined,
          state,
          city: city.trim() || undefined,
          autoSelect,
          hours: Number(hours) || undefined,
        })
      );
      if (!res.ok || !res.data) {
        setError(res.message);
        return;
      }
      router.push(`/requests/${idOf(res.data.request)}?posted=${res.data.matchedVendors ?? ""}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const budgetLabel =
    type === "sell" ? "What you hope to get (₦)" : type === "swap" ? "Top-up you can pay (₦)" : "Your budget (₦)";

  return (
    <PageShell
      title="Post a Request"
      Icon={Send}
      subtitle="It goes to vendors who match — by what they sell, where they are and their stock."
      width="max-w-2xl"
    >
      <div className="space-y-5">
        <Card>
          <p className="text-sm font-semibold mb-3" style={{ color: "var(--ink)" }}>
            What do you need?
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {TYPES.map(({ id, label, desc, Icon }) => {
              const active = type === id;
              return (
                <button
                  key={id}
                  onClick={() => {
                    setType(id);
                    if (id === "accessory") setCategory("accessory");
                  }}
                  className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-center"
                  style={{
                    border: `1.5px solid ${active ? ACCENT : "var(--border)"}`,
                    background: active ? "var(--accent-soft)" : "var(--bg)",
                    cursor: "pointer",
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: active ? ACCENT : "var(--ink-soft)" }} />
                  <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                    {label}
                  </span>
                  <span className="text-[10px] leading-tight" style={{ color: "var(--ink-soft)" }}>
                    {desc}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Category">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={fieldClass} style={{ ...fieldStyle, cursor: "pointer" }}>
                {REQUEST_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {humanize(c)}
                  </option>
                ))}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label={DEVICE_LABEL[type]}>
                <input
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder={type === "accessory" ? "e.g. MagSafe charger for iPhone 15" : "e.g. iPhone 13 Pro"}
                  className={fieldClass}
                  style={fieldStyle}
                />
              </Field>
            </div>
          </div>

          {type !== "accessory" && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Storage" optional>
                <input value={storage} onChange={(e) => setStorage(e.target.value)} placeholder="e.g. 256GB" className={fieldClass} style={fieldStyle} />
              </Field>
              <Field label={isDeviceOwner ? "Its condition" : "Condition wanted"} optional>
                <select value={condition} onChange={(e) => setCondition(e.target.value)} className={fieldClass} style={{ ...fieldStyle, cursor: "pointer" }}>
                  <option value="">Any</option>
                  <option>Brand New</option>
                  <option>UK Used</option>
                  <option>Nigerian Used</option>
                  <option>Refurbished</option>
                </select>
              </Field>
            </div>
          )}

          {type === "swap" && (
            <Field label="What do you want in exchange?">
              <input value={wantedDevice} onChange={(e) => setWantedDevice(e.target.value)} placeholder="e.g. iPhone 15 Pro 256GB" className={fieldClass} style={fieldStyle} />
            </Field>
          )}

          {type === "repair" && (
            <>
              {relevantServices.length > 0 && (
                <Field label="Closest repair" optional hint="Estimated prices — vendors send their own quotes.">
                  <select value={repairServiceId} onChange={(e) => setRepairServiceId(e.target.value)} className={fieldClass} style={{ ...fieldStyle, cursor: "pointer" }}>
                    <option value="">Not sure</option>
                    {relevantServices.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.issue} · {formatPrice(s.priceMin)}–{formatPrice(s.priceMax)}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
              <Field label="What's wrong?">
                <textarea value={issue} onChange={(e) => setIssue(e.target.value)} rows={2} placeholder="e.g. Screen cracked after a fall, touch still works" className={`${fieldClass} resize-none`} style={fieldStyle} />
              </Field>
            </>
          )}

          {showImei && (
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="IMEI" optional hint="We check it against stolen-device reports.">
                <input value={imei} onChange={(e) => setImei(e.target.value.replace(/[^\d\s-]/g, ""))} placeholder="Dial *#06#" inputMode="numeric" className={fieldClass} style={fieldStyle} />
              </Field>
              <Field label="Does Snapchat work?">
                <select value={snapchatStatus} onChange={(e) => setSnapchatStatus(e.target.value as typeof snapchatStatus)} className={fieldClass} style={{ ...fieldStyle, cursor: "pointer" }}>
                  <option value="unknown">Not sure</option>
                  <option value="works">Yes</option>
                  <option value="banned">No — banned</option>
                </select>
              </Field>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label={`${budgetLabel} — from`} optional>
              <input value={budgetMin} onChange={(e) => setBudgetMin(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="Min" className={fieldClass} style={fieldStyle} />
            </Field>
            <Field label="to" optional>
              <input value={budgetMax} onChange={(e) => setBudgetMax(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="Max" className={fieldClass} style={fieldStyle} />
            </Field>
          </div>

          <Field label="Anything else vendors should know?" optional>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={1000} placeholder="Colour, accessories included, how soon you need it…" className={`${fieldClass} resize-none`} style={fieldStyle} />
          </Field>

          {(isDeviceOwner || type === "accessory") && (
            <div>
              <p className="text-xs font-medium mb-1.5" style={{ color: "var(--ink)" }}>
                Photos <span style={{ color: "var(--ink-soft)" }}>(optional, up to 6)</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {photos.map((f, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden" style={{ background: "var(--border)" }}>
                    <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                      className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "#DC2626", color: "#fff" }}
                      aria-label="Remove photo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {photos.length < 6 && (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center"
                    style={{ borderColor: "var(--border)", color: "var(--ink-soft)", cursor: "pointer" }}
                    aria-label="Add photos"
                  >
                    <ImagePlus className="w-5 h-5" />
                  </button>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  setPhotos((p) => [...p, ...Array.from(e.target.files ?? [])].slice(0, 6));
                  e.target.value = "";
                }}
              />
            </div>
          )}
        </Card>

        <Card className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="State">
              <select value={state} onChange={(e) => setState(e.target.value)} className={fieldClass} style={{ ...fieldStyle, cursor: "pointer" }}>
                {NIGERIAN_STATES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="City / area" optional>
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Ikeja" className={fieldClass} style={fieldStyle} />
            </Field>
          </div>
          <Field label="Collect offers for">
            <select value={hours} onChange={(e) => setHours(e.target.value)} className={fieldClass} style={{ ...fieldStyle, cursor: "pointer" }}>
              <option value="6">6 hours</option>
              <option value="24">24 hours</option>
              <option value="48">2 days</option>
              <option value="72">3 days</option>
            </select>
          </Field>
          <button
            onClick={() => setAutoSelect((v) => !v)}
            className="w-full flex items-start gap-3 rounded-xl p-3 text-left"
            style={{
              border: `1.5px solid ${autoSelect ? ACCENT : "var(--border)"}`,
              background: autoSelect ? "var(--accent-soft)" : "var(--bg)",
              cursor: "pointer",
            }}
          >
            <Zap className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: ACCENT }} />
            <span className="flex-1">
              <span className="block text-sm font-semibold" style={{ color: "var(--ink)" }}>
                Pick the best offer for me
              </span>
              <span className="block text-xs" style={{ color: "var(--ink-soft)" }}>
                When the time is up we accept the best price (then the vendor with the most completed deals).
              </span>
            </span>
            <span
              className="w-9 h-5 rounded-full relative flex-shrink-0 mt-0.5 transition-colors"
              style={{ background: autoSelect ? ACCENT : "var(--border)" }}
            >
              <span
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                style={{ left: autoSelect ? 18 : 2 }}
              />
            </span>
          </button>
        </Card>

        <Notice tone="neutral">
          Vendors never see your phone number — TechNest connects you on WhatsApp once you accept an offer.
        </Notice>
        <ErrorText>{error}</ErrorText>
        <Button onClick={submit} loading={submitting} Icon={Send} full>
          Send to vendors
        </Button>
      </div>
    </PageShell>
  );
}

export default function NewRequestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "var(--bg)" }} />}>
      <NewRequestForm />
    </Suspense>
  );
}
