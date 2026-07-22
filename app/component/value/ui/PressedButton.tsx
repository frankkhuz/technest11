type PressedButtonProps = {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "whatsapp";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
  href?: string;
};

const VARIANT_CLASSES: Record<string, string> = {
  primary:
    "bg-[#020044] text-white hover:opacity-90 active:opacity-100 active:bg-[#01002e] disabled:opacity-40",
  secondary:
    "border border-[rgba(2,0,68,0.2)] text-[#020044] bg-white active:bg-[rgba(2,0,68,0.06)]",
  whatsapp: "bg-[#25d366] text-white active:bg-[#1fb057]",
};

export default function PressedButton({
  onClick,
  children,
  variant = "primary",
  disabled = false,
  className = "",
  type = "button",
  href,
}: PressedButtonProps) {
  const classes = `w-full cursor-pointer rounded-xl py-3 text-sm font-semibold
                   transition-colors duration-150 disabled:cursor-not-allowed
                   ${VARIANT_CLASSES[variant]} ${className}`;

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={`flex items-center justify-center gap-2 no-underline ${classes}`}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
}
