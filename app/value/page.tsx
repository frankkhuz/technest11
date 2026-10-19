"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, Suspense, useEffect, type ReactNode } from "react";
import {
  Lock,
  Unlock,
  Check,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Sparkles,
  Loader2,
  Wallet,
  Repeat,
  Smartphone,
  Laptop,
  Apple,
  Bot,
  AppWindow,
  Terminal,
  Gamepad2,
  BatteryFull,
  Camera,
  Monitor,
  Keyboard,
  Zap,
  HardDrive,
  ClipboardList,
  Video,
  MessageCircle,
  Search,
  ShieldCheck,
  Ghost,
  KeyRound,
  Sparkle,
  ImagePlus,
  type LucideIcon,
} from "lucide-react";
import { formatPrice } from "../lib/helpers";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { apiFetch, apiJson, jsonBody, uploadFiles } from "@/app/lib/api";
import type { ConditionOptions, ImeiCheckResult } from "@/app/types/backend";
import { useAuth } from "@/app/hooks/useAuth";
import { useTheme } from "@/app/hooks/useTheme";
import Navbar from "@/app/component/layout/Navbar";
import SectionBackground from "@/app/component/home/SectionBackground";
import {
  NIGERIA_PHONE_REGEX,
  NIGERIA_PHONE_TITLE,
  isValidNigerianPhone,
} from "@/app/lib/validation";
import {
  type FormData,
  type ListingMode,
  type PhoneType,
  type LaptopType,
  type SimType,
  type FaceIdStatus,
  type CosmeticGrade,
  type SnapchatStatus,
  type DeviceEntry,
  initialForm,
  wantedDevices,
  validateIMEI,
} from "../data/gadget";

type ValuationResult = {
  device: { name: string; storage: string };
  basePrice: number;
  breakdown: { label: string; percent: number; amount?: number }[];
  deductionPercent: number;
  minVal: number;
  maxVal: number;
  value?: number;
  repairDeduction?: number;
  confidence?: { level: "high" | "medium" | "low"; reason?: string };
  likelyRange?: { min: number; max: number };
  warnings: string[];
};

const CONFIDENCE_STYLE = {
  high: { color: "#16a34a", bg: "rgba(22,163,74,0.1)", label: "High confidence" },
  medium: { color: "#d97706", bg: "rgba(217,119,6,0.12)", label: "Medium confidence" },
  low: { color: "#DC2626", bg: "rgba(220,38,38,0.1)", label: "Low confidence" },
};

const toWarnings = (w: unknown): string[] =>
  Array.isArray(w)
    ? w.map((x) => (typeof x === "string" ? x : (x as { message?: string })?.message ?? "")).filter(Boolean)
    : [];

// ── Auth Gate Modal ──────────────────────────────────────────────────────────
function AuthGateModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl w-full max-w-sm p-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "var(--border)", color: "var(--ink)" }}
        >
          <Lock className="w-7 h-7" />
        </div>
        <h3
          className="text-lg font-bold text-center mb-1"
          style={{ color: "var(--ink)", fontFamily: "Space Grotesk, sans-serif" }}
        >
          Sign in to list your device
        </h3>
        <p className="text-sm text-center mb-6" style={{ color: "var(--ink-soft)" }}>
          Create a free account or sign in to publish your listing on TechNest.
        </p>
        <div className="space-y-2">
          <button
            onClick={() => router.push("/auth/register?redirect=/value")}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: "#020044", color: "#fff", cursor: "pointer" }}
          >
            Create Free Account
          </button>
          <button
            onClick={() => router.push("/auth/login?redirect=/value")}
            className="w-full py-3 rounded-xl text-sm font-medium border transition-colors"
            style={{
              color: "var(--ink)",
              borderColor: "var(--border)",
              background: "var(--surface)",
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-xs"
            style={{ color: "var(--ink-soft)", cursor: "pointer" }}
          >
            Maybe later — continue valuing
          </button>
        </div>
      </div>
    </div>
  );
}

function ListingUnderReviewModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <div
        className="rounded-2xl w-full max-w-sm p-6 text-center"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
        >
          <Clock className="w-7 h-7" />
        </div>
        <h3
          className="text-lg font-bold mb-1"
          style={{ color: "var(--ink)", fontFamily: "Space Grotesk, sans-serif" }}
        >
          Your listing is under review
        </h3>
        <p className="text-sm mb-6" style={{ color: "var(--ink-soft)" }}>
          We&apos;re checking the details you submitted. You&apos;ll get an
          update on{" "}
          <span
            className="inline-flex items-center gap-1 font-semibold"
            style={{ color: "#16a34a" }}
          >
            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
          </span>{" "}
          once it&apos;s approved and live on the marketplace.
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: "var(--accent)", color: "#fff", cursor: "pointer" }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}

function ValueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dark } = useTheme();
  const defaultMode = (searchParams.get("type") as ListingMode) || "sell";
  const [form, setForm] = useState<FormData>({
    ...initialForm,
    listingMode: defaultMode,
  });
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [step, setStep] = useState<"form" | "result" | "imei" | "publish">(
    "form"
  );

  // Each step renders fresh, often shorter, content — without this the user
  // stays at whatever scroll position they were at on the previous (longer)
  // step, which can land them down near the footer instead of at the top
  // of the new content.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);
  const [previews, setPreviews] = useState<
    { url: string; isVideo: boolean; name: string }[]
  >([]);
  const [publishing, setPublishing] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [snack, setSnack] = useState<{
    open: boolean;
    msg: string;
    severity: "success" | "error" | "info";
  }>({ open: false, msg: "", severity: "info" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [description, setDescription] = useState("");
  const [generatingDescription, setGeneratingDescription] = useState(false);

  const { user } = useAuth();
  useEffect(() => {
    if (user?.name) {
      setForm((p) => ({ ...p, sellerName: user.name }));
    }
  }, [user]);

  useEffect(() => {
    return () => {
      previews.forEach((p) => {
        if (p.url) URL.revokeObjectURL(p.url);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isPhone = form.category === "phone";
  const isLaptop = form.category === "laptop";
  const isIphone = form.subType === "iphone";
  const isOther = form.deviceId.startsWith("other-");

  const [conditions, setConditions] = useState<ConditionOptions | null>(null);
  useEffect(() => {
    apiJson<ConditionOptions>("/api/valuation/conditions").then((r) => r.ok && setConditions(r.data));
  }, []);
  const faultOptions = (conditions?.faults ?? []).filter(
    (f) => !form.category || f.appliesTo.includes(form.category)
  );
  const toggleFault = (id: string) =>
    setForm((p) => ({
      ...p,
      faults: p.faults.includes(id) ? p.faults.filter((f) => f !== id) : [...p.faults, id],
    }));

  const [imeiCheck, setImeiCheck] = useState<ImeiCheckResult | null>(null);
  const [checkingImei, setCheckingImei] = useState(false);
  const [imeiError, setImeiError] = useState<string | null>(null);
  const imeiPhotoRef = useRef<HTMLInputElement>(null);

  const [devices, setDevices] = useState<DeviceEntry[]>([]);
  useEffect(() => {
    if (!form.category || !form.subType) {
      setDevices([]);
      return;
    }
    apiFetch(`/api/valuation/devices?category=${form.category}&subType=${form.subType}`)
      .then((r) => r.json())
      .then((d) => setDevices(d.data?.devices ?? []))
      .catch(() => setDevices([]));
  }, [form.category, form.subType]);

  const selectedDevice = devices.find((d) => d.id === form.deviceId);
  const battery = Number(form.batteryHealth);
  const batteryDeduct =
    battery < 80
      ? 20
      : battery < 85
      ? 12
      : battery < 90
      ? 7
      : battery < 95
      ? 3
      : 0;

  const showSnack = (msg: string, severity: "success" | "error" | "info") =>
    setSnack({ open: true, msg, severity });

  const set = <K extends keyof FormData>(field: K, val: FormData[K]) =>
    setForm((p) => ({ ...p, [field]: val }));

  const toggle = (
    field:
      | "batteryChanged"
      | "screenChanged"
      | "cameraChanged"
      | "ramUpgraded"
      | "storageUpgraded"
      | "keyboardChanged"
  ) => setForm((p) => ({ ...p, [field]: !p[field] }));

  // Spaces and dashes are fine for the backend; we keep digits only so the
  // length/Luhn hint below stays simple.
  const handleIMEI = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 15);
    const luhnValid = cleaned.length === 15 ? validateIMEI(cleaned) : null;
    setForm((p) => ({ ...p, imei: cleaned, imeiValid: luhnValid }));
    setImeiCheck(null);
    setImeiError(null);
  };

  // Free IMEI check — valid number, which model it is, reported stolen?
  const runImeiCheck = async (): Promise<boolean> => {
    if (!result) return false;
    setCheckingImei(true);
    setImeiError(null);
    const res = await apiJson<ImeiCheckResult>(
      "/api/imei/check",
      jsonBody({ imei: form.imei, deviceName: result.device.name })
    );
    setCheckingImei(false);
    if (!res.ok || !res.data) {
      setImeiError(res.message || "That IMEI doesn't look right — check it and try again.");
      return false;
    }
    setImeiCheck(res.data);
    if (res.data.reportedStolen) {
      setImeiError("This IMEI has been reported stolen, so it can't be listed on TechNest.");
      return false;
    }
    return true;
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files || []);
    if (!incoming.length) return;

    const combined = [...form.mediaFiles, ...incoming].slice(0, 10);
    const newPreviews = incoming
      .slice(0, 10 - form.mediaFiles.length)
      .map((f) => ({
        url: f.type.startsWith("image/") ? URL.createObjectURL(f) : "",
        isVideo: f.type.startsWith("video/"),
        name: f.name,
      }));

    setForm((p) => ({ ...p, mediaFiles: combined }));
    setPreviews((prev) => [...prev, ...newPreviews].slice(0, 10));
    showSnack(`${combined.length} file(s) ready`, "success");
    e.target.value = "";
  };

  const removeMedia = (i: number) => {
    const removed = previews[i];
    if (removed.url) URL.revokeObjectURL(removed.url);
    setForm((p) => ({
      ...p,
      mediaFiles: p.mediaFiles.filter((_, idx) => idx !== i),
    }));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const estimatePayload = () => ({
    category: form.category,
    subType: form.subType,
    deviceId: form.deviceId,
    customDeviceName: isOther ? form.customDeviceName : undefined,
    customDevicePrice: isOther ? Number(form.customDevicePrice) : undefined,
    batteryHealth: Number(form.batteryHealth),
    batteryChanged: form.batteryChanged,
    screenChanged: form.screenChanged,
    cameraChanged: form.cameraChanged,
    faceIdStatus: form.faceIdStatus || undefined,
    simType: form.simType || undefined,
    keyboardChanged: form.keyboardChanged,
    ramUpgraded: form.ramUpgraded,
    storageUpgraded: form.storageUpgraded,
    otherRepairs: form.otherRepairs || undefined,
    cosmeticGrade: form.cosmeticGrade || undefined,
    faults: form.faults,
    snapchatStatus: isPhone ? form.snapchatStatus : undefined,
    accountLocked: form.accountSignedOut === "no",
    imei: form.imei.length === 15 ? form.imei : undefined,
  });

  const handleCalculate = async () => {
    if (isPhone && form.accountSignedOut === "no") {
      showSnack(
        `Sign out of ${isIphone ? "iCloud (Find My)" : "your Google account"} first — locked devices can't be valued or listed.`,
        "error"
      );
      return;
    }
    if (!form.deviceId) {
      showSnack("Please select a device", "error");
      return;
    }
    if (isOther && (!form.customDeviceName || !form.customDevicePrice)) {
      showSnack("Enter device name and estimated price", "error");
      return;
    }
    setCalculating(true);
    try {
      const res = await apiFetch("/api/valuation/estimate", {
        method: "POST",
        body: JSON.stringify(estimatePayload()),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showSnack(data.message || "Could not calculate valuation. Check your inputs.", "error");
        return;
      }
      const v = data.data.valuation;
      setImeiCheck(null);
      setResult({
        device: {
          name: v.deviceName ?? (isOther ? form.customDeviceName : selectedDevice?.name ?? ""),
          storage: v.storage ?? (isOther ? "" : selectedDevice?.storage ?? ""),
        },
        basePrice: v.basePrice,
        breakdown: v.breakdown,
        deductionPercent: v.deductionPercent,
        minVal: v.min,
        maxVal: v.max,
        value: v.value,
        repairDeduction: v.repairDeduction,
        confidence:
          typeof v.confidence === "string" ? { level: v.confidence } : v.confidence ?? undefined,
        likelyRange: Array.isArray(v.likelyRange)
          ? { min: v.likelyRange[0], max: v.likelyRange[1] }
          : v.likelyRange ?? undefined,
        warnings: toWarnings(v.warnings),
      });
      setStep("result");
      showSnack("Valuation calculated!", "success");
    } catch {
      showSnack("Network error — please try again.", "error");
    } finally {
      setCalculating(false);
    }
  };

  const handleWriteDescription = async () => {
    setGeneratingDescription(true);
    try {
      const res = await apiFetch("/api/listings/assist", {
        method: "POST",
        body: JSON.stringify({ fields: form }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showSnack(data.message || "Could not generate a description.", "error");
        return;
      }
      if (data.data?.suggestion?.description) {
        setDescription(data.data.suggestion.description);
      }
    } catch {
      showSnack("Network error — please try again.", "error");
    } finally {
      setGeneratingDescription(false);
    }
  };

  // ── Publish: converts images to base64 and sends them with the listing ────
  const handlePublish = async () => {
    if (!result || !form.sellerName || !form.sellerPhone) {
      showSnack("Fill in your name and WhatsApp number", "error");
      return;
    }
    if (!isValidNigerianPhone(form.sellerPhone)) {
      showSnack(
        "Enter a valid Nigerian WhatsApp number, e.g. 08012345678",
        "error"
      );
      return;
    }
    setPublishing(true);
    try {
      const repairs: string[] = [];
      if (form.batteryChanged) repairs.push("Battery replaced");
      if (form.screenChanged) repairs.push("Screen replaced");
      if (form.cameraChanged) repairs.push("Camera replaced");
      if (form.faceIdStatus === "broken") repairs.push("Face ID broken");
      if (form.keyboardChanged) repairs.push("Keyboard replaced");
      if (form.otherRepairs.trim()) repairs.push(form.otherRepairs.trim());

      // The backend doesn't proxy file uploads — it hands out a signed
      // Cloudinary payload (POST /api/uploads/signature) and the browser
      // uploads directly to Cloudinary with it. Only fields covered by
      // paramsToSign on the backend (timestamp, folder) can be sent besides
      // file/api_key/signature, or Cloudinary rejects the signature.
      let imeiPhotoUrl: string | undefined;
      if (isPhone && form.imeiPhoto) {
        const [uploaded] = await uploadFiles([form.imeiPhoto]);
        imeiPhotoUrl = uploaded?.url;
      }

      const imageUrls: string[] = [];
      if (form.mediaFiles.length > 0) {
        const sigRes = await apiFetch("/api/uploads/signature", {
          method: "POST",
        });
        if (!sigRes.ok) {
          let errMsg = `Could not start upload (${sigRes.status})`;
          try {
            const errBody = await sigRes.json();
            errMsg = errBody.message || errBody.error || errMsg;
          } catch {
            errMsg = sigRes.statusText || errMsg;
          }
          throw new Error(errMsg);
        }
        const sigJson = await sigRes.json();
        const { signature, timestamp, folder, cloudName, apiKey } =
          sigJson.data ?? sigJson;

        for (const file of form.mediaFiles) {
          const fd = new FormData();
          fd.append("file", file);
          fd.append("api_key", apiKey);
          fd.append("timestamp", String(timestamp));
          fd.append("signature", signature);
          fd.append("folder", folder);

          const uploadRes = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
            { method: "POST", body: fd }
          );
          const uploadJson = await uploadRes.json();
          if (!uploadRes.ok) {
            throw new Error(
              uploadJson.error?.message || "Image upload failed"
            );
          }
          if (!uploadJson.secure_url)
            throw new Error("Upload succeeded but no URL was returned");
          imageUrls.push(uploadJson.secure_url);
        }
      }

      const payload = {
        userName: form.sellerName,
        userPhone: form.sellerPhone,
        deviceName: result.device.name,
        deviceCategory: form.category,
        subType: form.subType,
        storage: result.device.storage || null,
        batteryHealth: form.batteryHealth,
        simType: form.simType || null,
        faceIdStatus: form.faceIdStatus || null,
        repairs,
        mediaCount: form.mediaFiles.length,
        images: imageUrls, // was `mediaImages` — backend's POST / route reads `images`
        // The backend checks the IMEI and sets imeiVerified itself.
        imei: isPhone ? form.imei : undefined,
        imeiPhoto: imeiPhotoUrl,
        snapchatStatus: isPhone ? form.snapchatStatus : undefined,
        estimatedMin: result.minVal,
        estimatedMax: result.maxVal,
        description: description.trim() || undefined,
        listingType: form.listingMode,
        wantedDevice:
          form.listingMode === "swap"
            ? form.wantedDevice === "Custom (type below)"
              ? form.customWantedDevice
              : form.wantedDevice
            : null,
      };

      const res = await apiFetch("/api/listings", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errMsg = `Server error ${res.status}`;
        try {
          const errBody = await res.json();
          errMsg = errBody.error || errBody.message || errMsg;
        } catch {
          errMsg = res.statusText || errMsg;
        }
        throw new Error(errMsg);
      }

      setShowReviewModal(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to publish. Try again.";
      showSnack(message, "error");
      console.error("Publish error:", err);
    } finally {
      setPublishing(false);
    }
  };

  const inp =
    "w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors";
  const inpS = {
    borderColor: "var(--border)",
    color: "var(--ink)",
    background: "var(--surface)",
  };
  const lbl = (txt: string) => (
    <p className="text-sm font-medium mb-2" style={{ color: "var(--ink)" }}>
      {txt}
    </p>
  );

  const choiceBtn = (
    active: boolean,
    onClick: () => void,
    Icon: LucideIcon,
    title: string,
    desc?: string
  ) => (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 py-4 px-3 rounded-xl border-2 text-center transition-all w-full"
      style={{
        borderColor: active ? "var(--ink)" : "var(--border)",
        background: active ? "var(--border)" : "var(--surface)",
        cursor: "pointer",
      }}
    >
      <Icon className="w-6 h-6" style={{ color: "var(--ink)" }} />
      <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
        {title}
      </span>
      {desc && (
        <span className="text-xs" style={{ color: "var(--ink-soft)" }}>
          {desc}
        </span>
      )}
    </button>
  );

  const toggleBtn = (
    field:
      | "batteryChanged"
      | "screenChanged"
      | "cameraChanged"
      | "ramUpgraded"
      | "storageUpgraded"
      | "keyboardChanged",
    Icon: LucideIcon,
    label: string,
    desc: string,
    positive = false
  ) => (
    <button
      onClick={() => toggle(field)}
      className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-all"
      style={{
        borderColor: form[field] ? "var(--ink)" : "var(--border)",
        background: form[field] ? "var(--border)" : "var(--surface)",
        cursor: "pointer",
      }}
    >
      <span
        className="inline-flex items-center gap-2 text-sm"
        style={{ color: "var(--ink)" }}
      >
        <Icon className="w-4 h-4" />
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-semibold"
          style={{ color: positive ? "#16a34a" : "#DC2626" }}
        >
          {desc}
        </span>
        <div
          className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
          style={{
            borderColor: form[field] ? "var(--accent)" : "var(--border)",
            background: form[field] ? "var(--accent)" : "transparent",
          }}
        >
          {form[field] && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
        </div>
      </div>
    </button>
  );

  const regularDevices = devices.filter((d) => !d.id.startsWith("other-"));
  const otherDevice = devices.find((d) => d.id.startsWith("other-"));

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ background: "var(--bg)", color: "var(--ink)" }}
    >
      {showAuthGate && <AuthGateModal onClose={() => setShowAuthGate(false)} />}
      {showReviewModal && (
        <ListingUnderReviewModal
          onClose={() => {
            setShowReviewModal(false);
            router.push("/marketplace");
          }}
        />
      )}

      <Navbar />

      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="relative overflow-hidden rounded-2xl mb-8 py-6">
          <SectionBackground dark={dark} minCount={8} maxCount={20} />
          <div className="relative text-center">
            <h1
              className="text-3xl font-bold mb-2"
              style={{
                color: "var(--ink)",
                fontFamily: "Space Grotesk, sans-serif",
              }}
            >
              Value My Device
            </h1>
            <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
              Get a fair Nigerian market price instantly
            </p>
          </div>
        </div>

        {step === "form" && (
          <div
            className="rounded-2xl p-6 border space-y-6"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            {/* What to do */}
            <div>
              {lbl("What do you want to do?")}
              <div className="grid grid-cols-2 gap-3">
                {choiceBtn(
                  form.listingMode === "sell",
                  () => set("listingMode", "sell"),
                  Wallet,
                  "Sell for Cash",
                  "Get paid in naira"
                )}
                {choiceBtn(
                  form.listingMode === "swap",
                  () => set("listingMode", "swap"),
                  Repeat,
                  "Swap Device",
                  "Trade for another model"
                )}
              </div>
            </div>

            {/* Device type */}
            <div>
              {lbl("What type of device?")}
              <div className="grid grid-cols-2 gap-3">
                {choiceBtn(
                  form.category === "phone",
                  () =>
                    setForm((p) => ({
                      ...p,
                      category: "phone",
                      subType: "",
                      deviceId: "",
                      customDeviceName: "",
                      customDevicePrice: "",
                    })),
                  Smartphone,
                  "Phone"
                )}

                {/* Laptop button wrapped with Coming Soon overlay */}
                <div className="relative w-full">
                  {choiceBtn(false, () => {}, Laptop, "Laptop")}
                  <div
                    className="absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-1"
                    style={{
                      background: "var(--surface)",
                      cursor: "not-allowed",
                    }}
                  >
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{ background: "#020044", color: "#fff" }}
                    >
                      Coming Soon
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Phone sub type */}
            {form.category === "phone" && (
              <div>
                {lbl("iPhone or Android?")}
                <div className="flex gap-3">
                  {/* iPhone — unchanged behaviour */}
                  <button
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        subType: "iphone" as PhoneType,
                        deviceId: "",
                        customDeviceName: "",
                        customDevicePrice: "",
                      }))
                    }
                    className="flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all"
                    style={{
                      borderColor:
                        form.subType === "iphone"
                          ? "var(--ink)"
                          : "var(--border)",
                      background:
                        form.subType === "iphone"
                          ? "var(--border)"
                          : "var(--surface)",
                      color: "var(--ink)",
                      cursor: "pointer",
                    }}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Apple className="w-4 h-4" /> iPhone
                    </span>
                  </button>

                  {/* Android */}
                  <button
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        subType: "android" as PhoneType,
                        deviceId: "",
                        customDeviceName: "",
                        customDevicePrice: "",
                      }))
                    }
                    className="flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all"
                    style={{
                      borderColor:
                        form.subType === "android"
                          ? "var(--ink)"
                          : "var(--border)",
                      background:
                        form.subType === "android"
                          ? "var(--border)"
                          : "var(--surface)",
                      color: "var(--ink)",
                      cursor: "pointer",
                    }}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Bot className="w-4 h-4" /> Android
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Laptop sub type */}
            {form.category === "laptop" && (
              <div>
                {lbl("What type of laptop?")}
                <div className="flex gap-2 flex-wrap">
                  {[
                    { v: "macbook", label: "MacBook", Icon: Apple },
                    { v: "windows", label: "Windows", Icon: AppWindow },
                    { v: "linux", label: "Linux", Icon: Terminal },
                    { v: "gaming", label: "Gaming", Icon: Gamepad2 },
                  ].map(({ v, label, Icon }) => (
                    <button
                      key={v}
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          subType: v as LaptopType,
                          deviceId: "",
                          customDeviceName: "",
                          customDevicePrice: "",
                        }))
                      }
                      className="px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all"
                      style={{
                        borderColor:
                          form.subType === v ? "var(--ink)" : "var(--border)",
                        background:
                          form.subType === v ? "var(--border)" : "var(--surface)",
                        color: "var(--ink)",
                        cursor: "pointer",
                      }}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Icon className="w-4 h-4" /> {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Model select */}
            {form.subType && (
              <div>
                {lbl("Select your exact model & storage")}
                <select
                  className={inp}
                  style={{ ...inpS, cursor: "pointer" }}
                  value={form.deviceId}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      deviceId: e.target.value,
                      customDeviceName: "",
                      customDevicePrice: "",
                    }))
                  }
                >
                  <option value="">Choose a device...</option>
                  {regularDevices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                      {d.storage ? ` ${d.storage}` : ""} —{" "}
                      {formatPrice(d.baseMin)} to {formatPrice(d.baseMax)}
                    </option>
                  ))}
                  {otherDevice && (
                    <>
                      <option disabled>──────────────</option>
                      <option value={otherDevice.id}>
                        Other (type manually)
                      </option>
                    </>
                  )}
                </select>
              </div>
            )}

            {/* Other custom inputs */}
            {isOther && (
              <div
                className="rounded-xl p-4 space-y-3"
                style={{
                  background: "var(--border)",
                  border: "1px solid var(--border)",
                }}
              >
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  Enter your device details
                </p>
                <div>
                  <label
                    className="text-xs font-medium block mb-1"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    Device Name & Storage
                  </label>
                  <input
                    className={inp}
                    style={inpS}
                    placeholder="e.g. iPhone 13 Pro Max 256GB"
                    value={form.customDeviceName}
                    onChange={(e) => set("customDeviceName", e.target.value)}
                  />
                </div>
                <div>
                  <label
                    className="text-xs font-medium block mb-1"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    Estimated Market Price (₦)
                  </label>
                  <input
                    className={inp}
                    style={inpS}
                    type="number"
                    placeholder="e.g. 650000"
                    value={form.customDevicePrice}
                    onChange={(e) => set("customDevicePrice", e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Device specs card */}
            {selectedDevice &&
              !isOther &&
              (selectedDevice.ram ||
                selectedDevice.chip ||
                selectedDevice.display) && (
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: "var(--border)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    Device Specs
                  </p>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    {selectedDevice.chip && (
                      <div>
                        <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                          Chip
                        </p>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--ink)" }}
                        >
                          {selectedDevice.chip}
                        </p>
                      </div>
                    )}
                    {selectedDevice.ram && (
                      <div>
                        <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                          RAM
                        </p>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--ink)" }}
                        >
                          {selectedDevice.ram}
                        </p>
                      </div>
                    )}
                    {selectedDevice.display && (
                      <div className="col-span-2">
                        <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                          Display
                        </p>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--ink)" }}
                        >
                          {selectedDevice.display}
                        </p>
                      </div>
                    )}
                    {selectedDevice.storage && (
                      <div className="col-span-2">
                        <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                          Storage
                        </p>
                        <span
                          className="inline-block text-xs px-2.5 py-0.5 rounded-full font-semibold mt-0.5"
                          style={{
                            background: "var(--border)",
                            color: "var(--ink)",
                          }}
                        >
                          {selectedDevice.storage}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

            {/* Rest of form — shown when device is selected */}
            {form.deviceId &&
              (isOther
                ? form.customDeviceName && form.customDevicePrice
                : true) && (
                <>
                  {/* Battery */}
                  <div>
                    {lbl(`Battery Health: ${form.batteryHealth}%`)}
                    <input
                      type="range"
                      min={50}
                      max={100}
                      value={form.batteryHealth}
                      onChange={(e) => set("batteryHealth", e.target.value)}
                      className="w-full"
                      style={{ accentColor: "var(--accent)", cursor: "pointer" }}
                    />
                    <div
                      className="flex justify-between text-xs mt-1"
                      style={{ color: "var(--ink-soft)" }}
                    >
                      <span>50% Poor</span>
                      <span>75% Average</span>
                      <span>100% Perfect</span>
                    </div>
                    {batteryDeduct > 0 && (
                      <p className="text-xs mt-1" style={{ color: "#DC2626" }}>
                        -{batteryDeduct}% for battery health
                      </p>
                    )}
                  </div>

                  {/* Phone specific */}
                  {isPhone && (
                    <>
                      {/* SIM status */}
                      <div>
                        {lbl("SIM / Lock Status")}
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            {
                              val: "physical" as SimType,
                              lbl: "Physical SIM",
                              desc: "No deduction",
                              color: "#16a34a",
                            },
                            {
                              val: "esim-unlocked" as SimType,
                              lbl: "eSIM Unlocked",
                              desc: "-10%",
                              color: "#d97706",
                            },
                            {
                              val: "locked" as SimType,
                              lbl: "Locked SIM",
                              desc: "-20%",
                              color: "#DC2626",
                            },
                          ].map(({ val, lbl, desc, color }) => (
                            <button
                              key={val}
                              onClick={() => set("simType", val)}
                              className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 text-center transition-all"
                              style={{
                                borderColor:
                                  form.simType === val
                                    ? "var(--ink)"
                                    : "var(--border)",
                                background:
                                  form.simType === val
                                    ? "var(--border)"
                                    : "var(--surface)",
                                cursor: "pointer",
                              }}
                            >
                              <span
                                className="text-xs font-semibold"
                                style={{ color: "var(--ink)" }}
                              >
                                {lbl}
                              </span>
                              <span
                                className="text-xs font-medium"
                                style={{ color }}
                              >
                                {desc}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* iPhone only */}
                      {isIphone && (
                        <>
                          {/* Face ID */}
                          <div>
                            {lbl("Face ID Status")}
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                {
                                  val: "working" as FaceIdStatus,
                                  Icon: Lock,
                                  lbl: "Face ID Works",
                                  desc: "No deduction",
                                  color: "#16a34a",
                                },
                                {
                                  val: "broken" as FaceIdStatus,
                                  Icon: Unlock,
                                  lbl: "Face ID Broken",
                                  desc: "-15%",
                                  color: "#DC2626",
                                },
                              ].map(({ val, Icon, lbl, desc, color }) => (
                                <button
                                  key={val}
                                  onClick={() => set("faceIdStatus", val)}
                                  className="relative flex flex-col items-center gap-2 py-5 rounded-xl border-2 text-center transition-all"
                                  style={{
                                    borderColor:
                                      form.faceIdStatus === val
                                        ? "var(--ink)"
                                        : "var(--border)",
                                    background:
                                      form.faceIdStatus === val
                                        ? "var(--border)"
                                        : "var(--surface)",
                                    cursor: "pointer",
                                  }}
                                >
                                  {form.faceIdStatus === val && (
                                    <div
                                      className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                                      style={{ background: "var(--accent)" }}
                                    >
                                      <Check
                                        className="w-3 h-3 text-white"
                                        strokeWidth={3}
                                      />
                                    </div>
                                  )}
                                  <Icon
                                    className="w-6 h-6"
                                    style={{ color: "var(--ink)" }}
                                  />
                                  <span
                                    className="text-xs font-semibold"
                                    style={{ color: "var(--ink)" }}
                                  >
                                    {lbl}
                                  </span>
                                  <span
                                    className="text-xs font-medium"
                                    style={{ color }}
                                  >
                                    {desc}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Phone repairs */}
                      <div>
                        {lbl("Repairs & Replacements")}
                        <div className="space-y-2">
                          {toggleBtn(
                            "batteryChanged",
                            BatteryFull,
                            "Battery replaced",
                            "-5%"
                          )}
                          {toggleBtn(
                            "screenChanged",
                            Smartphone,
                            "Screen replaced",
                            "-12%"
                          )}
                          {toggleBtn(
                            "cameraChanged",
                            Camera,
                            "Camera replaced",
                            "-8%"
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Laptop repairs */}
                  {isLaptop && (
                    <div>
                      {lbl("Repairs, Replacements & Upgrades")}
                      <div className="space-y-2">
                        {toggleBtn(
                          "screenChanged",
                          Monitor,
                          "Screen replaced",
                          "-12%"
                        )}
                        {toggleBtn(
                          "batteryChanged",
                          BatteryFull,
                          "Battery replaced",
                          "-5%"
                        )}
                        {toggleBtn(
                          "keyboardChanged",
                          Keyboard,
                          "Keyboard replaced",
                          "-8%"
                        )}
                        {toggleBtn(
                          "ramUpgraded",
                          Zap,
                          "RAM upgraded",
                          "+5%",
                          true
                        )}
                        {toggleBtn(
                          "storageUpgraded",
                          HardDrive,
                          "Storage upgraded",
                          "+5%",
                          true
                        )}
                      </div>
                    </div>
                  )}

                  {/* Cosmetic grade */}
                  {!!conditions?.cosmeticGrades.length && (
                    <div>
                      {lbl("How does it look?")}
                      <div className="grid grid-cols-2 gap-2">
                        {conditions.cosmeticGrades.map((g) => {
                          const active = form.cosmeticGrade === g.id;
                          return (
                            <button
                              key={g.id}
                              onClick={() => set("cosmeticGrade", g.id as CosmeticGrade)}
                              className="flex items-start gap-2 px-3 py-3 rounded-xl border-2 text-left transition-all"
                              style={{
                                borderColor: active ? "var(--ink)" : "var(--border)",
                                background: active ? "var(--border)" : "var(--surface)",
                                cursor: "pointer",
                              }}
                            >
                              <Sparkle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--ink)" }} />
                              <span className="text-xs font-medium" style={{ color: "var(--ink)" }}>
                                {g.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Faults */}
                  {faultOptions.length > 0 && (
                    <div>
                      {lbl("What's not working?")}
                      <p className="text-xs -mt-1 mb-2" style={{ color: "var(--ink-soft)" }}>
                        Tick anything that applies — fixable faults are priced from our repair list.
                      </p>
                      <div className="space-y-2">
                        {faultOptions.map((f) => {
                          const active = form.faults.includes(f.id);
                          return (
                            <button
                              key={f.id}
                              onClick={() => toggleFault(f.id)}
                              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-all"
                              style={{
                                borderColor: active ? "var(--ink)" : "var(--border)",
                                background: active ? "var(--border)" : "var(--surface)",
                                cursor: "pointer",
                              }}
                            >
                              <span className="text-sm" style={{ color: "var(--ink)" }}>
                                {f.label}
                              </span>
                              <div
                                className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0"
                                style={{
                                  borderColor: active ? "var(--accent)" : "var(--border)",
                                  background: active ? "var(--accent)" : "transparent",
                                }}
                              >
                                {active && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {isPhone && (
                    <>
                      {/* Snapchat */}
                      <div>
                        {lbl("Does Snapchat work on it?")}
                        <div className="grid grid-cols-3 gap-2">
                          {(
                            [
                              { val: "works", label: "Yes, it works", color: "#16a34a" },
                              { val: "banned", label: "No — banned", color: "#DC2626" },
                              { val: "unknown", label: "Not sure", color: "var(--ink-soft)" },
                            ] as { val: SnapchatStatus; label: string; color: string }[]
                          ).map(({ val, label, color }) => (
                            <button
                              key={val}
                              onClick={() => set("snapchatStatus", val)}
                              className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 text-center transition-all"
                              style={{
                                borderColor: form.snapchatStatus === val ? "var(--ink)" : "var(--border)",
                                background: form.snapchatStatus === val ? "var(--border)" : "var(--surface)",
                                cursor: "pointer",
                              }}
                            >
                              <Ghost className="w-4 h-4" style={{ color }} />
                              <span className="text-xs font-semibold" style={{ color: "var(--ink)" }}>
                                {label}
                              </span>
                            </button>
                          ))}
                        </div>
                        <p className="text-xs mt-1.5" style={{ color: "var(--ink-soft)" }}>
                          Many buyers check this — a device-banned phone sells for less.
                        </p>
                      </div>

                      {/* Account lock */}
                      <div>
                        {lbl(isIphone ? "Signed out of iCloud (Find My off)?" : "Signed out of your Google account?")}
                        <div className="grid grid-cols-2 gap-3">
                          {(
                            [
                              { val: "yes", label: "Yes, signed out", Icon: Unlock, color: "#16a34a" },
                              { val: "no", label: "Not yet", Icon: KeyRound, color: "#DC2626" },
                            ] as const
                          ).map(({ val, label, Icon, color }) => (
                            <button
                              key={val}
                              onClick={() => set("accountSignedOut", val)}
                              className="flex flex-col items-center gap-1.5 py-4 rounded-xl border-2 text-center transition-all"
                              style={{
                                borderColor: form.accountSignedOut === val ? "var(--ink)" : "var(--border)",
                                background: form.accountSignedOut === val ? "var(--border)" : "var(--surface)",
                                cursor: "pointer",
                              }}
                            >
                              <Icon className="w-5 h-5" style={{ color }} />
                              <span className="text-xs font-semibold" style={{ color: "var(--ink)" }}>
                                {label}
                              </span>
                            </button>
                          ))}
                        </div>
                        {form.accountSignedOut === "no" && (
                          <p className="inline-flex items-start gap-1 text-xs mt-1.5 font-medium" style={{ color: "#DC2626" }}>
                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
                            A phone still linked to {isIphone ? "an Apple ID" : "a Google account"} can&apos;t be sold
                            or swapped — sign out first, then come back.
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Swap target */}
                  {form.listingMode === "swap" && (
                    <div>
                      {lbl("What device do you want?")}
                      <select
                        className={inp}
                        style={{ ...inpS, cursor: "pointer" }}
                        value={form.wantedDevice}
                        onChange={(e) => set("wantedDevice", e.target.value)}
                      >
                        <option value="">Select target device...</option>
                        {wantedDevices.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      {form.wantedDevice === "Custom (type below)" && (
                        <input
                          className={`${inp} mt-2`}
                          style={inpS}
                          placeholder="Type exact device name and storage"
                          value={form.customWantedDevice}
                          onChange={(e) =>
                            set("customWantedDevice", e.target.value)
                          }
                        />
                      )}
                    </div>
                  )}

                  {/* Other issues */}
                  <div>
                    {lbl("Other Issues (optional)")}
                    <textarea
                      rows={2}
                      className={`${inp} resize-none`}
                      style={inpS}
                      placeholder={
                        isLaptop
                          ? "e.g. hinge loose, fan noisy..."
                          : "e.g. back glass cracked..."
                      }
                      value={form.otherRepairs}
                      onChange={(e) => set("otherRepairs", e.target.value)}
                    />
                    {form.otherRepairs.trim() && (
                      <p className="text-xs mt-1" style={{ color: "#DC2626" }}>
                        -5% for additional repairs
                      </p>
                    )}
                  </div>

                  {/* Listing description */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      {lbl("Description (optional)")}
                      <button
                        onClick={handleWriteDescription}
                        disabled={generatingDescription}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50"
                        style={{ background: "var(--border)", color: "var(--ink)", cursor: "pointer" }}
                      >
                        {generatingDescription ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        Write it for me
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      maxLength={1000}
                      className={`${inp} resize-none`}
                      style={inpS}
                      placeholder="What buyers should know about this device..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  {/* Media upload */}
                  <div>
                    {lbl("Photos & Videos (optional)")}

                    {isIphone && (
                      <div
                        className="rounded-xl p-3 mb-3 flex items-start gap-2.5"
                        style={{
                          background: "var(--border)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <ClipboardList
                          className="w-5 h-5 mt-0.5 flex-shrink-0"
                          style={{ color: "var(--ink)" }}
                        />
                        <div>
                          <p
                            className="text-xs font-semibold mb-0.5"
                            style={{ color: "var(--ink)" }}
                          >
                            Parts &amp; Services screenshot required
                          </p>
                          <p
                            className="text-xs leading-relaxed"
                            style={{ color: "var(--ink-soft)" }}
                          >
                            Go to{" "}
                            <strong style={{ color: "var(--ink)" }}>
                              Settings → General → About → Parts and Services
                            </strong>{" "}
                            and include a screenshot in your uploads below.
                          </p>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-8 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 transition-colors hover:opacity-80"
                      style={{
                        borderColor: "var(--border)",
                        cursor: "pointer",
                      }}
                    >
                      <Camera className="w-6 h-6" style={{ color: "var(--ink-soft)" }} />
                      <span className="text-sm" style={{ color: "var(--ink-soft)" }}>
                        Tap to upload photos or videos
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "var(--ink-soft)" }}
                      >
                        {previews.length > 0
                          ? `${previews.length} file(s) added — tap to add more`
                          : `Max 10 files${
                              isIphone
                                ? " · include Parts & Services screenshot"
                                : ""
                            }`}
                      </span>
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={handleMediaUpload}
                    />

                    {/* Preview grid */}
                    {previews.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mt-3">
                        {previews.map((preview, i) => (
                          <div
                            key={i}
                            className="relative rounded-xl overflow-hidden"
                            style={{
                              aspectRatio: "1",
                              background: "var(--border)",
                            }}
                          >
                            {preview.isVideo ? (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                                <Video
                                  className="w-6 h-6"
                                  style={{ color: "var(--ink-soft)" }}
                                />
                                <span
                                  className="text-xs text-center px-1 truncate w-full"
                                  style={{ color: "var(--ink-soft)", fontSize: 9 }}
                                >
                                  {preview.name}
                                </span>
                              </div>
                            ) : preview.url ? (
                              <img
                                src={preview.url}
                                alt={`upload-${i}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FileText
                                  className="w-6 h-6"
                                  style={{ color: "var(--ink-soft)" }}
                                />
                              </div>
                            )}
                            <button
                              onClick={() => removeMedia(i)}
                              className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md"
                              style={{
                                background: "#DC2626",
                                cursor: "pointer",
                                lineHeight: 1,
                              }}
                            >
                              ×
                            </button>
                            <div
                              className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-white"
                              style={{
                                background: "rgba(0,0,0,0.5)",
                                fontSize: 9,
                              }}
                            >
                              {i + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {previews.length > 0 && (
                      <p
                        className="text-xs mt-2 text-center"
                        style={{ color: "var(--ink-soft)" }}
                      >
                        {previews.length} of 10 files uploaded
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleCalculate}
                    disabled={calculating}
                    style={{ background: "#020044", cursor: "pointer" }}
                    className="w-full text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity text-sm disabled:opacity-60 inline-flex items-center justify-center gap-2"
                  >
                    {calculating && <Loader2 className="w-4 h-4 animate-spin" />}
                    Calculate My Device Value →
                  </button>
                </>
              )}
          </div>
        )}

        {/* RESULT */}
        {step === "result" && result && (
          <div className="space-y-4">
            <div
              className="rounded-2xl p-6 border"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <p
                className="text-sm text-center mb-1"
                style={{ color: "var(--ink-soft)" }}
              >
                Your {result.device.name}
                {result.device.storage ? ` (${result.device.storage})` : ""} is
                worth
              </p>
              <h2
                className="text-3xl font-bold text-center mb-1"
                style={{
                  color: "var(--ink)",
                  fontFamily: "Space Grotesk, sans-serif",
                }}
              >
                {formatPrice(result.minVal)} – {formatPrice(result.maxVal)}
              </h2>
              <p
                className="text-xs text-center mb-3"
                style={{ color: "var(--ink-soft)" }}
              >
                {result.deductionPercent > 0
                  ? `${result.deductionPercent}% deducted for condition`
                  : "No deductions — excellent condition!"}
              </p>
              {(result.confidence || result.likelyRange) && (
                <div className="flex flex-col items-center gap-1.5 mb-5">
                  {result.confidence && CONFIDENCE_STYLE[result.confidence.level] && (
                    <span
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{
                        background: CONFIDENCE_STYLE[result.confidence.level].bg,
                        color: CONFIDENCE_STYLE[result.confidence.level].color,
                      }}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {CONFIDENCE_STYLE[result.confidence.level].label}
                    </span>
                  )}
                  {result.likelyRange &&
                    (result.likelyRange.min !== result.minVal || result.likelyRange.max !== result.maxVal) && (
                      <p className="text-xs" style={{ color: "var(--ink)" }}>
                        Likely {formatPrice(result.likelyRange.min)}–{formatPrice(result.likelyRange.max)}
                      </p>
                    )}
                  {result.confidence?.reason && (
                    <p className="text-[11px] text-center" style={{ color: "var(--ink-soft)" }}>
                      {result.confidence.reason}
                    </p>
                  )}
                </div>
              )}
              {result.warnings.length > 0 && (
                <div className="space-y-2 mb-5">
                  {result.warnings.map((w) => (
                    <div
                      key={w}
                      className="rounded-xl p-3 flex items-start gap-2 text-xs"
                      style={{ background: "rgba(217,119,6,0.1)", color: "var(--ink)" }}
                    >
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#d97706" }} />
                      {w}
                    </div>
                  ))}
                </div>
              )}
              <div className="mb-5">
                <div
                  className="flex justify-between text-xs mb-1"
                  style={{ color: "var(--ink-soft)" }}
                >
                  <span>Condition Score</span>
                  <span className="font-semibold" style={{ color: "var(--ink)" }}>
                    {100 - result.deductionPercent}%
                  </span>
                </div>
                <div
                  className="h-2 rounded-full"
                  style={{ background: "var(--border)" }}
                >
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.max(5, 100 - result.deductionPercent)}%`,
                      background: "var(--accent)",
                    }}
                  />
                </div>
              </div>
              <div
                className="space-y-2 pt-4"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: "var(--ink-soft)" }}
                >
                  Price Breakdown
                </p>
                <Row
                  label="Base market price"
                  val={formatPrice(result.basePrice)}
                />
                {result.device.storage && (
                  <Row
                    label="Storage"
                    val={result.device.storage}
                    valColor="var(--accent)"
                  />
                )}
                {result.breakdown.map((item) => {
                  const positive = (item.amount ?? item.percent) >= 0;
                  return (
                    <Row
                      key={item.label}
                      label={item.label}
                      val={
                        typeof item.amount === "number" ? (
                          <span className="inline-flex items-baseline gap-1.5">
                            {positive ? "+" : "−"}
                            {formatPrice(Math.abs(item.amount))}
                            <span className="text-[11px] font-normal" style={{ color: "var(--ink-soft)" }}>
                              {Math.round(Math.abs(item.percent) * 100)}%
                            </span>
                          </span>
                        ) : (
                          `${item.percent > 0 ? "+" : ""}${Math.round(item.percent * 100)}%`
                        )
                      }
                      valColor={positive ? "#16a34a" : "#DC2626"}
                    />
                  );
                })}
                {!!result.repairDeduction && (
                  <Row
                    label="Of which: repairs needed"
                    val={`−${formatPrice(result.repairDeduction)}`}
                    valColor="var(--ink-soft)"
                  />
                )}
                {form.faceIdStatus === "working" && (
                  <Row
                    label="Face ID"
                    val={
                      <span className="inline-flex items-center gap-1">
                        Working <Check className="w-3.5 h-3.5" />
                      </span>
                    }
                    valColor="#16a34a"
                  />
                )}
                {form.simType === "physical" && (
                  <Row
                    label="Physical SIM + eSIM, unlocked"
                    val="No deduction"
                    valColor="#16a34a"
                  />
                )}

                <div
                  className="flex justify-between pt-2 font-semibold"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <span style={{ color: "var(--ink)" }}>Your valuation</span>
                  <span style={{ color: "var(--ink)" }}>
                    {formatPrice(result.minVal)} – {formatPrice(result.maxVal)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep("form")}
                className="flex-1 border text-sm font-medium py-3 rounded-xl"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--ink)",
                  cursor: "pointer",
                }}
              >
                ← Adjust
              </button>
              <button
                onClick={() => {
                  if (!user) {
                    setShowAuthGate(true);
                    return;
                  }
                  setStep("imei");
                }}
                style={{ background: "#020044", cursor: "pointer" }}
                className="flex-1 text-white text-sm font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
              >
                {form.listingMode === "swap"
                  ? "Post Swap Request →"
                  : "List for Sale →"}
              </button>
            </div>
            <a
              href={`https://wa.me/2348186450477?text=Hi, I want to sell my ${
                result.device.name
              }${
                result.device.storage ? ` (${result.device.storage})` : ""
              }. Valued at ${formatPrice(result.minVal)} – ${formatPrice(
                result.maxVal
              )}.`}
              target="_blank"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white text-sm font-semibold no-underline"
              style={{ background: "#25d366", cursor: "pointer" }}
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp to Sell Directly
            </a>
          </div>
        )}

        {/* IMEI VERIFICATION STEP */}
        {step === "imei" && result && (
          <div
            className="rounded-2xl p-6 border space-y-6"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "var(--border)", color: "var(--ink)" }}
              >
                <Search className="w-6 h-6" />
              </div>
              <h2
                className="text-xl font-bold mb-1"
                style={{
                  color: "var(--ink)",
                  fontFamily: "Space Grotesk, sans-serif",
                }}
              >
                Verify Your Device
              </h2>
              <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                {isPhone
                  ? "Enter your IMEI — we check it isn't reported stolen and matches the model"
                  : "Confirm your device details before listing"}
              </p>
            </div>

            {/* Valuation summary */}
            <div
              className="rounded-xl p-4"
              style={{
                background: "var(--border)",
                border: "1px solid var(--border)",
              }}
            >
              <p className="text-xs mb-0.5" style={{ color: "var(--ink-soft)" }}>
                Device being listed
              </p>
              <p
                className="font-semibold"
                style={{
                  color: "var(--ink)",
                  fontFamily: "Space Grotesk, sans-serif",
                }}
              >
                {result.device.name}
                {result.device.storage ? ` (${result.device.storage})` : ""}
              </p>
              <p
                className="text-sm font-bold mt-1"
                style={{ color: "var(--ink)" }}
              >
                {formatPrice(result.minVal)} – {formatPrice(result.maxVal)}
              </p>
            </div>

            {/* IMEI input — required for every phone */}
            {isPhone ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--ink)" }}
                    >
                      IMEI Number
                    </p>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(220,38,38,0.08)",
                        color: "#DC2626",
                      }}
                    >
                      Required for phones
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="15-digit IMEI (dial *#06#)"
                      className={inp}
                      style={{
                        ...inpS,
                        borderColor:
                          form.imei.length === 15 && !form.imeiValid
                            ? "#DC2626"
                            : form.imeiValid
                            ? "#16a34a"
                            : "var(--border)",
                      }}
                      value={form.imei}
                      onChange={(e) => handleIMEI(e.target.value)}
                      maxLength={15}
                    />
                    {form.imei.length === 15 && (
                      <span
                        className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-xs font-bold"
                        style={{
                          color: form.imeiValid ? "#16a34a" : "#DC2626",
                        }}
                      >
                        {form.imeiValid ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" /> Invalid
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  <p className="text-xs mt-1.5" style={{ color: "var(--ink-soft)" }}>
                    Dial <strong>*#06#</strong> to find your IMEI. Spaces and dashes are fine.
                  </p>
                  {imeiCheck && !imeiCheck.reportedStolen && (
                    <div
                      className="rounded-xl p-3 mt-3 flex items-start gap-2 text-xs"
                      style={{
                        background:
                          imeiCheck.modelMatch === "mismatch" ? "rgba(217,119,6,0.1)" : "rgba(22,163,74,0.08)",
                        color: "var(--ink)",
                      }}
                    >
                      {imeiCheck.modelMatch === "mismatch" ? (
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#d97706" }} />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#16a34a" }} />
                      )}
                      <span>
                        IMEI checked ✓ ending {imeiCheck.imeiLast4 ?? form.imei.slice(-4)}
                        {imeiCheck.device?.model && (
                          <>
                            {" "}
                            — {imeiCheck.device.brand} {imeiCheck.device.model}
                          </>
                        )}
                        {imeiCheck.modelMatch === "mismatch" &&
                          `. That's not a ${result.device.name} — check you picked the right model, or admins will ask.`}
                      </span>
                    </div>
                  )}
                  {imeiError && (
                    <p className="inline-flex items-start gap-1 text-xs mt-2 font-medium" style={{ color: "#DC2626" }}>
                      <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-px" /> {imeiError}
                    </p>
                  )}
                </div>

                {/* IMEI screenshot (optional) */}
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: "var(--ink)" }}>
                    Screenshot of the *#06# screen{" "}
                    <span className="font-normal text-xs" style={{ color: "var(--ink-soft)" }}>
                      (optional, speeds up review)
                    </span>
                  </p>
                  <button
                    onClick={() => imeiPhotoRef.current?.click()}
                    className="w-full py-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-sm transition-colors hover:opacity-80"
                    style={{ borderColor: "var(--border)", color: "var(--ink-soft)", cursor: "pointer" }}
                  >
                    <ImagePlus className="w-4 h-4" />
                    {form.imeiPhoto ? form.imeiPhoto.name : "Add screenshot"}
                  </button>
                  <input
                    ref={imeiPhotoRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      set("imeiPhoto", e.target.files?.[0] ?? null);
                      e.target.value = "";
                    }}
                  />
                  <p
                    className="inline-flex items-center gap-1 text-xs mt-1 font-medium"
                    style={{ color: "#DC2626" }}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> Devices flagged
                    as stolen will be removed and reported to the NPF.
                  </p>
                </div>

                {/* Parts & Services reminder */}
                {isIphone && (
                <div
                  className="rounded-xl p-3 flex items-start gap-2.5"
                  style={{
                    background: "var(--border)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <ClipboardList
                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                    style={{ color: "var(--ink)" }}
                  />
                  <div>
                    <p
                      className="text-xs font-semibold mb-0.5"
                      style={{ color: "var(--ink)" }}
                    >
                      Parts &amp; Services screenshot required
                    </p>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "var(--ink-soft)" }}
                    >
                      Go to{" "}
                      <strong style={{ color: "var(--ink)" }}>
                        Settings → General → About → Parts and Services
                      </strong>{" "}
                      and include a screenshot when uploading photos.
                    </p>
                  </div>
                </div>
                )}
              </div>
            ) : (
              <div
                className="rounded-xl p-4 flex items-center gap-3"
                style={{
                  background: "rgba(22,163,74,0.06)",
                  border: "1px solid rgba(22,163,74,0.2)",
                }}
              >
                <CheckCircle2 className="w-6 h-6" style={{ color: "#16a34a" }} />
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "#16a34a" }}
                  >
                    Device confirmed
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>
                    No IMEI required for this device type. You&apos;re good to
                    proceed.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep("result")}
                className="flex-1 border text-sm font-medium py-3 rounded-xl"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--ink)",
                  cursor: "pointer",
                }}
              >
                ← Back
              </button>
              <button
                onClick={async () => {
                  if (isPhone) {
                    if (form.imei.length !== 15 || !form.imeiValid) {
                      showSnack("A valid 15-digit IMEI is required for phones", "error");
                      return;
                    }
                    if (!(await runImeiCheck())) return;
                  }
                  setStep("publish");
                }}
                disabled={checkingImei}
                style={{ background: "#020044", cursor: "pointer" }}
                className="flex-1 text-white text-sm font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {checkingImei && <Loader2 className="w-4 h-4 animate-spin" />}
                {checkingImei ? "Checking IMEI…" : "Continue →"}
              </button>
            </div>
          </div>
        )}

        {/* PUBLISH */}
        {step === "publish" && result && (
          <div
            className="rounded-2xl p-6 border space-y-5"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div>
              <h2
                className="text-xl font-bold mb-1"
                style={{
                  color: "var(--ink)",
                  fontFamily: "Space Grotesk, sans-serif",
                }}
              >
                {form.listingMode === "swap"
                  ? "Post Swap Request"
                  : "List Your Device"}
              </h2>
              <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                {form.listingMode === "swap"
                  ? "Vendors see your swap request — TechNest arranges the deal with you"
                  : "After a quick review your listing goes live and vendors can send offers"}
              </p>
            </div>
            <div
              className="rounded-xl p-4"
              style={{
                background: "var(--border)",
                border: "1px solid var(--border)",
              }}
            >
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: "var(--ink)" }}
              >
                {result.device.name}
                {result.device.storage ? ` (${result.device.storage})` : ""}
              </p>
              <p className="font-bold" style={{ color: "var(--ink)" }}>
                {formatPrice(result.minVal)} – {formatPrice(result.maxVal)}
              </p>
              {form.listingMode === "swap" && form.wantedDevice && (
                <p className="text-xs mt-1" style={{ color: "var(--accent)" }}>
                  Wants:{" "}
                  {form.wantedDevice === "Custom (type below)"
                    ? form.customWantedDevice
                    : form.wantedDevice}
                </p>
              )}
            </div>

            <div>
              <label
                className="text-sm font-medium block mb-1.5"
                style={{ color: "var(--ink)" }}
              >
                Your Name *
              </label>
              <input
                className={inp}
                style={inpS}
                placeholder="John Doe"
                required
                value={form.sellerName}
                onChange={(e) => set("sellerName", e.target.value)}
              />
            </div>

            <div>
              <label
                className="text-sm font-medium block mb-1.5"
                style={{ color: "var(--ink)" }}
              >
                WhatsApp Number *
              </label>
              <input
                className={inp}
                style={inpS}
                type="tel"
                placeholder="08012345678"
                required
                pattern={NIGERIA_PHONE_REGEX.source}
                title={NIGERIA_PHONE_TITLE}
                value={form.sellerPhone}
                onChange={(e) => set("sellerPhone", e.target.value)}
              />
              <p className="text-xs mt-1" style={{ color: "var(--ink-soft)" }}>
                Only TechNest sees this — we&apos;ll message you here about offers and buyers
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("imei")}
                className="flex-1 border text-sm font-medium py-3 rounded-xl"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--ink)",
                  cursor: "pointer",
                }}
              >
                ← Back
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing || !form.sellerName || !form.sellerPhone}
                style={{ background: "#020044", cursor: "pointer" }}
                className="flex-1 text-white text-sm font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {publishing
                  ? "Publishing..."
                  : form.listingMode === "swap"
                  ? "Post Swap Request"
                  : "Publish Listing"}
              </button>
            </div>
          </div>
        )}
      </div>

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </div>
  );
}

function Row({
  label,
  val,
  valColor,
}: {
  label: string;
  val: ReactNode;
  valColor?: string;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span style={{ color: "var(--ink-soft)" }}>{label}</span>
      <span className="font-medium" style={{ color: valColor || "var(--ink)" }}>
        {val}
      </span>
    </div>
  );
}

export default function ValuePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen" style={{ background: "var(--bg)" }} />
      }
    >
      <ValueContent />
    </Suspense>
  );
}
