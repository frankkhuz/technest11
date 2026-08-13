"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, Suspense, useEffect } from "react";
import { formatPrice } from "../lib/helpers";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { apiFetch } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import {
  Lock,
  AlertTriangle,
  FileText,
  Wallet,
  Repeat,
  Smartphone,
  Laptop,
  Apple,
  Bot,
  AppWindow,
  Terminal,
  Gamepad2,
  ScanFace,
  ScanEye,
  BatteryFull,
  Camera,
  Keyboard,
  Zap,
  Save,
  Video,
  Search,
  CheckCircle2,
  ClipboardList,
  Check,
  X,
  MessageCircle,
} from "lucide-react";
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
        style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "var(--accent-soft)" }}
        >
          <Lock size={24} style={{ color: "var(--accent)" }} />
        </div>
        <h3
          className="text-lg font-bold text-center mb-1"
          style={{ color: "var(--ink)" }}
        >
          Sign in to list your device
        </h3>
        <p
          className="text-sm text-center mb-6"
          style={{ color: "var(--ink-soft)" }}
        >
          Create a free account or sign in to publish your listing on TechNest.
        </p>
        <div className="space-y-2">
          <button
            onClick={() => router.push("/auth/register?redirect=/value")}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
            style={{
              background: "var(--accent)",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Create Free Account
          </button>
          <button
            onClick={() => router.push("/auth/login?redirect=/value")}
            className="w-full py-3 rounded-xl text-sm font-medium border transition-colors"
            style={{
              color: "var(--ink)",
              borderColor: "var(--border)",
              background: "var(--bg)",
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
        const res = await apiFetch("/api/imei-check", {
          method: "POST",
          auth: true,
          body: JSON.stringify({ imei: cleaned }),
        });
        const parsed = await res.json();
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
    if (!result || !form.sellerName || !form.sellerPhone) {
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
    "w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors";
  const inpS = {
    borderColor: "var(--border)",
    color: "var(--ink)",
    background: "var(--bg)",
  };
  const lbl = (txt: string) => (
    <p className="text-sm font-medium mb-2" style={{ color: "var(--ink)" }}>
      {txt}
    </p>
  );

  const choiceBtn = (
    active: boolean,
    onClick: () => void,
    Icon: React.ElementType,
    title: string,
    desc?: string
  ) => (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 py-4 px-3 rounded-xl border-2 text-center transition-all w-full"
      style={{
        borderColor: active ? "var(--accent)" : "var(--border)",
        background: active ? "var(--accent-soft)" : "var(--bg)",
        cursor: "pointer",
      }}
    >
      <Icon size={22} style={{ color: "var(--accent)" }} />
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
    Icon: React.ElementType,
    label: string,
    desc: string,
    positive = false
  ) => (
    <button
      onClick={() => toggle(field)}
      className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-all"
      style={{
        borderColor: form[field] ? "var(--accent)" : "var(--border)",
        background: form[field] ? "var(--accent-soft)" : "var(--bg)",
        cursor: "pointer",
      }}
    >
      <span
        className="text-sm inline-flex items-center gap-2"
        style={{ color: "var(--ink)" }}
      >
        <Icon size={15} /> {label}
      </span>
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-semibold"
          style={{ color: positive ? "var(--success)" : "var(--accent)" }}
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
          {form[field] && <Check size={12} color="#fff" strokeWidth={3} />}
        </div>
      </div>
    </button>
  );

  const regularDevices = devices.filter((d) => !d.id.startsWith("other-"));
  const otherDevice = devices.find((d) => d.id.startsWith("other-"));

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {showAuthGate && <AuthGateModal onClose={() => setShowAuthGate(false)} />}

      {stolenAlert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.55)" }}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-sm"
            style={{
              background: "var(--bg)",
              border: "2px solid var(--accent)",
            }}
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: "var(--accent-soft)" }}
              >
                <AlertTriangle size={28} style={{ color: "var(--accent)" }} />
              </div>
              <h3 className="text-lg font-bold" style={{ color: "var(--ink)" }}>
                Warning — Stolen Device Alert
              </h3>
              <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                This IMEI has been flagged as suspicious. Listing or selling a
                stolen device is a criminal offence.{" "}
                <strong style={{ color: "var(--accent)" }}>
                  Stolen phones will be reported to the Nigerian Police Force
                  (NPF).
                </strong>
              </p>
              <div
                className="w-full rounded-xl p-3 text-sm text-left inline-flex items-start gap-2"
                style={{
                  background: "var(--accent-soft)",
                  border: "1px solid var(--border)",
                  color: "var(--accent)",
                }}
              >
                <FileText size={16} className="flex-shrink-0 mt-0.5" />
                <span>
                  We strongly advise you to keep a{" "}
                  <strong>receipt or proof of purchase</strong> for your gadget
                  at all times.
                </span>
              </div>
              <button
                onClick={() => setStolenAlert(false)}
                className="w-full py-3 rounded-xl text-sm font-semibold"
                style={{
                  background: "var(--accent)",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--ink)" }}
          >
            Value My Device
          </h1>
          <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
            Get a fair Nigerian market price instantly
          </p>
        </div>

        {step === "form" && (
          <div
            className="rounded-2xl p-6 space-y-6"
            style={{ border: "1px solid var(--border)" }}
          >
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
                <div className="relative w-full">
                  {choiceBtn(false, () => {}, Laptop, "Laptop")}
                  <div
                    className="absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-1"
                    style={{
                      background: "rgba(255,255,255,0.85)",
                      cursor: "not-allowed",
                    }}
                  >
                    <span
                      className="mono-label px-3 py-1 rounded-full"
                      style={{ background: "var(--ink)", color: "var(--bg)" }}
                    >
                      COMING SOON
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {form.category === "phone" && (
              <div>
                {lbl("iPhone or Android?")}
                <div className="flex gap-3">
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
                    className="flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all inline-flex items-center justify-center gap-2"
                    style={{
                      borderColor:
                        form.subType === "iphone"
                          ? "var(--accent)"
                          : "var(--border)",
                      background:
                        form.subType === "iphone"
                          ? "var(--accent-soft)"
                          : "var(--bg)",
                      color: "var(--ink)",
                      cursor: "pointer",
                    }}
                  >
                    <Apple size={16} /> iPhone
                  </button>

                  <div className="relative flex-1">
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl border-2 text-sm font-medium inline-flex items-center justify-center gap-2"
                      style={{
                        borderColor: "var(--border)",
                        background: "var(--bg)",
                        color: "var(--ink)",
                        cursor: "not-allowed",
                        opacity: 0.5,
                      }}
                    >
                      <Bot size={16} /> Android
                    </button>
                    <div
                      className="absolute inset-0 rounded-xl flex items-center justify-center"
                      style={{
                        background: "rgba(255,255,255,0.7)",
                        cursor: "not-allowed",
                      }}
                    >
                      <span
                        className="mono-label px-3 py-1 rounded-full"
                        style={{ background: "var(--ink)", color: "var(--bg)" }}
                      >
                        COMING SOON
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                      className="px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all inline-flex items-center gap-2"
                      style={{
                        borderColor:
                          form.subType === v
                            ? "var(--accent)"
                            : "var(--border)",
                        background:
                          form.subType === v
                            ? "var(--accent-soft)"
                            : "var(--bg)",
                        color: "var(--ink)",
                        cursor: "pointer",
                      }}
                    >
                      <Icon size={15} /> {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

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

            {isOther && (
              <div
                className="rounded-xl p-4 space-y-3"
                style={{
                  background: "var(--surface)",
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

            {selectedDevice &&
              !isOther &&
              (selectedDevice.ram ||
                selectedDevice.chip ||
                selectedDevice.display) && (
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <p
                    className="mono-label mb-3"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    DEVICE SPECS
                  </p>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    {selectedDevice.chip && (
                      <div>
                        <p
                          className="text-xs"
                          style={{ color: "var(--ink-soft)" }}
                        >
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
                        <p
                          className="text-xs"
                          style={{ color: "var(--ink-soft)" }}
                        >
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
                        <p
                          className="text-xs"
                          style={{ color: "var(--ink-soft)" }}
                        >
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
                        <p
                          className="text-xs"
                          style={{ color: "var(--ink-soft)" }}
                        >
                          Storage
                        </p>
                        <span
                          className="inline-block text-xs px-2.5 py-0.5 rounded-full font-semibold mt-0.5"
                          style={{
                            background: "var(--accent-soft)",
                            color: "var(--accent)",
                          }}
                        >
                          {selectedDevice.storage}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

            {form.deviceId &&
              (isOther
                ? form.customDeviceName && form.customDevicePrice
                : true) && (
                <>
                  <div>
                    {lbl(`Battery Health: ${form.batteryHealth}%`)}
                    <input
                      type="range"
                      min={50}
                      max={100}
                      value={form.batteryHealth}
                      onChange={(e) => set("batteryHealth", e.target.value)}
                      className="w-full"
                      style={{
                        accentColor: "var(--accent)",
                        cursor: "pointer",
                      }}
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
                      <p
                        className="text-xs mt-1"
                        style={{ color: "var(--accent)" }}
                      >
                        -{batteryDeduct}% for battery health
                      </p>
                    )}
                  </div>

                  {isPhone && (
                    <>
                      <div>
                        {lbl("SIM / Lock Status")}
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            {
                              val: "physical" as SimType,
                              lbl: "Physical SIM",
                              desc: "No deduction",
                              color: "var(--success)",
                            },
                            {
                              val: "esim-unlocked" as SimType,
                              lbl: "eSIM Unlocked",
                              desc: "-5%",
                              color: "var(--warning)",
                            },
                            {
                              val: "locked" as SimType,
                              lbl: "Locked SIM",
                              desc: "-10%",
                              color: "var(--accent)",
                            },
                          ].map(({ val, lbl, desc, color }) => (
                            <button
                              key={val}
                              onClick={() => set("simType", val)}
                              className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 text-center transition-all"
                              style={{
                                borderColor:
                                  form.simType === val
                                    ? "var(--accent)"
                                    : "var(--border)",
                                background:
                                  form.simType === val
                                    ? "var(--accent-soft)"
                                    : "var(--bg)",
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

                      {isIphone && (
                        <div>
                          {lbl("Face ID Status")}
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              {
                                val: "working" as FaceIdStatus,
                                Icon: ScanFace,
                                lbl: "Face ID Works",
                                desc: "No deduction",
                                color: "var(--success)",
                              },
                              {
                                val: "broken" as FaceIdStatus,
                                Icon: ScanEye,
                                lbl: "Face ID Broken",
                                desc: "-10%",
                                color: "var(--accent)",
                              },
                            ].map(({ val, Icon, lbl, desc, color }) => (
                              <button
                                key={val}
                                onClick={() => set("faceIdStatus", val)}
                                className="relative flex flex-col items-center gap-2 py-5 rounded-xl border-2 text-center transition-all"
                                style={{
                                  borderColor:
                                    form.faceIdStatus === val
                                      ? "var(--accent)"
                                      : "var(--border)",
                                  background:
                                    form.faceIdStatus === val
                                      ? "var(--accent-soft)"
                                      : "var(--bg)",
                                  cursor: "pointer",
                                }}
                              >
                                {form.faceIdStatus === val && (
                                  <div
                                    className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                                    style={{ background: "var(--accent)" }}
                                  >
                                    <Check
                                      size={12}
                                      color="#fff"
                                      strokeWidth={3}
                                    />
                                  </div>
                                )}
                                <Icon
                                  size={24}
                                  style={{ color: "var(--accent)" }}
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
                      )}

                      <div>
                        {lbl("Repairs & Replacements")}
                        <div className="space-y-2">
                          {toggleBtn(
                            "batteryChanged",
                            BatteryFull,
                            "Battery replaced",
                            "-10%"
                          )}
                          {toggleBtn(
                            "screenChanged",
                            Smartphone,
                            "Screen replaced",
                            "-10%"
                          )}
                          {toggleBtn(
                            "cameraChanged",
                            Camera,
                            "Camera replaced",
                            "-10%"
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {isLaptop && (
                    <div>
                      {lbl("Repairs, Replacements & Upgrades")}
                      <div className="space-y-2">
                        {toggleBtn(
                          "screenChanged",
                          Laptop,
                          "Screen replaced",
                          "-15%"
                        )}
                        {toggleBtn(
                          "batteryChanged",
                          BatteryFull,
                          "Battery replaced",
                          "-8%"
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
                          Save,
                          "Storage upgraded",
                          "+5%",
                          true
                        )}
                      </div>
                    </div>
                  )}

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
                      <p
                        className="text-xs mt-1"
                        style={{ color: "var(--accent)" }}
                      >
                        -10% for additional repairs
                      </p>
                    )}
                  </div>

                  <div>
                    {lbl("Photos & Videos (optional)")}

                    {isIphone && (
                      <div
                        className="rounded-xl p-3 mb-3 flex items-start gap-2.5"
                        style={{
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <ClipboardList
                          size={18}
                          className="mt-0.5 flex-shrink-0"
                          style={{ color: "var(--accent)" }}
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
                      <Camera size={26} style={{ color: "var(--ink-soft)" }} />
                      <span
                        className="text-sm"
                        style={{ color: "var(--ink-soft)" }}
                      >
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

                    {previews.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mt-3">
                        {previews.map((preview, i) => (
                          <div
                            key={i}
                            className="relative rounded-xl overflow-hidden"
                            style={{
                              aspectRatio: "1",
                              background: "var(--surface)",
                            }}
                          >
                            {preview.isVideo ? (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                                <Video
                                  size={22}
                                  style={{ color: "var(--ink-soft)" }}
                                />
                                <span
                                  className="text-xs text-center px-1 truncate w-full"
                                  style={{
                                    color: "var(--ink-soft)",
                                    fontSize: 9,
                                  }}
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
                                  size={22}
                                  style={{ color: "var(--ink-soft)" }}
                                />
                              </div>
                            )}
                            <button
                              onClick={() => removeMedia(i)}
                              className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-md"
                              style={{
                                background: "var(--accent)",
                                cursor: "pointer",
                                lineHeight: 1,
                              }}
                            >
                              <X size={12} />
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
                    style={{
                      background: "var(--accent)",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                    className="w-full font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity text-sm"
                  >
                    Calculate My Device Value →
                  </button>
                </>
              )}
          </div>
        )}

        {step === "result" && result && (
          <div className="space-y-4">
            <div
              className="rounded-2xl p-6"
              style={{ border: "1px solid var(--border)" }}
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
                style={{ color: "var(--ink)" }}
              >
                {formatPrice(result.minVal)} – {formatPrice(result.maxVal)}
              </h2>
              <p
                className="text-xs text-center mb-5"
                style={{ color: "var(--ink-soft)" }}
              >
                {result.deductionPercent > 0
                  ? `${result.deductionPercent}% deducted for condition`
                  : "No deductions — excellent condition!"}
              </p>
              <div className="mb-5">
                <div
                  className="flex justify-between text-xs mb-1"
                  style={{ color: "var(--ink-soft)" }}
                >
                  <span>Condition Score</span>
                  <span
                    className="font-semibold"
                    style={{ color: "var(--ink)" }}
                  >
                    {100 - result.deductionPercent}%
                  </span>
                </div>
                <div
                  className="h-2 rounded-full"
                  style={{ background: "var(--surface)" }}
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
                  className="mono-label mb-3"
                  style={{ color: "var(--ink-soft)" }}
                >
                  PRICE BREAKDOWN
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
                {batteryDeduct > 0 && (
                  <Row
                    label={`Battery (${form.batteryHealth}%)`}
                    val={`-${batteryDeduct}%`}
                    valColor="var(--accent)"
                  />
                )}
                {form.faceIdStatus === "broken" && (
                  <Row
                    label="Face ID broken"
                    val="-10%"
                    valColor="var(--accent)"
                  />
                )}
                {form.faceIdStatus === "working" && (
                  <Row
                    label="Face ID"
                    val="Working"
                    valColor="var(--success)"
                  />
                )}
                {form.simType === "locked" && (
                  <Row label="Locked SIM" val="-10%" valColor="var(--accent)" />
                )}
                {form.simType === "esim-unlocked" && (
                  <Row
                    label="eSIM Unlocked"
                    val="-5%"
                    valColor="var(--warning)"
                  />
                )}
                {form.simType === "physical" && (
                  <Row
                    label="Physical SIM"
                    val="No deduction"
                    valColor="var(--success)"
                  />
                )}
                {form.batteryChanged && (
                  <Row
                    label="Battery replaced"
                    val="-8%"
                    valColor="var(--accent)"
                  />
                )}
                {form.screenChanged && (
                  <Row
                    label="Screen replaced"
                    val="-15%"
                    valColor="var(--accent)"
                  />
                )}
                {form.cameraChanged && (
                  <Row
                    label="Camera replaced"
                    val="-10%"
                    valColor="var(--accent)"
                  />
                )}
                {form.keyboardChanged && (
                  <Row
                    label="Keyboard replaced"
                    val="-8%"
                    valColor="var(--accent)"
                  />
                )}
                {form.ramUpgraded && (
                  <Row
                    label="RAM upgraded"
                    val="+5%"
                    valColor="var(--success)"
                  />
                )}
                {form.storageUpgraded && (
                  <Row
                    label="Storage upgraded"
                    val="+5%"
                    valColor="var(--success)"
                  />
                )}
                {form.otherRepairs.trim() && (
                  <Row
                    label="Other repairs"
                    val="-5%"
                    valColor="var(--accent)"
                  />
                )}
                {form.imeiValid && (
                  <Row
                    label="IMEI verified"
                    val="Boosts trust"
                    valColor="var(--success)"
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
                style={{
                  background: "var(--accent)",
                  color: "#fff",
                  cursor: "pointer",
                }}
                className="flex-1 text-sm font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
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
              <MessageCircle size={16} /> WhatsApp to Sell Directly
            </a>
          </div>
        )}

        {step === "imei" && result && (
          <div
            className="rounded-2xl p-6 space-y-6"
            style={{ border: "1px solid var(--border)" }}
          >
            <div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "var(--accent-soft)" }}
              >
                <Search size={22} style={{ color: "var(--accent)" }} />
              </div>
              <h2
                className="text-xl font-bold mb-1"
                style={{ color: "var(--ink)" }}
              >
                Verify Your Device
              </h2>
              <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                {form.subType === "iphone"
                  ? "Enter your IMEI to confirm your iPhone is legitimate before listing"
                  : "Confirm your device details before listing"}
              </p>
            </div>

            <div
              className="rounded-xl p-4"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <p
                className="text-xs mb-0.5"
                style={{ color: "var(--ink-soft)" }}
              >
                Device being listed
              </p>
              <p className="font-semibold" style={{ color: "var(--ink)" }}>
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

            {form.subType === "iphone" ? (
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
                      className="mono-label px-2 py-0.5 rounded-full"
                      style={{
                        background: "var(--accent-soft)",
                        color: "var(--accent)",
                      }}
                    >
                      REQUIRED
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
                            ? "var(--accent)"
                            : form.imeiValid
                            ? "var(--success)"
                            : "var(--border)",
                      }}
                      value={form.imei}
                      onChange={(e) => handleIMEI(e.target.value)}
                      maxLength={15}
                    />
                    {imeiChecking && (
                      <span
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs"
                        style={{ color: "var(--ink-soft)" }}
                      >
                        Checking...
                      </span>
                    )}
                    {!imeiChecking && form.imei.length === 15 && (
                      <span
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold inline-flex items-center gap-1"
                        style={{
                          color: form.imeiValid
                            ? "var(--success)"
                            : "var(--accent)",
                        }}
                      >
                        {form.imeiValid ? (
                          <>
                            <Check size={13} /> Valid
                          </>
                        ) : (
                          <>
                            <X size={13} /> Invalid
                          </>
                        )}
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
                        className="font-semibold mb-0.5 inline-flex items-center gap-1"
                        style={{ color: "var(--success)" }}
                      >
                        <CheckCircle2 size={13} /> IMEI Verified — Device Report
                      </p>
                      <p style={{ color: "var(--ink-soft)" }}>{imeiReport}</p>
                    </div>
                  )}

                  <p
                    className="text-xs mt-1.5"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    Dial <strong>*#06#</strong> to find your IMEI.
                  </p>
                  <p
                    className="text-xs mt-1 font-medium inline-flex items-center gap-1"
                    style={{ color: "var(--accent)" }}
                  >
                    <AlertTriangle size={12} /> Devices flagged as stolen will
                    be removed and reported to the NPF.
                  </p>
                </div>

                <div
                  className="rounded-xl p-3 flex items-start gap-2.5"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <ClipboardList
                    size={18}
                    className="mt-0.5 flex-shrink-0"
                    style={{ color: "var(--accent)" }}
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
              </div>
            ) : (
              <div
                className="rounded-xl p-4 flex items-center gap-3"
                style={{
                  background: "rgba(22,163,74,0.06)",
                  border: "1px solid rgba(22,163,74,0.2)",
                }}
              >
                <CheckCircle2 size={26} style={{ color: "var(--success)" }} />
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--success)" }}
                  >
                    Device confirmed
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    No IMEI required for this device type. You&apos;re good to
                    proceed.
                  </p>
                </div>
              </div>
            )}

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
                style={{
                  background: "var(--accent)",
                  color: "#fff",
                  cursor: "pointer",
                }}
                className="flex-1 text-sm font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === "publish" && result && (
          <div
            className="rounded-2xl p-6 space-y-5"
            style={{ border: "1px solid var(--border)" }}
          >
            <div>
              <h2
                className="text-xl font-bold mb-1"
                style={{ color: "var(--ink)" }}
              >
                {form.listingMode === "swap"
                  ? "Post Swap Request"
                  : "List Your Device"}
              </h2>
              <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                {form.listingMode === "swap"
                  ? "Vendors will see your swap request and contact you"
                  : "Your listing goes live — vendors and buyers will be notified"}
              </p>
            </div>
            <div
              className="rounded-xl p-4"
              style={{
                background: "var(--surface)",
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
                value={form.sellerPhone}
                onChange={(e) => set("sellerPhone", e.target.value)}
              />
              <p className="text-xs mt-1" style={{ color: "var(--ink-soft)" }}>
                Vendors will contact you on WhatsApp
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
                style={{
                  background: "var(--accent)",
                  color: "#fff",
                  cursor: "pointer",
                }}
                className="flex-1 text-sm font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
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
