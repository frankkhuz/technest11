"use client";
import { useRouter } from "next/navigation";
import PressedButton from "./ui/PressedButton";

export default function AuthGateModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-4 pb-6 sm:items-center sm:pb-0"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-[rgba(2,0,68,0.1)] bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(2,0,68,0.06)] text-3xl">
          🔐
        </div>
        <h3 className="mb-1 text-center font-['Space_Grotesk'] text-lg font-bold text-[#020044]">
          Sign in to list your device
        </h3>
        <p className="mb-6 text-center text-sm text-[#6B6B8A]">
          Create a free account or sign in to publish your listing on TechNest.
        </p>
        <div className="space-y-2">
          <PressedButton
            onClick={() => router.push("/auth/register?redirect=/value")}
          >
            Create Free Account
          </PressedButton>
          <PressedButton
            variant="secondary"
            onClick={() => router.push("/auth/login?redirect=/value")}
          >
            Sign In
          </PressedButton>
          <button
            onClick={onClose}
            className="w-full cursor-pointer py-2 text-xs text-[#6B6B8A] active:text-[#020044]"
          >
            Maybe later — continue valuing
          </button>
        </div>
      </div>
    </div>
  );
}
