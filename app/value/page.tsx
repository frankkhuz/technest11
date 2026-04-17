"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, Suspense } from "react";
import { formatPrice } from "../lib/helpers";

const deviceData = {
  phone: {
    iphone: [
      {
        id: "iphone-15-pro-max",
        name: "iPhone 15 Pro Max",
        baseMin: 1400000,
        baseMax: 1800000,
      },
      {
        id: "iphone-15-pro",
        name: "iPhone 15 Pro",
        baseMin: 1200000,
        baseMax: 1500000,
      },
      { id: "iphone-15", name: "iPhone 15", baseMin: 950000, baseMax: 1200000 },
      {
        id: "iphone-14-pro",
        name: "iPhone 14 Pro",
        baseMin: 900000,
        baseMax: 1100000,
      },
      { id: "iphone-14", name: "iPhone 14", baseMin: 700000, baseMax: 900000 },
      {
        id: "iphone-13-pro",
        name: "iPhone 13 Pro",
        baseMin: 650000,
        baseMax: 850000,
      },
      { id: "iphone-13", name: "iPhone 13", baseMin: 550000, baseMax: 700000 },
      { id: "iphone-12", name: "iPhone 12", baseMin: 380000, baseMax: 500000 },
      { id: "iphone-11", name: "iPhone 11", baseMin: 280000, baseMax: 380000 },
      { id: "iphone-xr", name: "iPhone XR", baseMin: 200000, baseMax: 280000 },
    ],
    android: [
      {
        id: "s24-ultra",
        name: "Samsung S24 Ultra",
        baseMin: 1200000,
        baseMax: 1500000,
      },
      { id: "s24", name: "Samsung S24", baseMin: 850000, baseMax: 1100000 },
      { id: "s23", name: "Samsung S23", baseMin: 600000, baseMax: 800000 },
      {
        id: "pixel-8",
        name: "Google Pixel 8",
        baseMin: 700000,
        baseMax: 900000,
      },
      {
        id: "tecno-camon-20",
        name: "Tecno Camon 20",
        baseMin: 180000,
        baseMax: 250000,
      },
      {
        id: "infinix-note-40",
        name: "Infinix Note 40",
        baseMin: 150000,
        baseMax: 220000,
      },
      { id: "xiaomi-14", name: "Xiaomi 14", baseMin: 600000, baseMax: 800000 },
      {
        id: "oneplus-12",
        name: "OnePlus 12",
        baseMin: 700000,
        baseMax: 900000,
      },
    ],
  },
  laptop: {
    macbook: [
      {
        id: "macbook-pro-m3",
        name: "MacBook Pro M3",
        baseMin: 1800000,
        baseMax: 2500000,
      },
      {
        id: "macbook-pro-m2",
        name: "MacBook Pro M2",
        baseMin: 1400000,
        baseMax: 1900000,
      },
      {
        id: "macbook-air-m2",
        name: "MacBook Air M2",
        baseMin: 1000000,
        baseMax: 1400000,
      },
      {
        id: "macbook-air-m1",
        name: "MacBook Air M1",
        baseMin: 650000,
        baseMax: 900000,
      },
      {
        id: "macbook-pro-m1",
        name: "MacBook Pro M1",
        baseMin: 900000,
        baseMax: 1300000,
      },
    ],
    windows: [
      {
        id: "dell-xps-15",
        name: "Dell XPS 15",
        baseMin: 1200000,
        baseMax: 1800000,
      },
      {
        id: "hp-spectre",
        name: "HP Spectre x360",
        baseMin: 900000,
        baseMax: 1300000,
      },
      {
        id: "lenovo-thinkpad",
        name: "Lenovo ThinkPad X1",
        baseMin: 800000,
        baseMax: 1200000,
      },
      {
        id: "surface-pro",
        name: "Microsoft Surface Pro",
        baseMin: 900000,
        baseMax: 1400000,
      },
      {
        id: "hp-elitebook",
        name: "HP EliteBook",
        baseMin: 500000,
        baseMax: 800000,
      },
      {
        id: "dell-latitude",
        name: "Dell Latitude",
        baseMin: 400000,
        baseMax: 700000,
      },
    ],
    linux: [
      {
        id: "thinkpad-x1",
        name: "ThinkPad X1 Carbon (Linux)",
        baseMin: 700000,
        baseMax: 1000000,
      },
      {
        id: "dell-xps-dev",
        name: "Dell XPS Developer Edition",
        baseMin: 900000,
        baseMax: 1300000,
      },
    ],
    gaming: [
      {
        id: "asus-rog",
        name: "ASUS ROG Strix",
        baseMin: 1200000,
        baseMax: 1800000,
      },
      {
        id: "msi-raider",
        name: "MSI Raider GE78",
        baseMin: 1500000,
        baseMax: 2200000,
      },
      {
        id: "razer-blade",
        name: "Razer Blade 15",
        baseMin: 1400000,
        baseMax: 2000000,
      },
      {
        id: "lenovo-legion",
        name: "Lenovo Legion 5",
        baseMin: 900000,
        baseMax: 1400000,
      },
      { id: "hp-omen", name: "HP Omen 16", baseMin: 850000, baseMax: 1300000 },
    ],
  },
};

