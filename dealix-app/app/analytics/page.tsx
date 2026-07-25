'use client';

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { getDashboardMetrics, useDealiXData } from "@/lib/store";

export default function AnalyticsPage() {
  const snapshot = useDealiXData();
  const metrics = getDashboardMetrics(snapshot);
  const { builds } = snapshot;
  const listedBuild = builds.find((build) => build.status === "Listed");
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Limited analytics"
        title="Analytics"
        description="These insights are based on the limited data currently available. Only one sale is confirmed so far."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Confirmed Profit" value={`$${metrics.confirmedNetProfit.toFixed(2)}`} hint="Verified sale result" icon="💰" accent="sky" />
        <StatCard label="Total Recorded Build Cost" value={`$${metrics.totalRecordedBuildCost.toFixed(2)}`} hint="Recorded build spend" icon="📦" />
        <StatCard label="Completed Sales" value={`${metrics.completedSales}`} hint="Confirmed sales" icon="🧾" accent="purple" />
        <StatCard label="Open Builds" value={`${metrics.openBuilds}`} hint={`${metrics.activeBuilds} active · ${metrics.listedBuilds} listed`} icon="🖥" />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
          <div className="text-xl font-semibold text-white">Profit by build</div>
          <div className="mt-5 space-y-4">
            {builds.map((build) => (
              <div key={build.id}>
                <div className="mb-2 flex items-center justify-between text-sm text-zinc-400">
                  <span>{build.name}</span>
                  <span className="text-white">{build.status === "Sold" ? `$${build.netProfit?.toFixed(2)}` : "Projected"}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className={`h-2 rounded-full ${build.status === "Sold" ? "bg-emerald-500" : build.status === "Listed" ? "bg-sky-500" : "bg-amber-500"}`} style={{ width: `${build.status === "Sold" ? 70 : build.status === "Listed" ? 45 : 55}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
          <div className="text-xl font-semibold text-white">Build status breakdown</div>
          <div className="mt-5 space-y-4 text-sm text-zinc-400">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3">Sold builds: {metrics.completedSales}</div>
            <div className="rounded-2xl border border-sky-400/20 bg-sky-500/10 p-3">Listed builds: {metrics.listedBuilds}</div>
            <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-3">Active builds: {metrics.activeBuilds}</div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
        <div className="text-xl font-semibold text-white">Confirmed vs projected profit</div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            <div className="font-semibold">Confirmed</div>
            <div className="mt-2 text-2xl text-white">${metrics.confirmedNetProfit.toFixed(2)}</div>
          </div>
          <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-200">
            <div className="font-semibold">Projected</div>
            <div className="mt-2 text-2xl text-white">{listedBuild?.projectedProfit ? `$${listedBuild.projectedProfit}` : "Not entered"}</div>
            <div className="mt-2 text-amber-300/90">Projection only — not confirmed revenue.</div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
        <div className="text-xl font-semibold text-white">Capital tied up in active builds</div>
        <div className="mt-4 text-sm text-zinc-400">Current active build cost is ${builds.filter((build) => build.status === "Active").reduce((total, build) => total + build.buildCost, 0).toFixed(2)}. This does not represent current inventory value.</div>
      </div>
    </div>
  );
}
