import { type FormData, calculateValuation } from "@/app/data/gadget";
import { formatPrice } from "@/app/lib/helpers";
import PressedButton from "../ui/PressedButton";

type PublishStepProps = {
  form: FormData;
  result: NonNullable<ReturnType<typeof calculateValuation>>;
  publishing: boolean;
  onSellerNameChange: (val: string) => void;
  onSellerPhoneChange: (val: string) => void;
  onBack: () => void;
  onPublish: () => void;
};

export default function PublishStep({
  form,
  result,
  publishing,
  onSellerNameChange,
  onSellerPhoneChange,
  onBack,
  onPublish,
}: PublishStepProps) {
  const isSwap = form.listingMode === "swap";
  const inp =
    "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors bg-white border-[rgba(2,0,68,0.2)] text-[#020044]";

  return (
    <div className="space-y-5 rounded-2xl border border-[rgba(2,0,68,0.08)] bg-white p-6">
      <div>
        <h2 className="mb-1 font-['Space_Grotesk'] text-xl font-bold text-[#020044]">
          {isSwap ? "Post Swap Request" : "List Your Device"}
        </h2>
        <p className="text-sm text-[#6B6B8A]">
          {isSwap
            ? "Vendors will see your swap request and contact you"
            : "Your listing goes live — vendors and buyers will be notified"}
        </p>
      </div>

      <div className="rounded-xl border border-[rgba(2,0,68,0.08)] bg-[rgba(2,0,68,0.03)] p-4">
        <p className="mb-1 text-sm font-semibold text-[#020044]">
          {result.device.name}
          {result.device.storage ? ` (${result.device.storage})` : ""}
        </p>
        <p className="font-bold text-[#020044]">
          {formatPrice(result.minVal)} – {formatPrice(result.maxVal)}
        </p>
        {isSwap && form.wantedDevice && (
          <p className="mt-1 text-xs text-[#774499]">
            Wants:{" "}
            {form.wantedDevice === "Custom (type below)"
              ? form.customWantedDevice
              : form.wantedDevice}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#020044]">
          Your Name *
        </label>
        <input
          className={inp}
          placeholder="John Doe"
          value={form.sellerName}
          onChange={(e) => onSellerNameChange(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#020044]">
          WhatsApp Number *
        </label>
        <input
          className={inp}
          type="tel"
          placeholder="08012345678"
          value={form.sellerPhone}
          onChange={(e) => onSellerPhoneChange(e.target.value)}
        />
        <p className="mt-1 text-xs text-[#6B6B8A]">
          Vendors will contact you on WhatsApp
        </p>
      </div>

      <div className="flex gap-3">
        <PressedButton variant="secondary" onClick={onBack}>
          ← Back
        </PressedButton>
        <PressedButton
          onClick={onPublish}
          disabled={publishing || !form.sellerName || !form.sellerPhone}
        >
          {publishing
            ? "Publishing..."
            : isSwap
            ? "Post Swap Request"
            : "Publish Listing"}
        </PressedButton>
      </div>
    </div>
  );
}
