import { type FormData, wantedDevices } from "@/app/data/gadget";
import type { WantedCondition } from "@/app/hooks/useValueForm";
import ChoiceButton from "../ui/ChoiceButton";

type SwapTargetStepProps = {
  form: FormData;
  set: <K extends keyof FormData>(field: K, val: FormData[K]) => void;
  wantedCondition: WantedCondition;
  setWantedCondition: (val: WantedCondition) => void;
};

export default function SwapTargetStep({
  form,
  set,
  wantedCondition,
  setWantedCondition,
}: SwapTargetStepProps) {
  const inp =
    "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors bg-white border-[rgba(2,0,68,0.2)] text-[#020044]";

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-[#020044]">
        What device do you want?
      </p>

      {/* Condition choice comes first — the device dropdown only appears once this is picked */}
      <div className="mb-3 grid grid-cols-2 gap-3">
        <ChoiceButton
          active={wantedCondition === "brand-new"}
          onClick={() => setWantedCondition("brand-new")}
          icon="✨"
          title="Brand New"
          desc="Sealed / unused"
        />
        <ChoiceButton
          active={wantedCondition === "uk-used"}
          onClick={() => setWantedCondition("uk-used")}
          icon="🇬🇧"
          title="UK Used"
          desc="Foreign used, tested"
        />
      </div>

      {wantedCondition && (
        <>
          <select
            className={`${inp} cursor-pointer`}
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
              placeholder="Type exact device name and storage"
              value={form.customWantedDevice}
              onChange={(e) => set("customWantedDevice", e.target.value)}
            />
          )}
        </>
      )}
    </div>
  );
}
