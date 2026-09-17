import { Clock, CheckCircle2, Check, XCircle } from "lucide-react";
import type { TransactionStatus } from "@/app/lib/transactions";

const CONFIG: Record<
  TransactionStatus,
  { label: string; color: string; bg: string; Icon: typeof Clock }
> = {
  pending: { label: "Pending", color: "#d97706", bg: "rgba(217,119,6,0.12)", Icon: Clock },
  accepted: { label: "Accepted", color: "#7c3aed", bg: "rgba(124,58,237,0.12)", Icon: CheckCircle2 },
  completed: { label: "Completed", color: "#16a34a", bg: "rgba(22,163,74,0.12)", Icon: Check },
  cancelled: { label: "Cancelled", color: "#6b7280", bg: "rgba(107,114,128,0.12)", Icon: XCircle },
};

export default function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  const { label, color, bg, Icon } = CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: bg, color }}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}
