export default function StatsCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="bg-[#12121a] p-4 rounded-xl border border-white/10">
      <p className="text-[#7070a0] text-sm">{title}</p>
      <h2 className="text-xl font-bold text-white">{value}</h2>
    </div>
  );
}
