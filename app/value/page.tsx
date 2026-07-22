"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { type ListingMode } from "@/app/data/gadget";

import { useValueForm } from "@/app/hooks/useValueForm";
import { useMediaUploads } from "@/app/hooks/useMediaUploads";
import { useImeiCheck } from "@/app/hooks/useImeiCheck";
import { useAuth } from "@/app/hooks/useAuth";

import AuthGateModal from "@/app/component/value/AuthGateModal";
import StolenAlertModal from "@/app/component/value/StolenAlertModal";
import ValueForm from "@/app/component/value/ValueForm";
import ResultStep from "@/app/component/value/steps/ResultStep";
import ImeiStep from "@/app/component/value/steps/ImeiStep";
import PublishStep from "@/app/component/value/steps/PublishStep";

function ValueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultMode = (searchParams.get("type") as ListingMode) || "sell";

  const {
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
  } = useValueForm(defaultMode);

  const { mediaFiles, previews, handleMediaUpload, removeMedia } =
    useMediaUploads();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const [stolenAlert, setStolenAlert] = useState(false);
  const { imei, imeiValid, imeiChecking, imeiReport, handleIMEI } =
    useImeiCheck(() => {
      setStolenAlert(true);
    });

  return (
    <div className="min-h-screen bg-[#F8F8FC]">
      {showAuthGate && <AuthGateModal onClose={() => setShowAuthGate(false)} />}
      {stolenAlert && (
        <StolenAlertModal onClose={() => setStolenAlert(false)} />
      )}

      <nav className="sticky top-0 z-40 flex items-center justify-between bg-[#020044] px-6 py-4">
        <button
          onClick={() => router.push("/")}
          className="cursor-pointer font-['Space_Grotesk'] text-xl font-bold text-white"
        >
          Tech<span className="text-[#EF3F23]">Nest</span>
        </button>
        <span className="text-sm text-white/50">🇳🇬 Nigerian Market</span>
      </nav>

      <div className="mx-auto max-w-xl px-4 py-10">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[rgba(22,163,74,0.2)] bg-[rgba(22,163,74,0.08)] px-4 py-1.5 text-xs font-medium text-[#16a34a]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
            Free Valuation
          </div>
          <h1 className="mb-2 font-['Space_Grotesk'] text-3xl font-bold text-[#020044]">
            Value My Device
          </h1>
          <p className="text-sm text-[#6B6B8A]">
            Get a fair Nigerian market price instantly
          </p>
        </div>

        {step === "form" && (
          <ValueForm
            form={form}
            setForm={setForm}
            set={set}
            toggle={toggle}
            wantedCondition={wantedCondition}
            setWantedCondition={setWantedCondition}
            previews={previews}
            fileInputRef={fileInputRef}
            onUpload={(e) =>
              handleMediaUpload(e, (count) =>
                showSnack(`${count} file(s) ready`, "success")
              )
            }
            onRemoveMedia={removeMedia}
            onCalculate={handleCalculate}
          />
        )}

        {step === "result" && result && (
          <ResultStep
            form={form}
            result={result}
            onAdjust={() => setStep("form")}
            onContinue={() => {
              if (!user) {
                setShowAuthGate(true);
                return;
              }
              setStep("imei");
            }}
          />
        )}

        {step === "imei" && result && (
          <ImeiStep
            form={form}
            result={result}
            imei={imei}
            imeiValid={imeiValid}
            imeiChecking={imeiChecking}
            imeiReport={imeiReport}
            onImeiChange={handleIMEI}
            onBack={() => setStep("result")}
            onContinue={() => {
              if (form.subType === "iphone" && (!imei || !imeiValid)) {
                showSnack("A valid IMEI is required to proceed", "error");
                return;
              }
              set("imei", imei);
              set("imeiValid", imeiValid);
              setStep("publish");
            }}
          />
        )}

        {step === "publish" && result && (
          <PublishStep
            form={form}
            result={result}
            publishing={publishing}
            onSellerNameChange={(val) => set("sellerName", val)}
            onSellerPhoneChange={(val) => set("sellerPhone", val)}
            onBack={() => setStep("imei")}
            onPublish={() => handlePublish(mediaFiles)}
          />
        )}
      </div>

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default function ValuePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F8FC]" />}>
      <ValueContent />
    </Suspense>
  );
}
