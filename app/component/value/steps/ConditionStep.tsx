import {
  type FormData,
  type FaceIdStatus,
  type SimType,
} from "@/app/data/gadget";
import { getBatteryDeduction } from "@/app/lib/valuation-helpers";
import ToggleButton from "../ui/ToggleButton";

type RepairField =
  | "batteryChanged"
  | "screenChanged"
  | "cameraChanged"
  | "ramUpgraded"
  | "storageUpgraded"
  | "keyboardChanged";

type ConditionStepProps = {
  form: FormData;
  set: <K extends keyof FormData>(field: K, val: FormData[K]) => void;
  toggle: (field: RepairField) => void;
};

const SIM_OPTIONS: {
  val: SimType;
  lbl: string;
  desc: string;
  color: string;
}[] = [
  {
    val: "physical",
    lbl: "Physical SIM",
    desc: "No deduction",
    color: "#16a34a",
  },
  { val: "esim-unlocked", lbl: "eSIM Unlocked", desc: "-5%", color: "#d97706" },
  { val: "locked", lbl: "Locked SIM", desc: "-10%", color: "#EF3F23" },
];

const FACE_ID_OPTIONS: {
  val: FaceIdStatus;
  icon: string;
  lbl: string;
  desc: string;
  color: string;
}[] = [
  {
    val: "working",
    icon: "🔐",
    lbl: "Face ID Works",
    desc: "No deduction",
    color: "#16a34a",
  },
  {
    val: "broken",
    icon: "🔓",
    lbl: "Face ID Broken",
    desc: "-10%",
    color: "#EF3F23",
  },
];

const PHONE_REPAIRS: {
  field: RepairField;
  label: string;
  desc: string;
  positive?: boolean;
}[] = [
  { field: "batteryChanged", label: "🔋 Battery replaced", desc: "-10%" },
  { field: "screenChanged", label: "📱 Screen replaced", desc: "-10%" },
  { field: "cameraChanged", label: "📷 Camera replaced", desc: "-10%" },
];

const LAPTOP_REPAIRS: {
  field: RepairField;
  label: string;
  desc: string;
  positive?: boolean;
}[] = [
  { field: "screenChanged", label: "🖥️ Screen replaced", desc: "-15%" },
  { field: "batteryChanged", label: "🔋 Battery replaced", desc: "-8%" },
  { field: "keyboardChanged", label: "⌨️ Keyboard replaced", desc: "-8%" },
  {
    field: "ramUpgraded",
    label: "⚡ RAM upgraded",
    desc: "+5%",
    positive: true,
  },
  {
    field: "storageUpgraded",
    label: "💾 Storage upgraded",
    desc: "+5%",
    positive: true,
  },
];

export default function ConditionStep({
  form,
  set,
  toggle,
}: ConditionStepProps) {
  const isPhone = form.category === "phone";
  const isLaptop = form.category === "laptop";
  const isIphone = form.subType === "iphone";
  const battery = Number(form.batteryHealth);
  const batteryDeduct = getBatteryDeduction(battery);

  return (
    <>
      {/* Battery */}
      <div>
        <p className="mb-2 text-sm font-medium text-[#020044]">
          Battery Health: {form.batteryHealth}%
        </p>
        <input
          type="range"
          min={50}
          max={100}
          value={form.batteryHealth}
          onChange={(e) => set("batteryHealth", e.target.value)}
          className="w-full cursor-pointer accent-[#020044]"
        />
        <div className="mt-1 flex justify-between text-xs text-[#6B6B8A]">
          <span>50% Poor</span>
          <span>75% Average</span>
          <span>100% Perfect</span>
        </div>
        {batteryDeduct > 0 && (
          <p className="mt-1 text-xs text-[#EF3F23]">
            -{batteryDeduct}% for battery health
          </p>
        )}
      </div>

      {isPhone && (
        <>
          {/* SIM status */}
          <div>
            <p className="mb-2 text-sm font-medium text-[#020044]">
              SIM / Lock Status
            </p>
            <div className="grid grid-cols-3 gap-2">
              {SIM_OPTIONS.map(({ val, lbl, desc, color }) => (
                <button
                  key={val}
                  onClick={() => set("simType", val)}
                  className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2
                              px-2 py-3 text-center transition-colors duration-150
                              active:bg-[rgba(2,0,68,0.1)]
                              ${
                                form.simType === val
                                  ? "border-[#020044] bg-[rgba(2,0,68,0.05)]"
                                  : "border-[rgba(2,0,68,0.12)] bg-white"
                              }`}
                >
                  <span className="text-xs font-semibold text-[#020044]">
                    {lbl}
                  </span>
                  <span className="text-xs font-medium" style={{ color }}>
                    {desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {isIphone && (
            <div>
              <p className="mb-2 text-sm font-medium text-[#020044]">
                Face ID Status
              </p>
              <div className="grid grid-cols-2 gap-3">
                {FACE_ID_OPTIONS.map(({ val, icon, lbl, desc, color }) => (
                  <button
                    key={val}
                    onClick={() => set("faceIdStatus", val)}
                    className={`relative flex cursor-pointer flex-col items-center gap-2 rounded-xl
                                border-2 py-5 text-center transition-colors duration-150
                                active:bg-[rgba(2,0,68,0.1)]
                                ${
                                  form.faceIdStatus === val
                                    ? "border-[#020044] bg-[rgba(2,0,68,0.05)]"
                                    : "border-[rgba(2,0,68,0.12)] bg-white"
                                }`}
                  >
                    {form.faceIdStatus === val && (
                      <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#020044]">
                        <span className="text-xs font-bold text-white">✓</span>
                      </div>
                    )}
                    <span className="text-2xl">{icon}</span>
                    <span className="text-xs font-semibold text-[#020044]">
                      {lbl}
                    </span>
                    <span className="text-xs font-medium" style={{ color }}>
                      {desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-2 text-sm font-medium text-[#020044]">
              Repairs & Replacements
            </p>
            <div className="space-y-2">
              {PHONE_REPAIRS.map(({ field, label, desc, positive }) => (
                <ToggleButton
                  key={field}
                  checked={form[field]}
                  onClick={() => toggle(field)}
                  label={label}
                  desc={desc}
                  positive={positive}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {isLaptop && (
        <div>
          <p className="mb-2 text-sm font-medium text-[#020044]">
            Repairs, Replacements & Upgrades
          </p>
          <div className="space-y-2">
            {LAPTOP_REPAIRS.map(({ field, label, desc, positive }) => (
              <ToggleButton
                key={field}
                checked={form[field]}
                onClick={() => toggle(field)}
                label={label}
                desc={desc}
                positive={positive}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
