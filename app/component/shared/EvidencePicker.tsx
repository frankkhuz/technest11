"use client";

import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";

/** Photo picker used for dispute evidence and similar uploads (max `max`). */
export default function EvidencePicker({
  files,
  onChange,
  max = 6,
}: {
  files: File[];
  onChange: (f: File[]) => void;
  max?: number;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex gap-2 flex-wrap">
      {files.map((f, i) => (
        <div key={`${f.name}-${i}`} className="relative w-16 h-16 rounded-xl overflow-hidden" style={{ background: "var(--border)" }}>
          <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(files.filter((_, j) => j !== i))}
            className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: "#DC2626", color: "#fff" }}
            aria-label="Remove photo"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      {files.length < max && (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center"
          style={{ borderColor: "var(--border)", color: "var(--ink-soft)", cursor: "pointer" }}
          aria-label="Add photos"
        >
          <ImagePlus className="w-5 h-5" />
        </button>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          onChange([...files, ...Array.from(e.target.files ?? [])].slice(0, max));
          e.target.value = "";
        }}
      />
    </div>
  );
}
