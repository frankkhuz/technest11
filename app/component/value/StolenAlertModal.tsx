import PressedButton from "./ui/PressedButton";

export default function StolenAlertModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
      <div className="w-full max-w-sm rounded-2xl border-2 border-[#EF3F23] bg-white p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(239,63,35,0.1)] text-3xl">
            🚨
          </div>
          <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#020044]">
            Warning — Stolen Device Alert
          </h3>
          <p className="text-sm text-[#6B6B8A]">
            This IMEI has been flagged as suspicious. Listing or selling a
            stolen device is a criminal offence.{" "}
            <strong className="text-[#EF3F23]">
              Stolen phones will be reported to the Nigerian Police Force (NPF).
            </strong>
          </p>
          <div className="w-full rounded-xl border border-[rgba(239,63,35,0.2)] bg-[rgba(239,63,35,0.06)] p-3 text-left text-sm text-[#EF3F23]">
            📄 We strongly advise you to keep a{" "}
            <strong>receipt or proof of purchase</strong> for your gadget at all
            times.
          </div>
          <PressedButton
            onClick={onClose}
            className="bg-[#EF3F23] active:bg-[#c9331c]"
          >
            I Understand
          </PressedButton>
        </div>
      </div>
    </div>
  );
}
