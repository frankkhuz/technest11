import type { Dispatch, RefObject, SetStateAction } from "react";
import type { FormData } from "@/app/data/gadget";
import type { WantedCondition } from "@/app/hooks/useValueForm";
import type { MediaPreview } from "@/app/hooks/useMediaUploads";
import DeviceStep from "./steps/DeviceStep";
import ConditionStep from "./steps/ConditionStep";
import SwapTargetStep from "./steps/SwapTargetStep";
import MediaStep from "./steps/MediaStep";
import PressedButton from "./ui/PressedButton";

type RepairField =
  | "batteryChanged"
  | "screenChanged"
  | "cameraChanged"
  | "ramUpgraded"
  | "storageUpgraded"
  | "keyboardChanged";

type ValueFormProps = {
  form: FormData;
  setForm: Dispatch<SetStateAction<FormData>>;
  set: <K extends keyof FormData>(field: K, val: FormData[K]) => void;
  toggle: (field: RepairField) => void;
  wantedCondition: WantedCondition;
  setWantedCondition: (val: WantedCondition) => void;
  previews: MediaPreview[];
  fileInputRef: RefObject<HTMLInputElement | null>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveMedia: (i: number) => void;
  onCalculate: () => void;
};

export default function ValueForm({
  form,
  setForm,
  set,
  toggle,
  wantedCondition,
  setWantedCondition,
  previews,
  fileInputRef,
  onUpload,
  onRemoveMedia,
  onCalculate,
}: ValueFormProps) {
  const isOther = form.deviceId.startsWith("other-");
  const readyForRestOfForm =
    !!form.deviceId &&
    (isOther ? !!(form.customDeviceName && form.customDevicePrice) : true);

  return (
    <div className="space-y-6 rounded-2xl border border-[rgba(2,0,68,0.08)] bg-white p-6">
      <DeviceStep form={form} setForm={setForm} set={set} />

      {readyForRestOfForm && (
        <>
          <ConditionStep form={form} set={set} toggle={toggle} />

          {form.listingMode === "swap" && (
            <SwapTargetStep
              form={form}
              set={set}
              wantedCondition={wantedCondition}
              setWantedCondition={setWantedCondition}
            />
          )}

          <div>
            <p className="mb-2 text-sm font-medium text-[#020044]">
              Other Issues (optional)
            </p>
            <textarea
              rows={2}
              className="w-full resize-none rounded-xl border border-[rgba(2,0,68,0.2)] bg-white px-4 py-3 text-sm text-[#020044] outline-none transition-colors"
              placeholder={
                form.category === "laptop"
                  ? "e.g. hinge loose, fan noisy..."
                  : "e.g. back glass cracked..."
              }
              value={form.otherRepairs}
              onChange={(e) => set("otherRepairs", e.target.value)}
            />
            {form.otherRepairs.trim() && (
              <p className="mt-1 text-xs text-[#EF3F23]">
                -10% for additional repairs
              </p>
            )}
          </div>

          <MediaStep
            isIphone={form.subType === "iphone"}
            previews={previews}
            fileInputRef={fileInputRef}
            onUpload={onUpload}
            onRemove={onRemoveMedia}
          />

          <PressedButton onClick={onCalculate}>
            Calculate My Device Value →
          </PressedButton>
        </>
      )}
    </div>
  );
}
