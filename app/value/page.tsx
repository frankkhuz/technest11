"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "../lib/helpers";

// ─── DEVICE DATA ─────────────────────────────────────────────────
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

type FormData = {
  category: DeviceCategory | "";
  subType: SubType | "";
  deviceId: string;
  batteryHealth: string;
  batteryChanged: boolean;
  screenChanged: boolean;
  cameraChanged: boolean;
  // laptop specific
  ramUpgraded: boolean;
  storageUpgraded: boolean;
  keyboardChanged: boolean;
  otherRepairs: string;
};

const initialForm: FormData = {
  category: "",
  subType: "",
  deviceId: "",
  batteryHealth: "100",
  batteryChanged: false,
  screenChanged: false,
  cameraChanged: false,
  ramUpgraded: false,
  storageUpgraded: false,
  keyboardChanged: false,
  otherRepairs: "",
};

function getDevices(category: DeviceCategory | "", subType: SubType | "") {
  if (!category || !subType) return [];
  if (category === "phone") {
    return deviceData.phone[subType as PhoneType] || [];
  }
  return deviceData.laptop[subType as LaptopType] || [];
}

function calculateValuation(form: FormData) {
  const devices = getDevices(form.category, form.subType);
  const device = devices.find((d) => d.id === form.deviceId);
  if (!device) return null;

  const basePrice = (device.baseMin + device.baseMax) / 2;
  let deduction = 0;

  // Battery health
  const battery = Number(form.batteryHealth);
  if (battery < 80) deduction += 0.2;
  else if (battery < 85) deduction += 0.12;
  else if (battery < 90) deduction += 0.07;
  else if (battery < 95) deduction += 0.03;

  // Phone deductions
  if (form.batteryChanged) deduction += 0.08;
  if (form.screenChanged) deduction += 0.15;
  if (form.cameraChanged) deduction += 0.1;

  // Laptop deductions
  if (form.keyboardChanged) deduction += 0.08;

  // Laptop upgrades (these ADD value)
  if (form.ramUpgraded) deduction -= 0.05;
  if (form.storageUpgraded) deduction -= 0.05;

  // Other repairs
  if (form.otherRepairs.trim()) deduction += 0.05;

  // Cap between -10% (upgrades) and 55% deduction
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

  const handleSubmit = () => {
    if (!form.deviceId) return;
    setResult(calculateValuation(form));
    setSubmitted(true);
  };

  const handleReset = () => {
    setForm(initialForm);
    setResult(null);
    setSubmitted(false);
  };

  const setCategory = (cat: DeviceCategory) => {
    setForm({ ...initialForm, category: cat });
  };

  const setSubType = (sub: SubType) => {
    setForm((prev) => ({ ...prev, subType: sub, deviceId: "" }));
  };

  const toggle = (field: keyof FormData) => {
    setForm((prev) => ({ ...prev, [field]: !prev[field] }));
  };

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
  const isLaptop = form.category === "laptop";

  const labelClass = "text-sm text-[#7070a0] mb-2 block";
  const selectClass =
    "w-full bg-[#1a1a26] border border-white/10 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6c47ff] transition-colors cursor-pointer";
  const inputClass =
    "w-full bg-[#1a1a26] border border-white/10 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6c47ff] transition-colors placeholder-[#7070a0]";

  const categoryBtn = (cat: DeviceCategory, emoji: string, label: string) => (
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
        {label}
      </span>
    </button>
  );

  const subTypeBtn = (sub: SubType, emoji: string, label: string) => (
    <button
      onClick={() => setSubType(sub)}
      className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
        form.subType === sub
          ? "border-[#6c47ff] bg-[#6c47ff]/15 text-white"
          : "border-white/8 bg-[#1a1a26] text-[#7070a0] hover:border-[#6c47ff]/50 hover:text-white"
      }`}
    >
      {emoji} {label}
    </button>
  );

  const toggleBtn = (
    field: keyof FormData,
    label: string,
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
      <span className="text-sm text-white">{label}</span>
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

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#6c47ff]/8 blur-3xl pointer-events-none" />

      {/* Nav */}
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
        {/* Header */}
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
            {/* STEP 1 - Category */}
            <div>
              <label className={labelClass}>
                Step 1 — What type of device?
              </label>
              <div className="flex gap-3">
                {categoryBtn("phone", "📱", "Phone")}
                {categoryBtn("laptop", "💻", "Laptop")}
              </div>
            </div>

            {/* STEP 2 - Sub type */}
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

            {/* STEP 3 - Device */}
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

            {/* STEP 4 - Condition */}
            {form.deviceId && (
              <>
                {/* Battery health */}
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

                {/* Phone specific toggles */}
                {!isLaptop && (
                  <div>
                    <label className={labelClass}>Repairs & Replacements</label>
                    <div className="space-y-3">
                      {toggleBtn(
                        "batteryChanged",
                        "🔋 Battery replaced",
                        "-8%"
                      )}
                      {toggleBtn("screenChanged", "📱 Screen replaced", "-15%")}
                      {toggleBtn("cameraChanged", "📷 Camera replaced", "-10%")}
                    </div>
                  </div>
                )}

                {/* Laptop specific toggles */}
                {isLaptop && (
                  <div>
                    <label className={labelClass}>
                      Repairs, Replacements & Upgrades
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

                {/* Submit */}
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
                    : "No deductions — great condition!"}{" "}
                  based on condition
                </p>

                {/* Score bar */}
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

                {/* Breakdown */}
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
                  {batteryDeduct > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7070a0]">
                        Battery health ({form.batteryHealth}%)
                      </span>
                      <span className="text-red-400">-{batteryDeduct}%</span>
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
                }. Battery: ${form.batteryHealth}%${
                  form.batteryChanged ? ", battery replaced" : ""
                }${form.screenChanged ? ", screen replaced" : ""}${
                  form.cameraChanged ? ", camera replaced" : ""
                }${form.keyboardChanged ? ", keyboard replaced" : ""}${
                  form.ramUpgraded ? ", RAM upgraded" : ""
                }${form.storageUpgraded ? ", storage upgraded" : ""}${
                  form.otherRepairs ? ", " + form.otherRepairs : ""
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
