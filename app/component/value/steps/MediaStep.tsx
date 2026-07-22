import type { RefObject } from "react";
import type { MediaPreview } from "@/app/hooks/useMediaUploads";

type MediaStepProps = {
  isIphone: boolean;
  previews: MediaPreview[];
  fileInputRef: RefObject<HTMLInputElement | null>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (i: number) => void;
};

export default function MediaStep({
  isIphone,
  previews,
  fileInputRef,
  onUpload,
  onRemove,
}: MediaStepProps) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-[#020044]">
        Photos & Videos (optional)
      </p>

      {isIphone && (
        <div className="mb-3 flex items-start gap-2.5 rounded-xl border border-[rgba(2,0,68,0.12)] bg-[rgba(2,0,68,0.04)] p-3">
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
              and include a screenshot in your uploads below.
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-xl border-2
                   border-dashed border-[rgba(2,0,68,0.15)] py-8 transition-colors duration-150
                   hover:opacity-80 active:bg-[rgba(2,0,68,0.05)]"
      >
        <span className="text-2xl">📷</span>
        <span className="text-sm text-[#6B6B8A]">
          Tap to upload photos or videos
        </span>
        <span className="text-xs text-[rgba(2,0,68,0.35)]">
          {previews.length > 0
            ? `${previews.length} file(s) added — tap to add more`
            : `Max 10 files${
                isIphone ? " · include Parts & Services screenshot" : ""
              }`}
        </span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={onUpload}
      />

      {previews.length > 0 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {previews.map((preview, i) => (
            <div
              key={i}
              className="relative aspect-square overflow-hidden rounded-xl bg-[rgba(2,0,68,0.06)]"
            >
              {preview.isVideo ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1">
                  <span className="text-2xl">🎥</span>
                  <span className="w-full truncate px-1 text-center text-[9px] text-[#6B6B8A]">
                    {preview.name}
                  </span>
                </div>
              ) : preview.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview.url}
                  alt={`upload-${i}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-2xl">📄</span>
                </div>
              )}
              <button
                onClick={() => onRemove(i)}
                className="absolute top-1 right-1 flex h-6 w-6 cursor-pointer items-center justify-center
                           rounded-full bg-[#EF3F23] text-sm leading-none font-bold text-white shadow-md
                           active:bg-[#c9331c]"
              >
                ×
              </button>
              <div className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-[9px] text-white">
                {i + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {previews.length > 0 && (
        <p className="mt-2 text-center text-xs text-[#6B6B8A]">
          {previews.length} of 10 files uploaded
        </p>
      )}
    </div>
  );
}
