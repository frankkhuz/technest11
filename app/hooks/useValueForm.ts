"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import {
  type FormData,
  type ListingMode,
  type PhoneCondition,
  initialForm,
  calculateValuation,
} from "@/app/data/gadget";

// Re-exported so components can keep importing WantedCondition from this hook —
// it's just gadget.ts's own PhoneCondition plus the "not chosen yet" empty state.
export type WantedCondition = PhoneCondition | "";

export type SnackState = {
  open: boolean;
  msg: string;
  severity: "success" | "error" | "info";
};

export function useValueForm(defaultMode: ListingMode) {
  const router = useRouter();
  const { user } = useAuth();

  const [form, setForm] = useState<FormData>({
    ...initialForm,
    listingMode: defaultMode,
  });
  const [wantedCondition, setWantedCondition] = useState<WantedCondition>("");
  const [result, setResult] =
    useState<ReturnType<typeof calculateValuation>>(null);
  const [step, setStep] = useState<"form" | "result" | "imei" | "publish">(
    "form"
  );
  const [publishing, setPublishing] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [snack, setSnack] = useState<SnackState>({
    open: false,
    msg: "",
    severity: "info",
  });

  useEffect(() => {
    if (user?.name) {
      setForm((p) => ({ ...p, sellerName: user.name }));
    }
  }, [user]);

  const showSnack = (msg: string, severity: SnackState["severity"]) =>
    setSnack({ open: true, msg, severity });

  const set = <K extends keyof FormData>(field: K, val: FormData[K]) =>
    setForm((p) => ({ ...p, [field]: val }));

  const toggle = (
    field:
      | "batteryChanged"
      | "screenChanged"
      | "cameraChanged"
      | "ramUpgraded"
      | "storageUpgraded"
      | "keyboardChanged"
  ) => setForm((p) => ({ ...p, [field]: !p[field] }));

  const handleCalculate = () => {
    if (!form.deviceId) {
      showSnack("Please select a device", "error");
      return;
    }
    const isOther = form.deviceId.startsWith("other-");
    if (isOther && (!form.customDeviceName || !form.customDevicePrice)) {
      showSnack("Enter device name and estimated price", "error");
      return;
    }
    const res = calculateValuation(form);
    if (!res) {
      showSnack("Could not calculate valuation. Check your inputs.", "error");
      return;
    }
    setResult(res);
    setStep("result");
    showSnack("Valuation calculated!", "success");
  };

  const handlePublish = async (mediaFilesForUpload: File[]) => {
    if (!result || !form.sellerName || !form.sellerPhone) {
      showSnack("Fill in your name and WhatsApp number", "error");
      return;
    }
    setPublishing(true);
    try {
      const repairs: string[] = [];
      if (form.batteryChanged) repairs.push("Battery replaced");
      if (form.screenChanged) repairs.push("Screen replaced");
      if (form.cameraChanged) repairs.push("Camera replaced");
      if (form.faceIdStatus === "broken") repairs.push("Face ID broken");
      if (form.keyboardChanged) repairs.push("Keyboard replaced");
      if (form.otherRepairs.trim()) repairs.push(form.otherRepairs.trim());

      const mediaImages: { data: string; type: string; name: string }[] = [];
      await Promise.all(
        mediaFilesForUpload
          .filter((file) => file.type.startsWith("image/"))
          .map(
            (file) =>
              new Promise<void>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                  const b64 = (reader.result as string).split(",")[1];
                  mediaImages.push({
                    data: b64,
                    type: file.type,
                    name: file.name,
                  });
                  resolve();
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
              })
          )
      );

      const payload = {
        userName: form.sellerName,
        userPhone: form.sellerPhone,
        deviceName: result.device.name,
        deviceCategory: form.category,
        subType: form.subType,
        storage: result.device.storage || null,
        batteryHealth: form.batteryHealth,
        simType: form.simType || null,
        faceIdStatus: form.faceIdStatus || null,
        repairs,
        mediaCount: mediaFilesForUpload.length,
        mediaImages,
        imeiVerified: form.imeiValid === true,
        estimatedMin: result.minVal,
        estimatedMax: result.maxVal,
        listingType: form.listingMode,
        wantedDevice:
          form.listingMode === "swap"
            ? form.wantedDevice === "Custom (type below)"
              ? form.customWantedDevice
              : form.wantedDevice
            : null,
        // NOTE: backend needs a matching field or this is dropped on save
        wantedCondition:
          form.listingMode === "swap" ? wantedCondition || null : null,
      };

      const res = await apiFetch("/api/listings", {
        method: "POST",
        auth: true,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errMsg = `Server error ${res.status}`;
        try {
          const errBody = await res.json();
          errMsg = errBody.message || errBody.error || errMsg;
        } catch {
          errMsg = res.statusText || errMsg;
        }
        throw new Error(errMsg);
      }

      showSnack("Listing published! Redirecting...", "success");
      setTimeout(() => router.push("/marketplace"), 1500);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to publish. Try again.";
      showSnack(`Error: ${message}`, "error");
      console.error("Publish error:", err);
    } finally {
      setPublishing(false);
    }
  };

  return {
    router,
    form,
    setForm,
    set,
    toggle,
    wantedCondition,
    setWantedCondition,
    result,
    step,
    setStep,
    publishing,
    showAuthGate,
    setShowAuthGate,
    snack,
    setSnack,
    showSnack,
    handleCalculate,
    handlePublish,
  };
}
