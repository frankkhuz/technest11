type ChoiceButtonProps = {
  active: boolean;
  onClick: () => void;
  icon: string;
  title: string;
  desc?: string;
  disabled?: boolean;
};

export default function ChoiceButton({
  active,
  onClick,
  icon,
  title,
  desc,
  disabled = false,
}: ChoiceButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-4 text-center
                  transition-colors duration-150 active:bg-[rgba(2,0,68,0.12)]
                  disabled:cursor-not-allowed disabled:opacity-50
                  ${
                    active
                      ? "border-[#020044] bg-[rgba(2,0,68,0.05)]"
                      : "border-[rgba(2,0,68,0.12)] bg-white"
                  } ${disabled ? "" : "cursor-pointer"}`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-semibold text-[#020044]">{title}</span>
      {desc && <span className="text-xs text-[#6B6B8A]">{desc}</span>}
    </button>
  );
}
