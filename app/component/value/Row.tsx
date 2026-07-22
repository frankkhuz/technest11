export default function Row({
  label,
  val,
  valColor,
}: {
  label: string;
  val: string;
  valColor?: string;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-[#6B6B8A]">{label}</span>
      <span className="font-medium" style={{ color: valColor || "#020044" }}>
        {val}
      </span>
    </div>
  );
}
