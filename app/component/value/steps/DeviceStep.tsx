import type { Dispatch, SetStateAction } from "react";
import {
  type FormData,
  type LaptopType,
  type PhoneType,
  getDevices,
} from "@/app/data/gadget";
import { formatPrice } from "@/app/lib/helpers";
import ChoiceButton from "../ui/ChoiceButton";

type DeviceStepProps = {
  form: FormData;
  setForm: Dispatch<SetStateAction<FormData>>;
  set: <K extends keyof FormData>(field: K, val: FormData[K]) => void;
};

const LAPTOP_SUBTYPES: [LaptopType, string][] = [
  ["macbook", "🍎 MacBook"],
  ["windows", "🪟 Windows"],
  ["linux", "🐧 Linux"],
  ["gaming", "🎮 Gaming"],
];

function resetDeviceSelection(p: FormData, patch: Partial<FormData>): FormData {
  return {
    ...p,
    ...patch,
    deviceId: "",
    customDeviceName: "",
    customDevicePrice: "",
  };
}

export default function DeviceStep({ form, setForm, set }: DeviceStepProps) {
  const isOther = form.deviceId.startsWith("other-");
  const devices = getDevices(form.category, form.subType);
  const selectedDevice = devices.find((d) => d.id === form.deviceId);
  const regularDevices = devices.filter((d) => !d.id.startsWith("other-"));
  const otherDevice = devices.find((d) => d.id.startsWith("other-"));

  const inp =
    "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors bg-white border-[rgba(2,0,68,0.2)] text-[#020044]";

  return (
    <>
      {/* What to do */}
      <div>
        <p className="mb-2 text-sm font-medium text-[#020044]">
          What do you want to do?
        </p>
        <div className="grid grid-cols-2 gap-3">
          <ChoiceButton
            active={form.listingMode === "sell"}
            onClick={() => set("listingMode", "sell")}
            icon="💰"
            title="Sell for Cash"
            desc="Get paid in naira"
          />
          <ChoiceButton
            active={form.listingMode === "swap"}
            onClick={() => set("listingMode", "swap")}
            icon="🔄"
            title="Swap Device"
            desc="Trade for another model"
          />
        </div>
      </div>

      {/* Device type */}
      <div>
        <p className="mb-2 text-sm font-medium text-[#020044]">
          What type of device?
        </p>
        <div className="grid grid-cols-2 gap-3">
          <ChoiceButton
            active={form.category === "phone"}
            onClick={() =>
              setForm((p) =>
                resetDeviceSelection(p, { category: "phone", subType: "" })
              )
            }
            icon="📱"
            title="Phone"
          />
          <div className="relative w-full">
            <ChoiceButton
              active={false}
              onClick={() => {}}
              icon="💻"
              title="Laptop"
              disabled
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-xl bg-white/80">
              <span className="rounded-full bg-[#020044] px-3 py-1 text-xs font-bold text-white">
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Phone sub type */}
      {form.category === "phone" && (
        <div>
          <p className="mb-2 text-sm font-medium text-[#020044]">
            iPhone or Android?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() =>
                setForm((p) =>
                  resetDeviceSelection(p, { subType: "iphone" as PhoneType })
                )
              }
              className={`flex-1 cursor-pointer rounded-xl border-2 py-2.5 text-sm font-medium
                          text-[#020044] transition-colors duration-150 active:bg-[rgba(2,0,68,0.1)]
                          ${
                            form.subType === "iphone"
                              ? "border-[#020044] bg-[rgba(2,0,68,0.05)]"
                              : "border-[rgba(2,0,68,0.12)] bg-white"
                          }`}
            >
              🍎 iPhone
            </button>

            <div className="relative flex-1">
              <button
                disabled
                className="w-full cursor-not-allowed rounded-xl border-2 border-[rgba(2,0,68,0.12)] bg-white py-2.5 text-sm font-medium text-[#020044] opacity-50"
              >
                🤖 Android
              </button>
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/65">
                <span className="rounded-full bg-[#020044] px-3 py-1 text-xs font-bold text-white">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Laptop sub type */}
      {form.category === "laptop" && (
        <div>
          <p className="mb-2 text-sm font-medium text-[#020044]">
            What type of laptop?
          </p>
          <div className="flex flex-wrap gap-2">
            {LAPTOP_SUBTYPES.map(([v, label]) => (
              <button
                key={v}
                onClick={() =>
                  setForm((p) => resetDeviceSelection(p, { subType: v }))
                }
                className={`cursor-pointer rounded-xl border-2 px-4 py-2 text-sm font-medium
                            text-[#020044] transition-colors duration-150 active:bg-[rgba(2,0,68,0.1)]
                            ${
                              form.subType === v
                                ? "border-[#020044] bg-[rgba(2,0,68,0.05)]"
                                : "border-[rgba(2,0,68,0.12)] bg-white"
                            }`}
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
          <p className="mb-2 text-sm font-medium text-[#020044]">
            Select your exact model & storage
          </p>
          <select
            className={`${inp} cursor-pointer`}
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
                {d.storage ? ` ${d.storage}` : ""} — {formatPrice(d.baseMin)} to{" "}
                {formatPrice(d.baseMax)}
              </option>
            ))}
            {otherDevice && (
              <>
                <option disabled>──────────────</option>
                <option value={otherDevice.id}>Other (type manually)</option>
              </>
            )}
          </select>
        </div>
      )}

      {/* Other custom inputs */}
      {isOther && (
        <div className="space-y-3 rounded-xl border border-[rgba(2,0,68,0.1)] bg-[rgba(2,0,68,0.03)] p-4">
          <p className="text-sm font-semibold text-[#020044]">
            Enter your device details
          </p>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#6B6B8A]">
              Device Name & Storage
            </label>
            <input
              className={inp}
              placeholder="e.g. iPhone 13 Pro Max 256GB"
              value={form.customDeviceName}
              onChange={(e) => set("customDeviceName", e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#6B6B8A]">
              Estimated Market Price (₦)
            </label>
            <input
              className={inp}
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
          <div className="rounded-xl border border-[rgba(2,0,68,0.08)] bg-[rgba(2,0,68,0.03)] p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#6B6B8A]">
              Device Specs
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {selectedDevice.chip && (
                <div>
                  <p className="text-xs text-[#6B6B8A]">Chip</p>
                  <p className="text-sm font-medium text-[#020044]">
                    {selectedDevice.chip}
                  </p>
                </div>
              )}
              {selectedDevice.ram && (
                <div>
                  <p className="text-xs text-[#6B6B8A]">RAM</p>
                  <p className="text-sm font-medium text-[#020044]">
                    {selectedDevice.ram}
                  </p>
                </div>
              )}
              {selectedDevice.display && (
                <div className="col-span-2">
                  <p className="text-xs text-[#6B6B8A]">Display</p>
                  <p className="text-sm font-medium text-[#020044]">
                    {selectedDevice.display}
                  </p>
                </div>
              )}
              {selectedDevice.storage && (
                <div className="col-span-2">
                  <p className="text-xs text-[#6B6B8A]">Storage</p>
                  <span className="mt-0.5 inline-block rounded-full bg-[rgba(2,0,68,0.08)] px-2.5 py-0.5 text-xs font-semibold text-[#020044]">
                    {selectedDevice.storage}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
    </>
  );
}
