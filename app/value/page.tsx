"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, Suspense, useEffect } from "react";
import { formatPrice } from "../lib/helpers";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { apiFetch } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import {
  type FormData,
  type ListingMode,
  type PhoneType,
  type LaptopType,
  type SimType,
  type FaceIdStatus,
  initialForm,
  wantedDevices,
  getDevices,
  validateIMEI,
  calculateValuation,
} from "../data/gadget";

// ── Auth Gate Modal ──────────────────────────────────────────────────────────
function AuthGateModal({
  onClose,
  onRedirect,
}: {
  onClose: () => void;
  onRedirect: (path: string) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm p-6"
        style={{ border: "1px solid rgba(2,0,68,0.1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
          style={{ background: "rgba(2,0,68,0.06)" }}
        >
          🔐
        </div>
        <h3
          className="text-lg font-bold text-center mb-1"
          style={{ color: "#020044", fontFamily: "Space Grotesk, sans-serif" }}
        >
          Sign in to list your device
        </h3>
        <p className="text-sm text-center mb-6" style={{ color: "#6B6B8A" }}>
          Create a free account or sign in to publish your listing on TechNest.
        </p>
        <div className="space-y-2">
          <button
            onClick={() => onRedirect("/auth/register?redirect=/value")}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: "#020044", color: "#fff", cursor: "pointer" }}
          >
            Create Free Account
          </button>
          <button
            onClick={() => onRedirect("/auth/login?redirect=/value")}
            className="w-full py-3 rounded-xl text-sm font-medium border transition-colors"
            style={{
              color: "#020044",
              borderColor: "rgba(2,0,68,0.2)",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-xs"
            style={{ color: "#6B6B8A", cursor: "pointer" }}
          >
            Maybe later — continue valuing
          </button>
        </div>
      </div>
    </div>
  );
}

function ValueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultMode = (searchParams.get("type") as ListingMode) || "sell";
  const [form, setForm] = useState<FormData>({
    ...initialForm,
    listingMode: defaultMode,
  });
  const [result, setResult] =
    useState<ReturnType<typeof calculateValuation>>(null);
  const [step, setStep] = useState<"form" | "result" | "imei" | "publish">(
    "form"
  );
  const [previews, setPreviews] = useState<
    { url: string; isVideo: boolean; name: string }[]
  >([]);
  const [publishing, setPublishing] = useState(false);
  const [snack, setSnack] = useState<{
    open: boolean;
    msg: string;
    severity: "success" | "error" | "info";
  }>({ open: false, msg: "", severity: "info" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stolenAlert, setStolenAlert] = useState(false);
  const [imeiChecking, setImeiChecking] = useState(false);
  const [imeiReport, setImeiReport] = useState<string | null>(null);
  const [showAuthGate, setShowAuthGate] = useState(false);

  const { user } = useAuth() as { user: { name?: string; phone?: string } };
  useEffect(() => {
    const savedForm = sessionStorage.getItem("tn_pending_form");
    const savedResult = sessionStorage.getItem("tn_pending_result");
    const savedStep = sessionStorage.getItem("tn_pending_step");

    if (savedForm && user) {
      try {
        setForm(JSON.parse(savedForm));
        if (savedResult) setResult(JSON.parse(savedResult));
        if (savedStep)
          setStep(savedStep as "form" | "result" | "imei" | "publish");
        sessionStorage.removeItem("tn_pending_form");
        sessionStorage.removeItem("tn_pending_result");
        sessionStorage.removeItem("tn_pending_step");
      } catch {
        // ignore parse errors
      }
    }

    // Auto-fill name from logged in user
    if (user) {
      setForm((p) => ({
        ...p,
        sellerName: user.name || p.sellerName,
        sellerPhone: user.phone || p.sellerPhone,
      }));
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
  const devices = getDevices(form.category, form.subType);
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

  const handleIMEI = async (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 15);
    const luhnValid = cleaned.length === 15 ? validateIMEI(cleaned) : null;
    setForm((p) => ({ ...p, imei: cleaned, imeiValid: luhnValid }));
    setImeiReport(null);
    if (cleaned.length === 15 && luhnValid) {
      setImeiChecking(true);
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 300,
            messages: [
              {
                role: "user",
                content: `You are an IMEI verification assistant for a Nigerian gadget marketplace called TechNest. The user has entered IMEI: ${cleaned}. Based on this IMEI, extract what you can from the TAC (first 8 digits: ${cleaned.slice(
                  0,
                  8
                )}) to identify the device manufacturer and model family. Respond in this exact JSON format only, no markdown: {"manufacturer":"...","model":"...","status":"clean" or "flagged","report":"one sentence","flagged":true or false}`,
              },
            ],
          }),
        });
        const data = await response.json();
        const text = data.content?.[0]?.text || "";
        try {
          const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
          if (parsed.flagged) {
            setStolenAlert(true);
            setForm((p) => ({ ...p, imeiValid: false }));
          } else {
            setImeiReport(
              parsed.report ||
                `Device appears to be ${parsed.manufacturer} ${parsed.model} — status: clean.`
            );
          }
        } catch {
          setImeiReport("IMEI format valid — device report unavailable.");
        }
      } catch {
        setImeiReport("IMEI format valid — AI check temporarily unavailable.");
      } finally {
        setImeiChecking(false);
      }
    }
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

  // Save form to sessionStorage before redirecting to auth
  const saveFormAndRedirect = (path: string) => {
    sessionStorage.setItem("tn_pending_form", JSON.stringify(form));
    sessionStorage.setItem(
      "tn_pending_result",
      result ? JSON.stringify(result) : ""
    );
    sessionStorage.setItem("tn_pending_step", "result");
    router.push(path);
  };

  const handleCalculate = () => {
    if (!form.deviceId) {
      showSnack("Please select a device", "error");
      return;
    }
    if (isOther && (!form.customDeviceName || !form.customDevicePrice)) {
      showSnack("Enter device name and estimated price", "error");
      return;
    }
    const res = calculateValuation(form);
    if (!res) {
      showSnack("Could not calculate valuation. Check your inputs.", "error");
      return;
    }
    setResult(res);
    setStep("result");
    showSnack("Valuation calculated!", "success");
  };

  const handlePublish = async () => {
    if (!result || (!form.sellerName && !user?.name) || !form.sellerPhone) {
      showSnack("Fill in your name and WhatsApp number", "error");
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

      const mediaImages: { data: string; type: string; name: string }[] = [];
      await Promise.all(
        form.mediaFiles
          .filter((file) => file.type.startsWith("image/"))
          .map(
            (file) =>
              new Promise<void>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                  const b64 = (reader.result as string).split(",")[1];
                  mediaImages.push({
                    data: b64,
                    type: file.type,
                    name: file.name,
                  });
                  resolve();
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
              })
          )
      );

      const payload = {
        userName: user?.name || form.sellerName,
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
        mediaImages,
        imeiVerified: form.imeiValid === true,
        estimatedMin: result.minVal,
        estimatedMax: result.maxVal,
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
        auth: true,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errMsg = `Server error ${res.status}`;
        try {
          const errBody = await res.json();
          errMsg = errBody.message || errBody.error || errMsg;
        } catch {
          errMsg = res.statusText || errMsg;
        }
        throw new Error(errMsg);
      }

      showSnack("Listing published! Redirecting...", "success");
      setTimeout(() => router.push("/marketplace"), 1500);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to publish. Try again.";
      showSnack(`Error: ${message}`, "error");
      console.error("Publish error:", err);
    } finally {
      setPublishing(false);
    }
  };

  const inp =
    "w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors bg-white";
  const inpS = { borderColor: "rgba(2,0,68,0.2)", color: "#020044" };
  const lbl = (txt: string) => (
    <p className="text-sm font-medium mb-2" style={{ color: "#020044" }}>
      {txt}
    </p>
  );

  const choiceBtn = (
    active: boolean,
    onClick: () => void,
    icon: string,
    title: string,
    desc?: string
  ) => (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 py-4 px-3 rounded-xl border-2 text-center transition-all w-full"
      style={{
        borderColor: active ? "#020044" : "rgba(2,0,68,0.12)",
        background: active ? "rgba(2,0,68,0.05)" : "#fff",
        cursor: "pointer",
      }}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-semibold" style={{ color: "#020044" }}>
        {title}
      </span>
      {desc && (
        <span className="text-xs" style={{ color: "#6B6B8A" }}>
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
    label: string,
    desc: string,
    positive = false
  ) => (
    <button
      onClick={() => toggle(field)}
      className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-all"
      style={{
        borderColor: form[field] ? "#020044" : "rgba(2,0,68,0.12)",
        background: form[field] ? "rgba(2,0,68,0.05)" : "#fff",
        cursor: "pointer",
      }}
    >
      <span className="text-sm" style={{ color: "#020044" }}>
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-semibold"
          style={{ color: positive ? "#16a34a" : "#EF3F23" }}
        >
          {desc}
        </span>
        <div
          className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
          style={{
            borderColor: form[field] ? "#020044" : "rgba(2,0,68,0.25)",
            background: form[field] ? "#020044" : "transparent",
          }}
        >
          {form[field] && (
            <span className="text-white text-xs font-bold">✓</span>
          )}
        </div>
      </div>
    </button>
  );

  const regularDevices = devices.filter((d) => !d.id.startsWith("other-"));
  const otherDevice = devices.find((d) => d.id.startsWith("other-"));

  return (
    <div className="min-h-screen" style={{ background: "#F8F8FC" }}>
      {showAuthGate && (
        <AuthGateModal
          onClose={() => setShowAuthGate(false)}
          onRedirect={saveFormAndRedirect}
        />
      )}

      {/* Stolen Alert Modal */}
      {stolenAlert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.55)" }}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm"
            style={{ border: "2px solid #EF3F23" }}
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-3xl"
                style={{ background: "rgba(239,63,35,0.1)" }}
              >
                🚨
              </div>
              <h3
                className="text-lg font-bold"
                style={{
                  color: "#020044",
                  fontFamily: "Space Grotesk, sans-serif",
                }}
              >
                Warning — Stolen Device Alert
              </h3>
              <p className="text-sm" style={{ color: "#6B6B8A" }}>
                This IMEI has been flagged as suspicious. Listing or selling a
                stolen device is a criminal offence.{" "}
                <strong style={{ color: "#EF3F23" }}>
                  Stolen phones will be reported to the Nigerian Police Force
                  (NPF).
                </strong>
              </p>
              <div
                className="w-full rounded-xl p-3 text-sm text-left"
                style={{
                  background: "rgba(239,63,35,0.06)",
                  border: "1px solid rgba(239,63,35,0.2)",
                  color: "#EF3F23",
                }}
              >
                📄 We strongly advise you to keep a{" "}
                <strong>receipt or proof of purchase</strong> for your gadget at
                all times.
              </div>
              <button
                onClick={() => setStolenAlert(false)}
                className="w-full py-3 rounded-xl text-white text-sm font-semibold"
                style={{ background: "#EF3F23", cursor: "pointer" }}
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      <nav
        style={{ background: "#020044" }}
        className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between"
      >
        <button
          onClick={() => router.push("/")}
          className="text-xl font-bold text-white"
          style={{ fontFamily: "Space Grotesk, sans-serif", cursor: "pointer" }}
        >
          Tech<span style={{ color: "#EF3F23" }}>Nest</span>
        </button>
        <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
          🇳🇬 Nigerian Market
        </span>
      </nav>

      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-medium"
            style={{
              background: "rgba(22,163,74,0.08)",
              color: "#16a34a",
              border: "1px solid rgba(22,163,74,0.2)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#16a34a" }}
            />
            Free Valuation
          </div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{
              color: "#020044",
              fontFamily: "Space Grotesk, sans-serif",
            }}
          >
            Value My Device
          </h1>
          <p className="text-sm" style={{ color: "#6B6B8A" }}>
            Get a fair Nigerian market price instantly
          </p>
        </div>

        {step === "form" && (
          <div
            className="bg-white rounded-2xl p-6 border space-y-6"
            style={{ border: "1px solid rgba(2,0,68,0.08)" }}
          >
            {/* What to do */}
            <div>
              {lbl("What do you want to do?")}
              <div className="grid grid-cols-2 gap-3">
                {choiceBtn(
                  form.listingMode === "sell",
                  () => set("listingMode", "sell"),
                  "💰",
                  "Sell for Cash",
                  "Get paid in naira"
                )}
                {choiceBtn(
                  form.listingMode === "swap",
                  () => set("listingMode", "swap"),
                  "🔄",
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
                  "📱",
                  "Phone"
                )}

                {/* ✅ CHANGED: Laptop button wrapped with Coming Soon overlay — was previously a plain choiceBtn that set category to "laptop" */}
                <div className="relative w-full">
                  {choiceBtn(false, () => {}, "💻", "Laptop")}
                  <div
                    className="absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-1"
                    style={{
                      background: "rgba(255,255,255,0.80)",
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
                {/* ✅ END CHANGE */}
              </div>
            </div>

            {/* Phone sub type */}
            {form.category === "phone" && (
              <div>
                {lbl("iPhone or Android?")}
                <div className="flex gap-3">
                  {/* ✅ CHANGED: Replaced the .map() over ["iphone","android"] with two explicit buttons so Android can be disabled with Coming Soon overlay — iPhone button is identical to before */}

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
                          ? "#020044"
                          : "rgba(2,0,68,0.12)",
                      background:
                        form.subType === "iphone"
                          ? "rgba(2,0,68,0.05)"
                          : "#fff",
                      color: "#020044",
                      cursor: "pointer",
                    }}
                  >
                    🍎 iPhone
                  </button>

                  {/* Android — Coming Soon overlay */}
                  <div className="relative flex-1">
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl border-2 text-sm font-medium"
                      style={{
                        borderColor: "rgba(2,0,68,0.12)",
                        background: "#fff",
                        color: "#020044",
                        cursor: "not-allowed",
                        opacity: 0.5,
                      }}
                    >
                      🤖 Android
                    </button>
                    <div
                      className="absolute inset-0 rounded-xl flex items-center justify-center"
                      style={{
                        background: "rgba(255,255,255,0.65)",
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

                  {/* ✅ END CHANGE */}
                </div>
              </div>
            )}

            {/* Laptop sub type */}
            {form.category === "laptop" && (
              <div>
                {lbl("What type of laptop?")}
                <div className="flex gap-2 flex-wrap">
                  {[
                    ["macbook", "🍎 MacBook"],
                    ["windows", "🪟 Windows"],
                    ["linux", "🐧 Linux"],
                    ["gaming", "🎮 Gaming"],
                  ].map(([v, label]) => (
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
                          form.subType === v ? "#020044" : "rgba(2,0,68,0.12)",
                        background:
                          form.subType === v ? "rgba(2,0,68,0.05)" : "#fff",
                        color: "#020044",
                        cursor: "pointer",
                      }}
                    >
                      {label}
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
                  background: "rgba(2,0,68,0.03)",
                  border: "1px solid rgba(2,0,68,0.1)",
                }}
              >
                <p
                  className="text-sm font-semibold"
                  style={{ color: "#020044" }}
                >
                  Enter your device details
                </p>
                <div>
                  <label
                    className="text-xs font-medium block mb-1"
                    style={{ color: "#6B6B8A" }}
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
                    style={{ color: "#6B6B8A" }}
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
                    background: "rgba(2,0,68,0.03)",
                    border: "1px solid rgba(2,0,68,0.08)",
                  }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ color: "#6B6B8A" }}
                  >
                    Device Specs
                  </p>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    {selectedDevice.chip && (
                      <div>
                        <p className="text-xs" style={{ color: "#6B6B8A" }}>
                          Chip
                        </p>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "#020044" }}
                        >
                          {selectedDevice.chip}
                        </p>
                      </div>
                    )}
                    {selectedDevice.ram && (
                      <div>
                        <p className="text-xs" style={{ color: "#6B6B8A" }}>
                          RAM
                        </p>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "#020044" }}
                        >
                          {selectedDevice.ram}
                        </p>
                      </div>
                    )}
                    {selectedDevice.display && (
                      <div className="col-span-2">
                        <p className="text-xs" style={{ color: "#6B6B8A" }}>
                          Display
                        </p>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "#020044" }}
                        >
                          {selectedDevice.display}
                        </p>
                      </div>
                    )}
                    {selectedDevice.storage && (
                      <div className="col-span-2">
                        <p className="text-xs" style={{ color: "#6B6B8A" }}>
                          Storage
                        </p>
                        <span
                          className="inline-block text-xs px-2.5 py-0.5 rounded-full font-semibold mt-0.5"
                          style={{
                            background: "rgba(2,0,68,0.08)",
                            color: "#020044",
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
                      style={{ accentColor: "#020044", cursor: "pointer" }}
                    />
                    <div
                      className="flex justify-between text-xs mt-1"
                      style={{ color: "#6B6B8A" }}
                    >
                      <span>50% Poor</span>
                      <span>75% Average</span>
                      <span>100% Perfect</span>
                    </div>
                    {batteryDeduct > 0 && (
                      <p className="text-xs mt-1" style={{ color: "#EF3F23" }}>
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
                              desc: "-5%",
                              color: "#d97706",
                            },
                            {
                              val: "locked" as SimType,
                              lbl: "Locked SIM",
                              desc: "-10%",
                              color: "#EF3F23",
                            },
                          ].map(({ val, lbl, desc, color }) => (
                            <button
                              key={val}
                              onClick={() => set("simType", val)}
                              className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 text-center transition-all"
                              style={{
                                borderColor:
                                  form.simType === val
                                    ? "#020044"
                                    : "rgba(2,0,68,0.12)",
                                background:
                                  form.simType === val
                                    ? "rgba(2,0,68,0.05)"
                                    : "#fff",
                                cursor: "pointer",
                              }}
                            >
                              <span
                                className="text-xs font-semibold"
                                style={{ color: "#020044" }}
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
                                  icon: "🔐",
                                  lbl: "Face ID Works",
                                  desc: "No deduction",
                                  color: "#16a34a",
                                },
                                {
                                  val: "broken" as FaceIdStatus,
                                  icon: "🔓",
                                  lbl: "Face ID Broken",
                                  desc: "-10%",
                                  color: "#EF3F23",
                                },
                              ].map(({ val, icon, lbl, desc, color }) => (
                                <button
                                  key={val}
                                  onClick={() => set("faceIdStatus", val)}
                                  className="relative flex flex-col items-center gap-2 py-5 rounded-xl border-2 text-center transition-all"
                                  style={{
                                    borderColor:
                                      form.faceIdStatus === val
                                        ? "#020044"
                                        : "rgba(2,0,68,0.12)",
                                    background:
                                      form.faceIdStatus === val
                                        ? "rgba(2,0,68,0.05)"
                                        : "#fff",
                                    cursor: "pointer",
                                  }}
                                >
                                  {form.faceIdStatus === val && (
                                    <div
                                      className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                                      style={{ background: "#020044" }}
                                    >
                                      <span className="text-white text-xs font-bold">
                                        ✓
                                      </span>
                                    </div>
                                  )}
                                  <span className="text-2xl">{icon}</span>
                                  <span
                                    className="text-xs font-semibold"
                                    style={{ color: "#020044" }}
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
                            "🔋 Battery replaced",
                            "-10%"
                          )}
                          {toggleBtn(
                            "screenChanged",
                            "📱 Screen replaced",
                            "-10%"
                          )}
                          {toggleBtn(
                            "cameraChanged",
                            "📷 Camera replaced",
                            "-10%"
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
                          "🖥️ Screen replaced",
                          "-15%"
                        )}
                        {toggleBtn(
                          "batteryChanged",
                          "🔋 Battery replaced",
                          "-8%"
                        )}
                        {toggleBtn(
                          "keyboardChanged",
                          "⌨️ Keyboard replaced",
                          "-8%"
                        )}
                        {toggleBtn(
                          "ramUpgraded",
                          "⚡ RAM upgraded",
                          "+5%",
                          true
                        )}
                        {toggleBtn(
                          "storageUpgraded",
                          "💾 Storage upgraded",
                          "+5%",
                          true
                        )}
                      </div>
                    </div>
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
                      <p className="text-xs mt-1" style={{ color: "#EF3F23" }}>
                        -10% for additional repairs
                      </p>
                    )}
                  </div>

                  {/* Media upload */}
                  <div>
                    {lbl("Photos & Videos (optional)")}

                    {isIphone && (
                      <div
                        className="rounded-xl p-3 mb-3 flex items-start gap-2.5"
                        style={{
                          background: "rgba(2,0,68,0.04)",
                          border: "1px solid rgba(2,0,68,0.12)",
                        }}
                      >
                        <span className="text-lg mt-0.5 flex-shrink-0">📋</span>
                        <div>
                          <p
                            className="text-xs font-semibold mb-0.5"
                            style={{ color: "#020044" }}
                          >
                            Parts &amp; Services screenshot required
                          </p>
                          <p
                            className="text-xs leading-relaxed"
                            style={{ color: "#6B6B8A" }}
                          >
                            Go to{" "}
                            <strong style={{ color: "#020044" }}>
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
                        borderColor: "rgba(2,0,68,0.15)",
                        cursor: "pointer",
                      }}
                    >
                      <span className="text-2xl">📷</span>
                      <span className="text-sm" style={{ color: "#6B6B8A" }}>
                        Tap to upload photos or videos
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "rgba(2,0,68,0.35)" }}
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
                              background: "rgba(2,0,68,0.06)",
                            }}
                          >
                            {preview.isVideo ? (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                                <span className="text-2xl">🎥</span>
                                <span
                                  className="text-xs text-center px-1 truncate w-full"
                                  style={{ color: "#6B6B8A", fontSize: 9 }}
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
                                <span className="text-2xl">📄</span>
                              </div>
                            )}
                            <button
                              onClick={() => removeMedia(i)}
                              className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md"
                              style={{
                                background: "#EF3F23",
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
                        style={{ color: "#6B6B8A" }}
                      >
                        {previews.length} of 10 files uploaded
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleCalculate}
                    style={{ background: "#020044", cursor: "pointer" }}
                    className="w-full text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity text-sm"
                  >
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
              className="bg-white rounded-2xl p-6 border"
              style={{ border: "1px solid rgba(2,0,68,0.08)" }}
            >
              <p
                className="text-sm text-center mb-1"
                style={{ color: "#6B6B8A" }}
              >
                Your {result.device.name}
                {result.device.storage ? ` (${result.device.storage})` : ""} is
                worth
              </p>
              <h2
                className="text-3xl font-bold text-center mb-1"
                style={{
                  color: "#020044",
                  fontFamily: "Space Grotesk, sans-serif",
                }}
              >
                {formatPrice(result.minVal)} – {formatPrice(result.maxVal)}
              </h2>
              <p
                className="text-xs text-center mb-5"
                style={{ color: "#6B6B8A" }}
              >
                {result.deductionPercent > 0
                  ? `${result.deductionPercent}% deducted for condition`
                  : "No deductions — excellent condition!"}
              </p>
              <div className="mb-5">
                <div
                  className="flex justify-between text-xs mb-1"
                  style={{ color: "#6B6B8A" }}
                >
                  <span>Condition Score</span>
                  <span className="font-semibold" style={{ color: "#020044" }}>
                    {100 - result.deductionPercent}%
                  </span>
                </div>
                <div
                  className="h-2 rounded-full"
                  style={{ background: "rgba(2,0,68,0.08)" }}
                >
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.max(5, 100 - result.deductionPercent)}%`,
                      background: "#020044",
                    }}
                  />
                </div>
              </div>
              <div
                className="space-y-2 pt-4"
                style={{ borderTop: "1px solid rgba(2,0,68,0.08)" }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: "#6B6B8A" }}
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
                    valColor="#774499"
                  />
                )}
                {batteryDeduct > 0 && (
                  <Row
                    label={`Battery (${form.batteryHealth}%)`}
                    val={`-${batteryDeduct}%`}
                    valColor="#EF3F23"
                  />
                )}
                {form.faceIdStatus === "broken" && (
                  <Row label="Face ID broken" val="-10%" valColor="#EF3F23" />
                )}
                {form.faceIdStatus === "working" && (
                  <Row label="Face ID" val="Working ✓" valColor="#16a34a" />
                )}
                {form.simType === "locked" && (
                  <Row label="Locked SIM" val="-10%" valColor="#EF3F23" />
                )}
                {form.simType === "esim-unlocked" && (
                  <Row label="eSIM Unlocked" val="-5%" valColor="#d97706" />
                )}
                {form.simType === "physical" && (
                  <Row
                    label="Physical SIM"
                    val="No deduction"
                    valColor="#16a34a"
                  />
                )}
                {form.batteryChanged && (
                  <Row label="Battery replaced" val="-8%" valColor="#EF3F23" />
                )}
                {form.screenChanged && (
                  <Row label="Screen replaced" val="-15%" valColor="#EF3F23" />
                )}
                {form.cameraChanged && (
                  <Row label="Camera replaced" val="-10%" valColor="#EF3F23" />
                )}
                {form.keyboardChanged && (
                  <Row label="Keyboard replaced" val="-8%" valColor="#EF3F23" />
                )}
                {form.ramUpgraded && (
                  <Row label="RAM upgraded" val="+5%" valColor="#16a34a" />
                )}
                {form.storageUpgraded && (
                  <Row label="Storage upgraded" val="+5%" valColor="#16a34a" />
                )}
                {form.otherRepairs.trim() && (
                  <Row label="Other repairs" val="-5%" valColor="#EF3F23" />
                )}
                {form.imeiValid && (
                  <Row
                    label="IMEI verified"
                    val="Boosts trust ✓"
                    valColor="#16a34a"
                  />
                )}
                <div
                  className="flex justify-between pt-2 font-semibold"
                  style={{ borderTop: "1px solid rgba(2,0,68,0.08)" }}
                >
                  <span style={{ color: "#020044" }}>Your valuation</span>
                  <span style={{ color: "#020044" }}>
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
                  borderColor: "rgba(2,0,68,0.2)",
                  color: "#020044",
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
              💬 WhatsApp to Sell Directly
            </a>
          </div>
        )}

        {/* IMEI VERIFICATION STEP */}
        {step === "imei" && result && (
          <div
            className="bg-white rounded-2xl p-6 border space-y-6"
            style={{ border: "1px solid rgba(2,0,68,0.08)" }}
          >
            <div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-2xl"
                style={{ background: "rgba(2,0,68,0.06)" }}
              >
                🔍
              </div>
              <h2
                className="text-xl font-bold mb-1"
                style={{
                  color: "#020044",
                  fontFamily: "Space Grotesk, sans-serif",
                }}
              >
                Verify Your Device
              </h2>
              <p className="text-sm" style={{ color: "#6B6B8A" }}>
                {form.subType === "iphone"
                  ? "Enter your IMEI to confirm your iPhone is legitimate before listing"
                  : "Confirm your device details before listing"}
              </p>
            </div>

            {/* Valuation summary */}
            <div
              className="rounded-xl p-4"
              style={{
                background: "rgba(2,0,68,0.03)",
                border: "1px solid rgba(2,0,68,0.08)",
              }}
            >
              <p className="text-xs mb-0.5" style={{ color: "#6B6B8A" }}>
                Device being listed
              </p>
              <p
                className="font-semibold"
                style={{
                  color: "#020044",
                  fontFamily: "Space Grotesk, sans-serif",
                }}
              >
                {result.device.name}
                {result.device.storage ? ` (${result.device.storage})` : ""}
              </p>
              <p
                className="text-sm font-bold mt-1"
                style={{ color: "#020044" }}
              >
                {formatPrice(result.minVal)} – {formatPrice(result.maxVal)}
              </p>
            </div>

            {/* IMEI input — only for iPhones */}
            {form.subType === "iphone" ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#020044" }}
                    >
                      IMEI Number
                    </p>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(239,63,35,0.08)",
                        color: "#EF3F23",
                      }}
                    >
                      Required for iPhones
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
                            ? "#EF3F23"
                            : form.imeiValid
                            ? "#16a34a"
                            : "rgba(2,0,68,0.2)",
                      }}
                      value={form.imei}
                      onChange={(e) => handleIMEI(e.target.value)}
                      maxLength={15}
                    />
                    {imeiChecking && (
                      <span
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs"
                        style={{ color: "#6B6B8A" }}
                      >
                        Checking...
                      </span>
                    )}
                    {!imeiChecking && form.imei.length === 15 && (
                      <span
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold"
                        style={{
                          color: form.imeiValid ? "#16a34a" : "#EF3F23",
                        }}
                      >
                        {form.imeiValid ? "✓ Valid" : "✗ Invalid"}
                      </span>
                    )}
                  </div>

                  {form.imei.length === 15 && form.imeiValid && imeiReport && (
                    <div
                      className="mt-2 rounded-xl p-3 text-xs"
                      style={{
                        background: "rgba(22,163,74,0.06)",
                        border: "1px solid rgba(22,163,74,0.2)",
                      }}
                    >
                      <p
                        className="font-semibold mb-0.5"
                        style={{ color: "#16a34a" }}
                      >
                        ✓ IMEI Verified — Device Report
                      </p>
                      <p style={{ color: "#6B6B8A" }}>{imeiReport}</p>
                    </div>
                  )}

                  <p className="text-xs mt-1.5" style={{ color: "#6B6B8A" }}>
                    Dial <strong>*#06#</strong> to find your IMEI.
                  </p>
                  <p
                    className="text-xs mt-1 font-medium"
                    style={{ color: "#EF3F23" }}
                  >
                    ⚠️ Devices flagged as stolen will be removed and reported to
                    the NPF.
                  </p>
                </div>

                {/* Parts & Services reminder */}
                <div
                  className="rounded-xl p-3 flex items-start gap-2.5"
                  style={{
                    background: "rgba(2,0,68,0.04)",
                    border: "1px solid rgba(2,0,68,0.12)",
                  }}
                >
                  <span className="text-lg mt-0.5 flex-shrink-0">📋</span>
                  <div>
                    <p
                      className="text-xs font-semibold mb-0.5"
                      style={{ color: "#020044" }}
                    >
                      Parts &amp; Services screenshot required
                    </p>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "#6B6B8A" }}
                    >
                      Go to{" "}
                      <strong style={{ color: "#020044" }}>
                        Settings → General → About → Parts and Services
                      </strong>{" "}
                      and include a screenshot when uploading photos.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="rounded-xl p-4 flex items-center gap-3"
                style={{
                  background: "rgba(22,163,74,0.06)",
                  border: "1px solid rgba(22,163,74,0.2)",
                }}
              >
                <span className="text-2xl">✅</span>
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "#16a34a" }}
                  >
                    Device confirmed
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#6B6B8A" }}>
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
                  borderColor: "rgba(2,0,68,0.2)",
                  color: "#020044",
                  cursor: "pointer",
                }}
              >
                ← Back
              </button>
              <button
                onClick={() => {
                  if (
                    form.subType === "iphone" &&
                    (!form.imei || !form.imeiValid)
                  ) {
                    showSnack("A valid IMEI is required to proceed", "error");
                    return;
                  }
                  setStep("publish");
                }}
                style={{ background: "#020044", cursor: "pointer" }}
                className="flex-1 text-white text-sm font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* PUBLISH */}
        {step === "publish" && result && (
          <div
            className="bg-white rounded-2xl p-6 border space-y-5"
            style={{ border: "1px solid rgba(2,0,68,0.08)" }}
          >
            <div>
              <h2
                className="text-xl font-bold mb-1"
                style={{
                  color: "#020044",
                  fontFamily: "Space Grotesk, sans-serif",
                }}
              >
                {form.listingMode === "swap"
                  ? "Post Swap Request"
                  : "List Your Device"}
              </h2>
              <p className="text-sm" style={{ color: "#6B6B8A" }}>
                {form.listingMode === "swap"
                  ? "Vendors will see your swap request and contact you"
                  : "Your listing goes live — vendors and buyers will be notified"}
              </p>
            </div>
            <div
              className="rounded-xl p-4"
              style={{
                background: "rgba(2,0,68,0.03)",
                border: "1px solid rgba(2,0,68,0.08)",
              }}
            >
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: "#020044" }}
              >
                {result.device.name}
                {result.device.storage ? ` (${result.device.storage})` : ""}
              </p>
              <p className="font-bold" style={{ color: "#020044" }}>
                {formatPrice(result.minVal)} – {formatPrice(result.maxVal)}
              </p>
              {form.listingMode === "swap" && form.wantedDevice && (
                <p className="text-xs mt-1" style={{ color: "#774499" }}>
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
                style={{ color: "#020044" }}
              >
                Your Name
              </label>
              <div
                className="w-full border rounded-xl px-4 py-3 text-sm flex items-center justify-between"
                style={{
                  borderColor: "rgba(2,0,68,0.12)",
                  background: "rgba(2,0,68,0.03)",
                  color: "#020044",
                  cursor: "not-allowed",
                }}
              >
                <span>{form.sellerName || user?.name || "—"}</span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(22,163,74,0.1)",
                    color: "#16a34a",
                  }}
                >
                  ✓ From your account
                </span>
              </div>
            </div>
            <div>
              <label
                className="text-sm font-medium block mb-1.5"
                style={{ color: "#020044" }}
              >
                WhatsApp Number *
              </label>
              <input
                className={inp}
                style={inpS}
                type="tel"
                placeholder="08012345678"
                value={form.sellerPhone}
                onChange={(e) => set("sellerPhone", e.target.value)}
              />
              <p className="text-xs mt-1" style={{ color: "#6B6B8A" }}>
                Vendors will contact you on WhatsApp
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("imei")}
                className="flex-1 border text-sm font-medium py-3 rounded-xl"
                style={{
                  borderColor: "rgba(2,0,68,0.2)",
                  color: "#020044",
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
  val: string;
  valColor?: string;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span style={{ color: "#6B6B8A" }}>{label}</span>
      <span className="font-medium" style={{ color: valColor || "#020044" }}>
        {val}
      </span>
    </div>
  );
}

export default function ValuePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen" style={{ background: "#F8F8FC" }} />
      }
    >
      <ValueContent />
    </Suspense>
  );
}
