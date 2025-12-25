import { cn } from "@/lib/utils";

type Status = "PENDING" | "APPROVED" | "REJECTED";

export function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = status.toUpperCase() as Status;
  
  const variants = {
    PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
    APPROVED: "bg-green-100 text-green-700 border-green-200",
    REJECTED: "bg-red-100 text-red-700 border-red-200",
  };

  const labels = {
    PENDING: "Pending",
    APPROVED: "Approved",
    REJECTED: "Rejected",
  };

  return (
    <span className={cn(
      "px-2.5 py-1 rounded-full text-xs font-semibold border",
      variants[normalizedStatus] || variants.PENDING
    )}>
      {labels[normalizedStatus] || status}
    </span>
  );
}
