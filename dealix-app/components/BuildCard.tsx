import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { BuildHealthCard } from "@/components/BuildHealthCard";
import { useDealiXData } from "@/lib/store";
import type { Build } from "@/types";

interface BuildCardProps {
  build: Build;
}

export function BuildCard({ build }: BuildCardProps) {
  const { tasks, testingResults } = useDealiXData();
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold text-white">{build.name}</h3>
            <StatusBadge status={build.status} />
          </div>
          <div className="mt-3 grid gap-2 text-sm text-zinc-400 sm:grid-cols-2">
            <div>Build cost: ${build.buildCost.toFixed(2)}</div>
            {build.status === "Sold" ? <div>Net profit: ${build.netProfit?.toFixed(2) ?? "0.00"}</div> : null}
            {build.status === "Active" ? <div>Projected profit: {build.projectedProfit}</div> : null}
            {build.status === "Listed" ? <div>Expected sale: {build.expectedSale}</div> : null}
          </div>
          {build.partsNeeded?.length ? (
            <div className="mt-3 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-3 text-sm text-amber-300">
              {build.partsNeeded[0].name} • {build.partsNeeded[0].status}
            </div>
          ) : null}
          <div className="mt-3"><BuildHealthCard build={build} tasks={tasks} testing={testingResults[build.id]} compact /></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/builds/${build.slug}`} className="rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:border-sky-400/30 hover:text-sky-200">
            View Details
          </Link>
          <Link href={`/builds/${build.slug}`} className="rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:border-sky-400/30 hover:text-sky-200">
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
}
