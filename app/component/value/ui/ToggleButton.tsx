type ToggleButtonProps = {
  checked: boolean;
  onClick: () => void;
  label: string;
  desc: string;
  positive?: boolean;
};

export default function ToggleButton({
  checked,
  onClick,
  label,
  desc,
  positive = false,
}: ToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full cursor-pointer items-center justify-between rounded-xl border-2
                  px-4 py-3 text-left transition-colors duration-150 active:bg-[rgba(2,0,68,0.1)]
                  ${
                    checked
                      ? "border-[#020044] bg-[rgba(2,0,68,0.05)]"
                      : "border-[rgba(2,0,68,0.12)] bg-white"
                  }`}
    >
      <span className="text-sm text-[#020044]">{label}</span>
      <div className="flex items-center gap-2">
        <span
          className={`text-xs font-semibold ${
            positive ? "text-[#16a34a]" : "text-[#EF3F23]"
          }`}
        >
          {desc}
        </span>
        <div
          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors
                      ${
                        checked
                          ? "border-[#020044] bg-[#020044]"
                          : "border-[rgba(2,0,68,0.25)] bg-transparent"
                      }`}
        >
          {checked && <span className="text-xs font-bold text-white">✓</span>}
        </div>
      </div>
    </button>
  );
}
