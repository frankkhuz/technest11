"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { formatPrice } from "../lib/helpers";

const deviceData = {
  phone: {
    iphone: [
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
      {
        id: "system76",
        name: "System76 Lemur",
        baseMin: 800000,
        baseMax: 1200000,
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
        id: "alienware-m15",
        name: "Alienware m15",
        baseMin: 1300000,
        baseMax: 1900000,
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

type DeviceCategory = "phone" | "laptop";
type PhoneType = "iphone" | "android";
type LaptopType = "macbook" | "windows" | "linux" | "gaming";
type SubType = PhoneType | LaptopType;
type SimType = "physical" | "esim-unlocked" | "locked" | "";
type StorageType = "64GB" | "128GB" | "256GB" | "512GB" | "1TB" | "";
type FaceIdStatus = "working" | "broken" | "";

type FormData = {
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
};

const initialForm: FormData = {
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
  const minVal = Math.round(valuedPrice * 0.9);
  const maxVal = Math.round(valuedPrice * 1.05);

  return {
    device,
    deductionPercent: Math.round(deduction * 100),
    minVal,
    maxVal,
    basePrice,
  };
}

export default function ValuePage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(initialForm);
  const [result, setResult] =
    useState<ReturnType<typeof calculateValuation>>(null);
  const [submitted, setSubmitted] = useState(false);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
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

  const handleSubmit = () => {
    if (!form.deviceId) return;
    setResult(calculateValuation(form));
    setSubmitted(true);
  };

  const handleReset = () => {
    setForm(initialForm);
    setResult(null);
    setSubmitted(false);
    setMediaPreviews([]);
  };

  const setCategory = (cat: DeviceCategory) =>
    setForm({ ...initialForm, category: cat });
  const setSubType = (sub: SubType) =>
    setForm((prev) => ({ ...prev, subType: sub, deviceId: "" }));

  const toggle = (
    field:
      | "batteryChanged"
      | "screenChanged"
      | "cameraChanged"
      | "ramUpgraded"
      | "storageUpgraded"
      | "keyboardChanged"
  ) => setForm((prev) => ({ ...prev, [field]: !prev[field] }));

  const handleIMEI = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 15);
    setForm((prev) => ({
      ...prev,
      imei: cleaned,
      imeiValid: cleaned.length === 15 ? validateIMEI(cleaned) : null,
    }));
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const newFiles = [...form.mediaFiles, ...files].slice(0, 10);
    setForm((prev) => ({ ...prev, mediaFiles: newFiles }));
    setMediaPreviews(
      newFiles.map((f) =>
        f.type.startsWith("image/") ? URL.createObjectURL(f) : "video"
      )
    );
  };

  const removeMedia = (index: number) => {
    const newFiles = form.mediaFiles.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, mediaFiles: newFiles }));
    setMediaPreviews(
      newFiles.map((f) =>
        f.type.startsWith("image/") ? URL.createObjectURL(f) : "video"
      )
    );
  };

  const labelClass = "text-sm text-[#7070a0] mb-2 block font-medium";
  const selectClass =
    "w-full bg-[#1a1a26] border border-white/10 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6c47ff] transition-colors cursor-pointer";
  const inputClass =
    "w-full bg-[#1a1a26] border border-white/10 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6c47ff] transition-colors placeholder-[#7070a0]";

  const categoryBtn = (cat: DeviceCategory, emoji: string, lbl: string) => (
    <button
      onClick={() => setCategory(cat)}
      className={`flex-1 flex flex-col items-center gap-2 py-5 rounded-xl border transition-all ${
        form.category === cat
          ? "border-[#6c47ff] bg-[#6c47ff]/15"
          : "border-white/8 bg-[#1a1a26] hover:border-[#6c47ff]/50"
      }`}
    >
      <span className="text-3xl">{emoji}</span>
      <span
        className="text-sm font-bold text-white"
        style={{ fontFamily: "Syne, sans-serif" }}
      >
        {lbl}
      </span>
    </button>
  );

  const subTypeBtn = (sub: SubType, emoji: string, lbl: string) => (
    <button
      onClick={() => setSubType(sub)}
      className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
        form.subType === sub
          ? "border-[#6c47ff] bg-[#6c47ff]/15 text-white"
          : "border-white/8 bg-[#1a1a26] text-[#7070a0] hover:border-[#6c47ff]/50 hover:text-white"
      }`}
    >
      {emoji} {lbl}
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
    lbl: string,
    desc: string,
    positive = false
  ) => (
    <button
      onClick={() => toggle(field)}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${
        form[field]
          ? "border-[#6c47ff] bg-[#6c47ff]/10"
          : "border-white/8 bg-[#1a1a26]"
      }`}
    >
      <span className="text-sm text-white">{lbl}</span>
      <div className="flex items-center gap-2">
        <span
          className={`text-xs ${positive ? "text-green-400" : "text-red-400"}`}
        >
          {desc}
        </span>
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
            form[field] ? "border-[#6c47ff] bg-[#6c47ff]" : "border-white/20"
          }`}
        >
          {form[field] && <span className="text-white text-xs">✓</span>}
        </div>
      </div>
    </button>
  );

  const simBtn = (
    val: SimType,
    emoji: string,
    lbl: string,
    desc: string,
    color: string
  ) => (
    <button
      onClick={() => setForm((prev) => ({ ...prev, simType: val }))}
      className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all text-center ${
        form.simType === val
          ? "border-[#6c47ff] bg-[#6c47ff]/15"
          : "border-white/8 bg-[#1a1a26] hover:border-[#6c47ff]/50"
      }`}
    >
      <span className="text-xl">{emoji}</span>
      <span className="text-xs font-bold text-white">{lbl}</span>
      <span className={`text-xs ${color}`}>{desc}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#6c47ff]/8 blur-3xl pointer-events-none" />

      <nav className="border-b border-white/8 px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50">
        <button
          onClick={() => router.push("/")}
          className="text-2xl font-extrabold"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          <span className="text-[#6c47ff]">Tech</span>
          <span className="text-white">Nest</span>
        </button>
        <span className="text-[#7070a0] text-sm">🇳🇬 Nigerian Market</span>
      </nav>

      <div className="max-w-xl mx-auto px-4 py-10 relative z-10">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[#6c47ff]/12 border border-[#6c47ff]/30 rounded-full px-4 py-1.5 mb-4 text-xs text-[#00e5ff]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e090] inline-block" />
            Free Valuation
          </div>
          <h1
            className="font-extrabold text-3xl sm:text-4xl mb-2"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Value My Device
          </h1>
          <p className="text-[#7070a0] text-sm">
            Tell us about your gadget and get a fair Nigerian market price
          </p>
        </div>

        {!submitted ? (
          <div className="bg-[#12121a] border border-white/8 rounded-2xl p-6 space-y-6">
            {/* STEP 1 */}
            <div>
              <label className={labelClass}>
                Step 1 — What type of device?
              </label>
              <div className="flex gap-3">
                {categoryBtn("phone", "📱", "Phone")}
                {categoryBtn("laptop", "💻", "Laptop")}
              </div>
            </div>

            {/* STEP 2 */}
            {form.category === "phone" && (
              <div>
                <label className={labelClass}>
                  Step 2 — iPhone or Android?
                </label>
                <div className="flex gap-3 flex-wrap">
                  {subTypeBtn("iphone", "🍎", "iPhone")}
                  {subTypeBtn("android", "🤖", "Android")}
                </div>
              </div>
            )}

            {form.category === "laptop" && (
              <div>
                <label className={labelClass}>
                  Step 2 — What type of laptop?
                </label>
                <div className="flex gap-3 flex-wrap">
                  {subTypeBtn("macbook", "🍎", "MacBook")}
                  {subTypeBtn("windows", "🪟", "Windows")}
                  {subTypeBtn("linux", "🐧", "Linux")}
                  {subTypeBtn("gaming", "🎮", "Gaming")}
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {form.subType && (
              <div>
                <label className={labelClass}>
                  Step 3 — Select your exact model
                </label>
                <select
                  className={selectClass}
                  value={form.deviceId}
                  onChange={(e) =>
                    setForm({ ...form, deviceId: e.target.value })
                  }
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

            {/* STEP 4 */}
            {form.deviceId && (
              <>
                {/* Battery */}
                <div>
                  <label className={labelClass}>
                    Battery Health:{" "}
                    <span
                      className={`font-bold ${
                        battery < 80
                          ? "text-red-400"
                          : battery < 90
                          ? "text-yellow-400"
                          : "text-[#00e5ff]"
                      }`}
                    >
                      {form.batteryHealth}%
                    </span>
                  </label>
                  <input
                    type="range"
                    min={50}
                    max={100}
                    value={form.batteryHealth}
                    onChange={(e) =>
                      setForm({ ...form, batteryHealth: e.target.value })
                    }
                    className="w-full accent-[#6c47ff] cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-[#7070a0] mt-1">
                    <span>50% Poor</span>
                    <span>75% Average</span>
                    <span>100% Perfect</span>
                  </div>
                  {batteryDeduct > 0 && (
                    <p className="text-xs text-red-400 mt-1">
                      -{batteryDeduct}% for battery health
                    </p>
                  )}
                </div>

                {/* Phone specific */}
                {isPhone && (
                  <>
                    {/* Storage */}
                    <div>
                      <label className={labelClass}>📦 Storage Capacity</label>
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
                            onClick={() =>
                              setForm((prev) => ({ ...prev, storage: s }))
                            }
                            className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
                              form.storage === s
                                ? "border-[#6c47ff] bg-[#6c47ff]/15 text-white"
                                : "border-white/8 bg-[#1a1a26] text-[#7070a0] hover:border-[#6c47ff]/50 hover:text-white"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* SIM */}
                    <div>
                      <label className={labelClass}>📶 SIM / Lock Status</label>
                      <div className="flex gap-2">
                        {simBtn(
                          "physical",
                          "📶",
                          "Physical SIM",
                          "No deduction",
                          "text-green-400"
                        )}
                        {simBtn(
                          "esim-unlocked",
                          "📡",
                          "eSIM Unlocked",
                          "-5%",
                          "text-yellow-400"
                        )}
                        {simBtn(
                          "locked",
                          "🔒",
                          "Locked SIM",
                          "-10%",
                          "text-red-400"
                        )}
                      </div>
                      {form.simType && (
                        <p className="text-xs text-[#7070a0] mt-2">
                          {form.simType === "physical" &&
                            "✅ Physical SIM — best resale value, no deduction"}
                          {form.simType === "esim-unlocked" &&
                            "⚠️ eSIM Unlocked — slight deduction as fewer buyers prefer eSIM only"}
                          {form.simType === "locked" &&
                            "❌ Locked SIM — 10% deduction, harder to resell in Nigeria"}
                        </p>
                      )}
                    </div>

                    {/* IMEI — iPhone only */}
                    {isIphone && (
                      <div>
                        <label className={labelClass}>🔍 IMEI Checker</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Enter 15-digit IMEI (dial *#06#)"
                            className={`${inputClass} pr-24`}
                            value={form.imei}
                            onChange={(e) => handleIMEI(e.target.value)}
                            maxLength={15}
                          />
                          {form.imei.length === 15 && (
                            <span
                              className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold ${
                                form.imeiValid
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {form.imeiValid ? "✅ Valid" : "❌ Invalid"}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#7070a0] mt-1">
                          Dial <span className="text-[#00e5ff]">*#06#</span> on
                          your iPhone to get your IMEI.
                        </p>
                      </div>
                    )}

                    {/* ── FACE ID (iPhone only) ── */}
                    {isIphone && (
                      <div>
                        <label className={labelClass}>🔐 Face ID Status</label>
                        <div className="grid grid-cols-2 gap-3">
                          {/* Working */}
                          <button
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                faceIdStatus: "working",
                              }))
                            }
                            className={`relative flex flex-col items-center gap-3 py-5 px-3 rounded-2xl border-2 transition-all overflow-hidden ${
                              form.faceIdStatus === "working"
                                ? "border-[#00e090] bg-[#00e090]/10"
                                : "border-white/8 bg-[#1a1a26] hover:border-white/20"
                            }`}
                          >
                            {form.faceIdStatus === "working" && (
                              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#00e090] flex items-center justify-center">
                                <span className="text-black text-xs font-bold">
                                  ✓
                                </span>
                              </div>
                            )}
                            <div
                              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                                form.faceIdStatus === "working"
                                  ? "bg-[#00e090]/20"
                                  : "bg-white/5"
                              }`}
                            >
                              🔐
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-bold text-white mb-0.5">
                                Face ID Works
                              </p>
                              <p className="text-xs text-green-400 font-semibold">
                                No deduction
                              </p>
                              <p className="text-xs text-[#7070a0] mt-1">
                                Unlocks perfectly
                              </p>
                            </div>
                          </button>

                          {/* Broken */}
                          <button
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                faceIdStatus: "broken",
                              }))
                            }
                            className={`relative flex flex-col items-center gap-3 py-5 px-3 rounded-2xl border-2 transition-all overflow-hidden ${
                              form.faceIdStatus === "broken"
                                ? "border-red-500 bg-red-500/10"
                                : "border-white/8 bg-[#1a1a26] hover:border-white/20"
                            }`}
                          >
                            {form.faceIdStatus === "broken" && (
                              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                  ✓
                                </span>
                              </div>
                            )}
                            <div
                              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                                form.faceIdStatus === "broken"
                                  ? "bg-red-500/20"
                                  : "bg-white/5"
                              }`}
                            >
                              🔓
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-bold text-white mb-0.5">
                                Face ID Broken
                              </p>
                              <p className="text-xs text-red-400 font-semibold">
                                -10% deduction
                              </p>
                              <p className="text-xs text-[#7070a0] mt-1">
                                Not working / disabled
                              </p>
                            </div>
                          </button>
                        </div>

                        {/* Explanation */}
                        {form.faceIdStatus === "working" && (
                          <div className="mt-3 flex items-center gap-2 bg-[#00e090]/8 border border-[#00e090]/20 rounded-xl px-4 py-2.5">
                            <span className="text-lg">✅</span>
                            <p className="text-xs text-[#00e090]">
                              Face ID working — great for resale in Nigeria, no
                              deduction applied
                            </p>
                          </div>
                        )}
                        {form.faceIdStatus === "broken" && (
                          <div className="mt-3 flex items-center gap-2 bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-2.5">
                            <span className="text-lg">⚠️</span>
                            <p className="text-xs text-red-400">
                              Face ID issues significantly reduce iPhone resale
                              value — 10% deducted
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Repairs */}
                    <div>
                      <label className={labelClass}>
                        🔧 Repairs & Replacements
                      </label>
                      <div className="space-y-3">
                        {toggleBtn(
                          "batteryChanged",
                          "🔋 Battery has been replaced",
                          "-8%"
                        )}
                        {toggleBtn(
                          "screenChanged",
                          "📱 Screen has been replaced",
                          "-15%"
                        )}
                        {toggleBtn(
                          "cameraChanged",
                          "📷 Camera has been replaced",
                          "-10%"
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Laptop specific */}
                {isLaptop && (
                  <div>
                    <label className={labelClass}>
                      🔧 Repairs, Replacements & Upgrades
                    </label>
                    <div className="space-y-3">
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

                {/* Other repairs */}
                <div>
                  <label className={labelClass}>
                    Other Issues / Repairs (optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder={
                      isLaptop
                        ? "e.g. hinge loose, fan noisy, port damaged..."
                        : "e.g. back glass cracked, charging port replaced..."
                    }
                    className={`${inputClass} resize-none`}
                    value={form.otherRepairs}
                    onChange={(e) =>
                      setForm({ ...form, otherRepairs: e.target.value })
                    }
                  />
                  {form.otherRepairs.trim() && (
                    <p className="text-xs text-red-400 mt-1">
                      -5% for additional repairs
                    </p>
                  )}
                </div>

                {/* Media Upload */}
                <div>
                  <label className={labelClass}>
                    📸 Upload Photos & Videos of Your Device
                  </label>
                  <p className="text-xs text-[#7070a0] mb-3">
                    Upload clear photos/videos — front, back, sides, and any
                    damage. Max 10 files.
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-white/15 rounded-xl py-8 flex flex-col items-center gap-2 hover:border-[#6c47ff]/50 transition-colors"
                  >
                    <span className="text-3xl">📁</span>
                    <span className="text-sm text-[#7070a0]">
                      Tap to upload photos or videos
                    </span>
                    <span className="text-xs text-[#7070a0]">
                      JPG, PNG, MP4, MOV — max 10 files
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
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {mediaPreviews.map((src, i) => (
                        <div
                          key={i}
                          className="relative aspect-square rounded-xl overflow-hidden bg-[#1a1a26]"
                        >
                          {src === "video" ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-2xl">🎥</span>
                            </div>
                          ) : (
                            <img
                              src={src}
                              alt={`upload ${i}`}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <button
                            onClick={() => removeMedia(i)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {mediaPreviews.length < 10 && (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="aspect-square rounded-xl border-2 border-dashed border-white/15 flex items-center justify-center hover:border-[#6c47ff]/50 transition-colors"
                        >
                          <span className="text-2xl text-[#7070a0]">+</span>
                        </button>
                      )}
                    </div>
                  )}
                  {form.mediaFiles.length > 0 && (
                    <p className="text-xs text-[#00e5ff] mt-2">
                      ✅ {form.mediaFiles.length} file
                      {form.mediaFiles.length > 1 ? "s" : ""} uploaded — good
                      for buyer trust
                    </p>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-[#6c47ff] to-purple-500 text-white font-bold py-4 rounded-xl hover:opacity-85 transition-opacity text-base"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  Calculate My Device Value →
                </button>
              </>
            )}
          </div>
        ) : (
          result && (
            <div className="space-y-4">
              <div className="bg-[#12121a] border border-[#6c47ff]/40 rounded-2xl p-6">
                <p className="text-[#7070a0] text-sm mb-1 text-center">
                  Your {result.device.name} is worth
                </p>
                <h2
                  className="font-extrabold text-3xl sm:text-4xl text-white text-center mb-1"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  {formatPrice(result.minVal)}
                  <span className="text-[#7070a0] text-2xl"> – </span>
                  {formatPrice(result.maxVal)}
                </h2>
                <p className="text-[#7070a0] text-xs text-center mb-5">
                  {result.deductionPercent > 0
                    ? `${result.deductionPercent}% deducted`
                    : "No deductions — great condition!"}
                </p>

                <div className="mb-5">
                  <div className="flex justify-between text-xs text-[#7070a0] mb-1">
                    <span>Condition Score</span>
                    <span className="text-[#00e5ff] font-bold">
                      {100 - result.deductionPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-[#6c47ff] to-[#00e5ff]"
                      style={{
                        width: `${Math.max(5, 100 - result.deductionPercent)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2 border-t border-white/8 pt-4">
                  <p className="text-xs text-[#7070a0] uppercase tracking-wider mb-3">
                    Price Breakdown
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#7070a0]">Base market price</span>
                    <span className="text-white">
                      {formatPrice(result.basePrice)}
                    </span>
                  </div>
                  {form.storage && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7070a0]">Storage</span>
                      <span className="text-[#00e5ff]">{form.storage}</span>
                    </div>
                  )}
                  {batteryDeduct > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7070a0]">
                        Battery health ({form.batteryHealth}%)
                      </span>
                      <span className="text-red-400">-{batteryDeduct}%</span>
                    </div>
                  )}
                  {form.faceIdStatus === "broken" && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7070a0]">
                        Face ID not working
                      </span>
                      <span className="text-red-400">-10%</span>
                    </div>
                  )}
                  {form.faceIdStatus === "working" && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7070a0]">Face ID</span>
                      <span className="text-green-400">✅ Working</span>
                    </div>
                  )}
                  {form.simType === "locked" && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7070a0]">Locked SIM</span>
                      <span className="text-red-400">-10%</span>
                    </div>
                  )}
                  {form.simType === "esim-unlocked" && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7070a0]">eSIM Unlocked</span>
                      <span className="text-red-400">-5%</span>
                    </div>
                  )}
                  {form.simType === "physical" && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7070a0]">Physical SIM</span>
                      <span className="text-green-400">No deduction</span>
                    </div>
                  )}
                  {form.batteryChanged && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7070a0]">Battery replaced</span>
                      <span className="text-red-400">-8%</span>
                    </div>
                  )}
                  {form.screenChanged && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7070a0]">Screen replaced</span>
                      <span className="text-red-400">-15%</span>
                    </div>
                  )}
                  {form.cameraChanged && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7070a0]">Camera replaced</span>
                      <span className="text-red-400">-10%</span>
                    </div>
                  )}
                  {form.keyboardChanged && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7070a0]">Keyboard replaced</span>
                      <span className="text-red-400">-8%</span>
                    </div>
                  )}
                  {form.ramUpgraded && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7070a0]">RAM upgraded</span>
                      <span className="text-green-400">+5%</span>
                    </div>
                  )}
                  {form.storageUpgraded && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7070a0]">Storage upgraded</span>
                      <span className="text-green-400">+5%</span>
                    </div>
                  )}
                  {form.otherRepairs.trim() && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7070a0]">Other repairs</span>
                      <span className="text-red-400">-5%</span>
                    </div>
                  )}
                  {form.imeiValid && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7070a0]">IMEI verified</span>
                      <span className="text-green-400">✅ Boosts trust</span>
                    </div>
                  )}
                  {form.mediaFiles.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7070a0]">
                        {form.mediaFiles.length} photos/videos uploaded
                      </span>
                      <span className="text-green-400">✅ Boosts trust</span>
                    </div>
                  )}
                  <div className="border-t border-white/8 pt-2 flex justify-between text-sm font-bold">
                    <span className="text-white">Your valuation</span>
                    <span className="text-[#00e5ff]">
                      {formatPrice(result.minVal)} –{" "}
                      {formatPrice(result.maxVal)}
                    </span>
                  </div>
                </div>
              </div>

              <a
                href={`https://wa.me/2349133172761?text=Hi, I want to sell my ${
                  result.device.name
                }${form.storage ? ` (${form.storage})` : ""}. Battery: ${
                  form.batteryHealth
                }%${
                  form.faceIdStatus ? `, Face ID: ${form.faceIdStatus}` : ""
                }${form.simType ? `, SIM: ${form.simType}` : ""}${
                  form.batteryChanged ? ", battery replaced" : ""
                }${form.screenChanged ? ", screen replaced" : ""}${
                  form.cameraChanged ? ", camera replaced" : ""
                }${form.otherRepairs ? ", " + form.otherRepairs : ""}${
                  form.imeiValid ? `, IMEI: ${form.imei}` : ""
                }. Estimated value: ${formatPrice(
                  result.minVal
                )} – ${formatPrice(result.maxVal)}`}
                target="_blank"
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#25d366] to-[#128c7e] text-white font-bold py-4 rounded-xl hover:opacity-85 transition-opacity no-underline text-base"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                💬 Sell My Device on WhatsApp
              </a>

              <button
                onClick={handleReset}
                className="w-full border border-white/10 text-[#7070a0] font-bold py-3 rounded-xl hover:border-[#6c47ff] hover:text-white transition-all text-sm"
              >
                ← Value Another Device
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