const wantedDevices = [
  "iPhone 15 Pro Max 1TB",
  "iPhone 15 Pro Max 512GB",
  "iPhone 15 Pro 256GB",
  "iPhone 15 Pro 512GB",
  "iPhone 15 128GB",
  "iPhone 14 Pro Max 256GB",
  "Samsung S24 Ultra 512GB",
  "Samsung S24 Ultra 256GB",
  "MacBook Pro M3",
  "MacBook Air M2",
  "ASUS ROG Strix",
  "Custom (type below)",
];

type DeviceCategory = "phone" | "laptop";
type PhoneType = "iphone" | "android";
type LaptopType = "macbook" | "windows" | "linux" | "gaming";
type SubType = PhoneType | LaptopType;
type SimType = "physical" | "esim-unlocked" | "locked" | "";
type StorageType = "64GB" | "128GB" | "256GB" | "512GB" | "1TB" | "";
type FaceIdStatus = "working" | "broken" | "";
type ListingMode = "sell" | "swap";

type FormData = {
  listingMode: ListingMode;
  category: DeviceCategory | "";
  subType: SubType | "";
  deviceId: string;
  batteryHealth: string;
  batteryChanged: boolean;
  screenChanged: boolean;
  cameraChanged: boolean;
  faceIdStatus: FaceIdStatus;
  simType: SimType;
  storage: StorageType;
  imei: string;
  imeiValid: boolean | null;
  ramUpgraded: boolean;
  storageUpgraded: boolean;
  keyboardChanged: boolean;
  otherRepairs: string;
  mediaFiles: File[];
  // swap only
  wantedDevice: string;
  customWantedDevice: string;
  // seller contact
  sellerName: string;
  sellerPhone: string;
};

const initialForm: FormData = {
  listingMode: "sell",
  category: "",
  subType: "",
  deviceId: "",
  batteryHealth: "100",
  batteryChanged: false,
  screenChanged: false,
  cameraChanged: false,
  faceIdStatus: "",
  simType: "",
  storage: "",
  imei: "",
  imeiValid: null,
  ramUpgraded: false,
  storageUpgraded: false,
  keyboardChanged: false,
  otherRepairs: "",
  mediaFiles: [],
  wantedDevice: "",
  customWantedDevice: "",
  sellerName: "",
  sellerPhone: "",
};

function getDevices(category: DeviceCategory | "", subType: SubType | "") {
  if (!category || !subType) return [];
  if (category === "phone") return deviceData.phone[subType as PhoneType] || [];
  return deviceData.laptop[subType as LaptopType] || [];
}

