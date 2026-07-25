import type { ReactNode } from "react";

interface StatusBadgeProps {
  status: string;
  children?: ReactNode;
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const base = "rounded-full px-3 py-1 text-xs font-semibold";

  if (status === "Sold") {
    return <span className={`${base} bg-emerald-500/15 text-emerald-400`}>{children ?? "Sold"}</span>;
  }

  if (status === "Active") {
    return <span className={`${base} bg-amber-500/15 text-amber-400`}>{children ?? "Active"}</span>;
  }

  if (status === "Listed") {
    return <span className={`${base} bg-sky-500/15 text-sky-400`}>{children ?? "Listed"}</span>;
  }

  if (status === "Passed") {
    return <span className={`${base} bg-emerald-500/15 text-emerald-400`}>{children ?? "Passed"}</span>;
  }

  if (status === "Needs Testing" || status === "Needs Repair") {
    return <span className={`${base} bg-amber-500/15 text-amber-400`}>{children ?? status}</span>;
  }

  if (status === "Failed") {
    return <span className={`${base} bg-rose-500/15 text-rose-400`}>{children ?? "Failed"}</span>;
  }

  return <span className={`${base} bg-white/10 text-zinc-300`}>{children ?? status}</span>;
}
