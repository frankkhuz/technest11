import { type FormData, calculateValuation } from "@/app/data/gadget";
import { formatPrice } from "@/app/lib/helpers";
import { getBatteryDeduction } from "@/app/lib/valuation-helpers";
import Row from "../Row";
import PressedButton from "../ui/PressedButton";

type ResultStepProps = {
  form: FormData;
  result: NonNullable<ReturnType<typeof calculateValuation>>;
  onAdjust: () => void;
  onContinue: () => void;
};

export default function ResultStep({
  form,
  result,
  onAdjust,
  onContinue,
}: ResultStepProps) {
  const batteryDeduct = getBatteryDeduction(Number(form.batteryHealth));

  const whatsappHref = `https://wa.me/2348186450477?text=Hi, I want to sell my ${
    result.device.name
  }${
    result.device.storage ? ` (${result.device.storage})` : ""
  }. Valued at ${formatPrice(result.minVal)} – ${formatPrice(result.maxVal)}.`;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[rgba(2,0,68,0.08)] bg-white p-6">
        <p className="mb-1 text-center text-sm text-[#6B6B8A]">
          Your {result.device.name}
          {result.device.storage ? ` (${result.device.storage})` : ""} is worth
        </p>
        <h2 className="mb-1 text-center font-['Space_Grotesk'] text-3xl font-bold text-[#020044]">
          {formatPrice(result.minVal)} – {formatPrice(result.maxVal)}
        </h2>
        <p className="mb-5 text-center text-xs text-[#6B6B8A]">
          {result.deductionPercent > 0
            ? `${result.deductionPercent}% deducted for condition`
            : "No deductions — excellent condition!"}
        </p>

        <div className="mb-5">
          <div className="mb-1 flex justify-between text-xs text-[#6B6B8A]">
            <span>Condition Score</span>
            <span className="font-semibold text-[#020044]">
              {100 - result.deductionPercent}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-[rgba(2,0,68,0.08)]">
            <div
              className="h-2 rounded-full bg-[#020044] transition-all"
              style={{
                width: `${Math.max(5, 100 - result.deductionPercent)}%`,
              }}
            />
          </div>
        </div>

        <div className="space-y-2 border-t border-[rgba(2,0,68,0.08)] pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#6B6B8A]">
            Price Breakdown
          </p>
          <Row label="Base market price" val={formatPrice(result.basePrice)} />
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
            <Row label="Physical SIM" val="No deduction" valColor="#16a34a" />
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
          <div className="flex justify-between border-t border-[rgba(2,0,68,0.08)] pt-2 font-semibold">
            <span className="text-[#020044]">Your valuation</span>
            <span className="text-[#020044]">
              {formatPrice(result.minVal)} – {formatPrice(result.maxVal)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <PressedButton variant="secondary" onClick={onAdjust}>
          ← Adjust
        </PressedButton>
        <PressedButton onClick={onContinue}>
          {form.listingMode === "swap"
            ? "Post Swap Request →"
            : "List for Sale →"}
        </PressedButton>
      </div>

      <PressedButton variant="whatsapp" href={whatsappHref}>
        💬 WhatsApp to Sell Directly
      </PressedButton>
    </div>
  );
}
