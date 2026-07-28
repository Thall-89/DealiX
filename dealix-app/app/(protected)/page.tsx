'use client';

import Link from "next/link";
import { ActionCard } from "@/components/ActionCard";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { BuildCard } from "@/components/BuildCard";
import { getDashboardMetrics, useDealiXData } from "@/lib/store";
import { FinancialSummary } from "@/components/FinancialSummary";
import { TodayGamePlan } from "@/components/TodayGamePlan";
import { useDashboardGreeting } from "@/components/DashboardGreeting";
import { GettingStarted } from "@/components/GettingStarted";

export default function HomePage() {
  const workspace = useDealiXData();
  const greeting = useDashboardGreeting();
  const snapshot = workspace;
  const metrics = getDashboardMetrics(snapshot);
  const blockedBuild = snapshot.builds.find((build) => build.partsNeeded?.some((part) => part.priority === "High" && part.status !== "Resolved"));
  const recentTargets = snapshot.dealOpportunities.filter((target) => !target.dismissed).slice(0, 3);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Morning briefing"
        title={greeting.title}
        description={`${greeting.description} You have ${metrics.pendingTasks} open task${metrics.pendingTasks === 1 ? "" : "s"} and ${metrics.openBuilds} open build${metrics.openBuilds === 1 ? "" : "s"}.`}
        action={
          <div className="rounded-[24px] border border-sky-400/20 bg-sky-500/10 p-5 sm:min-w-[260px]">
            <div className="text-xs uppercase tracking-[0.24em] text-sky-300">Today&apos;s operating view</div>
            <div className="mt-3 text-3xl font-semibold text-white">{metrics.openBuilds} open</div>
            <div className="mt-2 text-sm text-zinc-400">Focus on the work that moves an active build or sale forward.</div>
          </div>
        }
      />

      <GettingStarted />

      {blockedBuild ? <div className="rounded-[28px] border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-200">
        <div className="font-semibold">{blockedBuild.name} is blocked: {blockedBuild.partsNeeded?.find((part) => part.priority === "High")?.name ?? "a high-priority part"} needed.</div>
        <div className="mt-1 text-amber-300/90">Resolve this missing part to move the build forward.</div>
      </div> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Confirmed Profit" value={`$${metrics.confirmedNetProfit.toFixed(2)}`} hint="Realized profit" icon="💰" accent="sky" />
        <StatCard label="Completed Sales" value={`${metrics.completedSales}`} hint="Confirmed sales" icon="🧾" />
        <StatCard label="Open Builds" value={`${metrics.openBuilds}`} hint={`${metrics.activeBuilds} active · ${metrics.listedBuilds} listed`} icon="🖥" accent="purple" />
        <StatCard label="Total Recorded Build Cost" value={`$${metrics.totalRecordedBuildCost.toFixed(2)}`} hint="Recorded build spend" icon="📦" />
      </section>

      <FinancialSummary builds={snapshot.builds} />

      <TodayGamePlan />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Recent Builds</h2>
                <p className="mt-1 text-sm text-zinc-400">Your current momentum and blockers.</p>
              </div>
              <Link href="/builds" className="text-sm font-medium text-sky-300 transition-colors hover:text-sky-200">View history</Link>
            </div>
            <div className="space-y-3">{snapshot.builds.length ? snapshot.builds.map((build) => <BuildCard key={build.id} build={build} />) : <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-5 text-sm text-zinc-400">No builds yet. Start with a build you own, or plan one around a part you found in Recon.</div>}</div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-purple-400/20 bg-purple-500/10 p-6 shadow-[0_20px_60px_rgba(147,51,234,0.16)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-300">AI Assistant</p>
                <h2 className="mt-1 text-xl font-semibold text-white">What DealiX recommends</h2>
              </div>
              <div className="rounded-full border border-purple-400/20 bg-slate-950/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-purple-300">Smart</div>
            </div>
            <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm leading-7 text-zinc-300">{blockedBuild ? `${blockedBuild.name} has a high-priority missing part. Resolve it before you spend time testing or listing.` : snapshot.builds.length ? "Review your active builds for missing parts, testing gaps, and pricing before listing." : "Create a build or add inventory first. DealiX will then surface the most useful next action."}</p>
              <Link href="/ai" className="mt-4 inline-flex rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-400">Open AI Assistant</Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Recon Activity</h2>
              <Link href="/deals" className="text-sm font-medium text-sky-300 hover:text-sky-200">Open Recon</Link>
            </div>
            <div className="space-y-3 text-sm text-zinc-300">
              {recentTargets.length ? recentTargets.map((target) => <div key={target.id} className="rounded-2xl border border-white/10 bg-white/5 p-3"><span className="font-medium text-white">{target.title}</span><span className="ml-2 text-zinc-400">{target.marketplace}</span></div>) : <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-3 text-zinc-400">Recon is ready when you are. Choose hardware interests and it will surface worthwhile targets here.</div>}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
              <span className="text-sm text-zinc-500">Fast lane</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <ActionCard title="Analyze Market" description="Review current market opportunities" href="/deals" accent="sky" />
              <ActionCard title="Add Build" description="Review and manage builds" href="/builds" />
              <ActionCard title="Add Inventory" description="Track parts and components" href="/inventory" />
              <ActionCard title="Open Tasks" description="Manage active work" href="/tasks" />
              <ActionCard title="Open Notifications" description="Review alerts and reminders" href="/notifications" />
              <ActionCard title="Find Motherboard" description="Check compatibility for Legacy Powerhouse" href="/motherboard-finder" accent="purple" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
