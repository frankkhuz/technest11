// Repair service price ranges for the "Fix My Device" triage flow.
//
// These are ESTIMATED typical ranges for the Nigerian repair market, not a
// vendor-confirmed price list (unlike the iPhone valuation prices in
// gadget.ts, which came from a real quoted list). They exist so the AI can
// give a useful ballpark instead of no number at all — every place they're
// shown in the UI says "estimated" and points to WhatsApp for an exact quote.
// Replace with real confirmed pricing whenever it's available.

export type DeviceKind = "phone" | "laptop" | "tablet" | "console" | "any";

export type RepairService = {
  id: string;
  issue: string;
  appliesTo: DeviceKind[];
  priceMin: number;
  priceMax: number;
  note?: string;
};

export const repairServices: RepairService[] = [
  {
    id: "screen-replacement-budget",
    issue: "Screen replacement (budget/aftermarket)",
    appliesTo: ["phone"],
    priceMin: 15_000,
    priceMax: 45_000,
    note: "Works fine, may have slightly less accurate color/touch than original",
  },
  {
    id: "screen-replacement-oem",
    issue: "Screen replacement (OEM/original-quality)",
    appliesTo: ["phone"],
    priceMin: 45_000,
    priceMax: 180_000,
    note: "Price scales heavily with model — flagship OLED screens cost far more than budget LCDs",
  },
  {
    id: "screen-replacement-laptop",
    issue: "Screen replacement (laptop)",
    appliesTo: ["laptop"],
    priceMin: 35_000,
    priceMax: 120_000,
  },
  {
    id: "battery-replacement-phone",
    issue: "Battery replacement",
    appliesTo: ["phone"],
    priceMin: 12_000,
    priceMax: 35_000,
  },
  {
    id: "battery-replacement-laptop",
    issue: "Battery replacement (laptop)",
    appliesTo: ["laptop"],
    priceMin: 25_000,
    priceMax: 60_000,
  },
  {
    id: "charging-port-repair",
    issue: "Charging port cleaning/repair",
    appliesTo: ["phone", "laptop", "tablet"],
    priceMin: 8_000,
    priceMax: 25_000,
    note: "Often a simple lint/debris cleanout — ask for a free inspection first",
  },
  {
    id: "camera-repair",
    issue: "Camera module repair/replacement",
    appliesTo: ["phone"],
    priceMin: 15_000,
    priceMax: 50_000,
  },
  {
    id: "back-glass-replacement",
    issue: "Back glass replacement",
    appliesTo: ["phone"],
    priceMin: 10_000,
    priceMax: 30_000,
  },
  {
    id: "water-damage-service",
    issue: "Water damage diagnostic & cleaning",
    appliesTo: ["phone", "laptop", "console"],
    priceMin: 10_000,
    priceMax: 20_000,
    note: "Diagnostic fee — further repair cost depends on what's actually damaged",
  },
  {
    id: "speaker-mic-repair",
    issue: "Speaker/microphone repair",
    appliesTo: ["phone", "laptop"],
    priceMin: 8_000,
    priceMax: 25_000,
  },
  {
    id: "button-repair",
    issue: "Power/volume button repair",
    appliesTo: ["phone", "console"],
    priceMin: 6_000,
    priceMax: 18_000,
  },
  {
    id: "hdmi-port-repair",
    issue: "HDMI/display port repair",
    appliesTo: ["console"],
    priceMin: 15_000,
    priceMax: 40_000,
  },
  {
    id: "fan-cleaning-repair",
    issue: "Fan cleaning / thermal repaste (overheating)",
    appliesTo: ["laptop", "console"],
    priceMin: 8_000,
    priceMax: 20_000,
  },
  {
    id: "keyboard-repair-laptop",
    issue: "Keyboard repair/replacement",
    appliesTo: ["laptop"],
    priceMin: 15_000,
    priceMax: 45_000,
  },
  {
    id: "general-diagnostic",
    issue: "General diagnostic (unclear fault)",
    appliesTo: ["any"],
    priceMin: 3_000,
    priceMax: 8_000,
    note: "Usually credited toward the repair if you go ahead",
  },
];
