import { type FormData, calculateValuation } from "@/app/data/gadget";
import { formatPrice } from "@/app/lib/helpers";
import PressedButton from "../ui/PressedButton";

type ImeiStepProps = {
  form: FormData;
  result: NonNullable<ReturnType<typeof calculateValuation>>;
  imei: string;
  imeiValid: boolean | null;
  imeiChecking: boolean;
  imeiReport: string | null;
  onImeiChange: (val: string) => void;
  onBack: () => void;
  onContinue: () => void;
};

export default function ImeiStep({
  form,
  result,
  imei,
  imeiValid,
  imeiChecking,
  imeiReport,
  onImeiChange,
  onBack,
  onContinue,
}: ImeiStepProps) {
  const isIphone = form.subType === "iphone";

  return (
    <div className="space-y-6 rounded-2xl border border-[rgba(2,0,68,0.08)] bg-white p-6">
      <div>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(2,0,68,0.06)] text-2xl">
          🔍
        </div>
        <h2 className="mb-1 font-['Space_Grotesk'] text-xl font-bold text-[#020044]">
          Verify Your Device
        </h2>
        <p className="text-sm text-[#6B6B8A]">
          {isIphone
            ? "Enter your IMEI to confirm your iPhone is legitimate before listing"
            : "Confirm your device details before listing"}
        </p>
      </div>

      <div className="rounded-xl border border-[rgba(2,0,68,0.08)] bg-[rgba(2,0,68,0.03)] p-4">
        <p className="mb-0.5 text-xs text-[#6B6B8A]">Device being listed</p>
        <p className="font-['Space_Grotesk'] font-semibold text-[#020044]">
          {result.device.name}
          {result.device.storage ? ` (${result.device.storage})` : ""}
        </p>
        <p className="mt-1 text-sm font-bold text-[#020044]">
          {formatPrice(result.minVal)} – {formatPrice(result.maxVal)}
        </p>
      </div>

      {isIphone ? (
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-[#020044]">IMEI Number</p>
              <span className="rounded-full bg-[rgba(239,63,35,0.08)] px-2 py-0.5 text-xs font-semibold text-[#EF3F23]">
                Required for iPhones
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="15-digit IMEI (dial *#06#)"
                className="w-full rounded-xl border px-4 py-3 text-sm text-[#020044] outline-none transition-colors"
                style={{
                  borderColor:
                    imei.length === 15 && !imeiValid
                      ? "#EF3F23"
                      : imeiValid
                      ? "#16a34a"
                      : "rgba(2,0,68,0.2)",
                }}
                value={imei}
                onChange={(e) => onImeiChange(e.target.value)}
                maxLength={15}
              />
              {imeiChecking && (
                <span className="absolute top-1/2 right-4 -translate-y-1/2 text-xs text-[#6B6B8A]">
                  Checking...
                </span>
              )}
              {!imeiChecking && imei.length === 15 && (
                <span
                  className="absolute top-1/2 right-4 -translate-y-1/2 text-xs font-bold"
                  style={{ color: imeiValid ? "#16a34a" : "#EF3F23" }}
                >
                  {imeiValid ? "✓ Valid" : "✗ Invalid"}
                </span>
              )}
            </div>

            {imei.length === 15 && imeiValid && imeiReport && (
              <div className="mt-2 rounded-xl border border-[rgba(22,163,74,0.2)] bg-[rgba(22,163,74,0.06)] p-3 text-xs">
                <p className="mb-0.5 font-semibold text-[#16a34a]">
                  ✓ IMEI Verified — Device Report
                </p>
                <p className="text-[#6B6B8A]">{imeiReport}</p>
              </div>
            )}

            <p className="mt-1.5 text-xs text-[#6B6B8A]">
              Dial <strong>*#06#</strong> to find your IMEI.
            </p>
            <p className="mt-1 text-xs font-medium text-[#EF3F23]">
              ⚠️ Devices flagged as stolen will be removed and reported to the
              NPF.
            </p>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-[rgba(2,0,68,0.12)] bg-[rgba(2,0,68,0.04)] p-3">
            <span className="mt-0.5 flex-shrink-0 text-lg">📋</span>
            <div>
              <p className="mb-0.5 text-xs font-semibold text-[#020044]">
                Parts &amp; Services screenshot required
              </p>
              <p className="text-xs leading-relaxed text-[#6B6B8A]">
                Go to{" "}
                <strong className="text-[#020044]">
                  Settings → General → About → Parts and Services
                </strong>{" "}
                and include a screenshot when uploading photos.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-[rgba(22,163,74,0.2)] bg-[rgba(22,163,74,0.06)] p-4">
          <span className="text-2xl">✅</span>
          <div>
            <p className="text-sm font-semibold text-[#16a34a]">
              Device confirmed
            </p>
            <p className="mt-0.5 text-xs text-[#6B6B8A]">
              No IMEI required for this device type. You&apos;re good to
              proceed.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <PressedButton variant="secondary" onClick={onBack}>
          ← Back
        </PressedButton>
        <PressedButton onClick={onContinue}>Continue →</PressedButton>
      </div>
    </div>
  );
}