function validateIMEI(imei: string): boolean {
  const digits = imei.replace(/\s/g, "");
  if (!/^\d{15}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let d = parseInt(digits[i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

function calculateValuation(form: FormData) {
  const devices = getDevices(form.category, form.subType);
  const device = devices.find((d) => d.id === form.deviceId);
  if (!device) return null;
  const basePrice = (device.baseMin + device.baseMax) / 2;
  let deduction = 0;
  const battery = Number(form.batteryHealth);
  if (battery < 80) deduction += 0.2;
  else if (battery < 85) deduction += 0.12;
  else if (battery < 90) deduction += 0.07;
  else if (battery < 95) deduction += 0.03;
  if (form.batteryChanged) deduction += 0.08;
  if (form.screenChanged) deduction += 0.15;
  if (form.cameraChanged) deduction += 0.1;
  if (form.faceIdStatus === "broken") deduction += 0.1;
  if (form.simType === "locked") deduction += 0.1;
  else if (form.simType === "esim-unlocked") deduction += 0.05;
  if (form.keyboardChanged) deduction += 0.08;
  if (form.ramUpgraded) deduction -= 0.05;
  if (form.storageUpgraded) deduction -= 0.05;
  if (form.otherRepairs.trim()) deduction += 0.05;
  deduction = Math.max(-0.1, Math.min(deduction, 0.55));
  const valuedPrice = Math.round(basePrice * (1 - deduction));
  return {
    device,
    deductionPercent: Math.round(deduction * 100),
    minVal: Math.round(valuedPrice * 0.9),
    maxVal: Math.round(valuedPrice * 1.05),
    basePrice,
  };
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
  const [step, setStep] = useState<"form" | "result" | "publish">("form");
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPhone = form.category === "phone";
  const isLaptop = form.category === "laptop";
  const isIphone = form.subType === "iphone";
  const devices = getDevices(form.category, form.subType);
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

  const handleIMEI = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 15);
    setForm((p) => ({
      ...p,
      imei: cleaned,
      imeiValid: cleaned.length === 15 ? validateIMEI(cleaned) : null,
    }));
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newFiles = [...form.mediaFiles, ...files].slice(0, 10);
    setForm((p) => ({ ...p, mediaFiles: newFiles }));
    setMediaPreviews(
      newFiles.map((f) =>
        f.type.startsWith("image/") ? URL.createObjectURL(f) : "video"
      )
    );
  };

  const removeMedia = (i: number) => {
    const newFiles = form.mediaFiles.filter((_, idx) => idx !== i);
    setForm((p) => ({ ...p, mediaFiles: newFiles }));
    setMediaPreviews(
      newFiles.map((f) =>
        f.type.startsWith("image/") ? URL.createObjectURL(f) : "video"
      )
    );
  };

  const handleCalculate = () => {
    if (!form.deviceId) return;
    setResult(calculateValuation(form));
    setStep("result");
  };

  const handlePublish = async () => {
    if (!result || !form.sellerName || !form.sellerPhone) return;
    setPublishing(true);
    try {
      const repairs: string[] = [];
      if (form.batteryChanged) repairs.push("Battery replaced");
      if (form.screenChanged) repairs.push("Screen replaced");
      if (form.cameraChanged) repairs.push("Camera replaced");
      if (form.faceIdStatus === "broken") repairs.push("Face ID broken");
      if (form.keyboardChanged) repairs.push("Keyboard replaced");
      if (form.otherRepairs.trim()) repairs.push(form.otherRepairs.trim());

      await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: form.sellerName,
          userPhone: form.sellerPhone,
          deviceName: result.device.name,
          deviceCategory: form.category,
          subType: form.subType,
          storage: form.storage || null,
          batteryHealth: form.batteryHealth,
          simType: form.simType || null,
          faceIdStatus: form.faceIdStatus || null,
          repairs,
          mediaCount: form.mediaFiles.length,
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
        }),
      });
      router.push("/dashboard");
    } catch (e) {
      console.error(e);
    } finally {
      setPublishing(false);
    }
  };

  // Styling
  const inp =
    "w-full border rounded-lg px-4 py-3 text-sm outline-none transition-colors";
  const inpS = { borderColor: "rgba(2,0,68,0.2)", color: "#020044" };
  const label = (txt: string) => (
    <p className="text-sm font-medium mb-2" style={{ color: "#020044" }}>
      {txt}
    </p>
  );

  const toggleBtn = (
    field:
      | "batteryChanged"
      | "screenChanged"
      | "cameraChanged"
      | "ramUpgraded"
      | "storageUpgraded"
      | "keyboardChanged",
    lbl: string,
    desc: string,
    positive = false
  ) => (
    <button
      onClick={() => toggle(field)}
      className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-all"
      style={{
        borderColor: form[field] ? "#020044" : "rgba(2,0,68,0.12)",
        background: form[field] ? "rgba(2,0,68,0.04)" : "#fff",
      }}
    >
      <span className="text-sm" style={{ color: "#020044" }}>
        {lbl}
      </span>
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-medium"
          style={{ color: positive ? "#16a34a" : "#EF3F23" }}
        >
          {desc}
        </span>
        <div
          className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
          style={{
            borderColor: form[field] ? "#020044" : "rgba(2,0,68,0.2)",
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

  return (
    <div className="min-h-screen" style={{ background: "#F8F8FC" }}>
      {/* Nav */}
      <nav
        style={{ background: "#020044" }}
        className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
      >
        <button
          onClick={() => router.push("/")}
          className="text-xl font-bold text-white"
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
        >
          Tech<span style={{ color: "#EF3F23" }}>Nest</span>
        </button>
        <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
          🇳🇬 Nigerian Market
        </span>
      </nav>

      <div className="max-w-xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-medium"
            style={{
              background: "rgba(239,63,35,0.08)",
              color: "#EF3F23",
              border: "1px solid rgba(239,63,35,0.2)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#EF3F23" }}
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
            {/* Sell or Swap */}
            <div>
              {label("What do you want to do?")}
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    val: "sell" as ListingMode,
                    title: "Sell for Cash",
                    desc: "Get paid in naira",
                  },
                  {
                    val: "swap" as ListingMode,
                    title: "Swap Device",
                    desc: "Trade for a newer model",
                  },
                ].map(({ val, title, desc }) => (
                  <button
                    key={val}
                    onClick={() => set("listingMode", val)}
                    className="flex flex-col items-center gap-1.5 py-4 px-3 rounded-xl border-2 text-center transition-all"
                    style={{
                      borderColor:
                        form.listingMode === val
                          ? "#020044"
                          : "rgba(2,0,68,0.12)",
                      background:
                        form.listingMode === val ? "rgba(2,0,68,0.04)" : "#fff",
                    }}
                  >
                    <span className="text-xl">
                      {val === "sell" ? "💰" : "🔄"}
                    </span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "#020044" }}
                    >
                      {title}
                    </span>
                    <span className="text-xs" style={{ color: "#6B6B8A" }}>
                      {desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              {label("What type of device?")}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: "phone" as DeviceCategory, icon: "📱", lbl: "Phone" },
                  {
                    val: "laptop" as DeviceCategory,
                    icon: "💻",
                    lbl: "Laptop",
                  },
                ].map(({ val, icon, lbl }) => (
                  <button
                    key={val}
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        category: val,
                        subType: "",
                        deviceId: "",
                      }))
                    }
                    className="flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all"
                    style={{
                      borderColor:
                        form.category === val ? "#020044" : "rgba(2,0,68,0.12)",
                      background:
                        form.category === val ? "rgba(2,0,68,0.04)" : "#fff",
                    }}
                  >
                    <span className="text-2xl">{icon}</span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "#020044" }}
                    >
                      {lbl}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sub type */}
            {form.category === "phone" && (
              <div>
                {label("iPhone or Android?")}
                <div className="flex gap-3">
                  {[
                    { val: "iphone" as PhoneType, lbl: "🍎 iPhone" },
                    { val: "android" as PhoneType, lbl: "🤖 Android" },
                  ].map(({ val, lbl }) => (
                    <button
                      key={val}
                      onClick={() =>
                        setForm((p) => ({ ...p, subType: val, deviceId: "" }))
                      }
                      className="flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all"
                      style={{
                        borderColor:
                          form.subType === val
                            ? "#020044"
                            : "rgba(2,0,68,0.12)",
                        background:
                          form.subType === val ? "rgba(2,0,68,0.04)" : "#fff",
                        color: "#020044",
                      }}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {form.category === "laptop" && (
              <div>
                {label("What type of laptop?")}
                <div className="flex gap-2 flex-wrap">
                  {[
                    { val: "macbook" as LaptopType, lbl: "🍎 MacBook" },
                    { val: "windows" as LaptopType, lbl: "🪟 Windows" },
                    { val: "linux" as LaptopType, lbl: "🐧 Linux" },
                    { val: "gaming" as LaptopType, lbl: "🎮 Gaming" },
                  ].map(({ val, lbl }) => (
                    <button
                      key={val}
                      onClick={() =>
                        setForm((p) => ({ ...p, subType: val, deviceId: "" }))
                      }
                      className="px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all"
                      style={{
                        borderColor:
                          form.subType === val
                            ? "#020044"
                            : "rgba(2,0,68,0.12)",
                        background:
                          form.subType === val ? "rgba(2,0,68,0.04)" : "#fff",
                        color: "#020044",
                      }}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Model */}
            {form.subType && (
              <div>
                {label("Select your exact model")}
                <select
                  className={inp}
                  style={inpS}
                  value={form.deviceId}
                  onChange={(e) => set("deviceId", e.target.value)}
                >
                  <option value="">Choose a device...</option>
                  {devices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {formatPrice(d.baseMin)} to{" "}
                      {formatPrice(d.baseMax)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {form.deviceId && (
              <>
                {/* Battery */}
                <div>
                  {label(`Battery Health: ${form.batteryHealth}%`)}
                  <input
                    type="range"
                    min={50}
                    max={100}
                    value={form.batteryHealth}
                    onChange={(e) => set("batteryHealth", e.target.value)}
                    className="w-full cursor-pointer"
                    style={{ accentColor: "#020044" }}
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

                {/* Phone fields */}
                {isPhone && (
                  <>
                    {/* Storage */}
                    <div>
                      {label("Storage Capacity")}
                      <div className="flex gap-2 flex-wrap">
                        {(
                          [
                            "64GB",
                            "128GB",
                            "256GB",
                            "512GB",
                            "1TB",
                          ] as StorageType[]
                        ).map((s) => (
                          <button
                            key={s}
                            onClick={() => set("storage", s)}
                            className="px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all"
                            style={{
                              borderColor:
                                form.storage === s
                                  ? "#020044"
                                  : "rgba(2,0,68,0.12)",
                              background:
                                form.storage === s
                                  ? "rgba(2,0,68,0.04)"
                                  : "#fff",
                              color: "#020044",
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* SIM */}
                    <div>
                      {label("SIM / Lock Status")}
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
                                  ? "rgba(2,0,68,0.04)"
                                  : "#fff",
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

                    {/* IMEI */}
                    {isIphone && (
                      <div>
                        {label("IMEI Number")}
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="15-digit IMEI (dial *#06#)"
                            className={inp}
                            style={inpS}
                            value={form.imei}
                            onChange={(e) => handleIMEI(e.target.value)}
                            maxLength={15}
                          />
                          {form.imei.length === 15 && (
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
                      </div>
                    )}

                    {/* Face ID */}
                    {isIphone && (
                      <div>
                        {label("Face ID Status")}
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
                                    ? "rgba(2,0,68,0.04)"
                                    : "#fff",
                              }}
                            >
                              {form.faceIdStatus === val && (
                                <div
                                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                                  style={{ background: "#020044" }}
                                >
                                  <span className="text-white text-xs">✓</span>
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
                        {form.faceIdStatus === "broken" && (
                          <p
                            className="text-xs mt-2 p-2 rounded-lg"
                            style={{
                              background: "rgba(239,63,35,0.06)",
                              color: "#EF3F23",
                            }}
                          >
                            Face ID issues significantly reduce iPhone resale
                            value in Nigeria
                          </p>
                        )}
                      </div>
                    )}

                    {/* Repairs */}
                    <div>
                      {label("Repairs & Replacements")}
                      <div className="space-y-2">
                        {toggleBtn(
                          "batteryChanged",
                          "🔋 Battery replaced",
                          "-8%"
                        )}
                        {toggleBtn(
                          "screenChanged",
                          "📱 Screen replaced",
                          "-15%"
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

                {/* Laptop fields */}
                {isLaptop && (
                  <div>
                    {label("Repairs, Replacements & Upgrades")}
                    <div className="space-y-2">
                      {toggleBtn("screenChanged", "🖥️ Screen replaced", "-15%")}
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
                      {toggleBtn("ramUpgraded", "⚡ RAM upgraded", "+5%", true)}
                      {toggleBtn(
                        "storageUpgraded",
                        "💾 Storage upgraded",
                        "+5%",
                        true
                      )}
                    </div>
                  </div>
                )}

                {/* Swap wanted device */}
                {form.listingMode === "swap" && (
                  <div>
                    {label("What device do you want?")}
                    <select
                      className={inp}
                      style={inpS}
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

                {/* Other repairs */}
                <div>
                  {label("Other Issues (optional)")}
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
                      -5% for additional repairs
                    </p>
                  )}
                </div>

                {/* Media */}
                <div>
                  {label("Photos & Videos (optional)")}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-8 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 transition-colors"
                    style={{ borderColor: "rgba(2,0,68,0.15)" }}
                  >
                    <span className="text-2xl">📷</span>
                    <span className="text-sm" style={{ color: "#6B6B8A" }}>
                      Tap to upload photos or videos
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "rgba(2,0,68,0.3)" }}
                    >
                      Max 10 files
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
                  {mediaPreviews.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {mediaPreviews.map((src, i) => (
                        <div
                          key={i}
                          className="relative aspect-square rounded-lg overflow-hidden"
                          style={{ background: "rgba(2,0,68,0.06)" }}
                        >
                          {src === "video" ? (
                            <div className="w-full h-full flex items-center justify-center text-xl">
                              🎥
                            </div>
                          ) : (
                            <img
                              src={src}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                          <button
                            onClick={() => removeMedia(i)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                            style={{ background: "#EF3F23" }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleCalculate}
                  style={{ background: "#020044" }}
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
                Your {result.device.name} is worth
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

              {/* Score bar */}
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

              {/* Breakdown */}
              <div
                className="space-y-2 pt-4"
                style={{ borderTop: "1px solid rgba(2,0,68,0.08)" }}
              >
                <p
                  className="text-xs font-medium mb-3"
                  style={{ color: "#6B6B8A" }}
                >
                  PRICE BREAKDOWN
                </p>
                <Row
                  label="Base market price"
                  val={formatPrice(result.basePrice)}
                />
                {form.storage && (
                  <Row label="Storage" val={form.storage} valColor="#774499" />
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
                style={{ borderColor: "rgba(2,0,68,0.2)", color: "#020044" }}
              >
                ← Adjust
              </button>
              <button
                onClick={() => setStep("publish")}
                style={{ background: "#020044" }}
                className="flex-1 text-white text-sm font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
              >
                {form.listingMode === "swap"
                  ? "Post Swap Request →"
                  : "List for Sale →"}
              </button>
            </div>

            <a
              href={`https://wa.me/2349133172761?text=Hi, I want to sell my ${
                result.device.name
              }${
                form.storage ? ` (${form.storage})` : ""
              }. Valued at ${formatPrice(result.minVal)} – ${formatPrice(
                result.maxVal
              )}.`}
              target="_blank"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white text-sm font-semibold no-underline"
              style={{ background: "#25d366" }}
            >
              💬 WhatsApp to Sell Directly
            </a>
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
                  ? "Vendors will see your swap request and contact you on WhatsApp"
                  : "Your listing goes live immediately — vendors and buyers will be notified"}
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
                {result.device.name} {form.storage && `(${form.storage})`}
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
                onClick={() => setStep("result")}
                className="flex-1 border text-sm font-medium py-3 rounded-xl"
                style={{ borderColor: "rgba(2,0,68,0.2)", color: "#020044" }}
              >
                ← Back
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing || !form.sellerName || !form.sellerPhone}
                style={{ background: "#020044" }}
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
