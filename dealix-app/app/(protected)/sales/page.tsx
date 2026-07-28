'use client';

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { getDashboardMetrics, useDealiXData } from "@/lib/store";

const money = (value?: number | string) => {
  if (typeof value === "number") return `$${value.toFixed(2)}`;
  return value ? `$${value}` : "Not entered";
};

export default function SalesPage() {
  const snapshot = useDealiXData();
  const { builds } = snapshot;
  const metrics = getDashboardMetrics(snapshot);
  const soldBuild = builds.find((build) => build.status === "Sold");
  const listedBuild = builds.find((build) => build.status === "Listed");
  const needsSaleDetails = builds.filter((build) => build.status === "Sold" && (!build.salePrice || !build.mercariPayout));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sales workflow"
        title="Sales"
        description="Track confirmed outcomes separately from projections. Values shown here come from builds saved in your workspace."
        action={<Link href="/builds" className="inline-flex rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:bg-sky-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300">Manage builds</Link>}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Confirmed Sales" value={`${metrics.completedSales}`} hint="Completed build records" icon="✓" accent="sky" />
        <StatCard label="Active Listings" value={`${metrics.listedBuilds}`} hint="Currently marked listed" icon="↗" accent="purple" />
        <StatCard label="Expected Sale" value={money(listedBuild?.expectedSale)} hint={listedBuild ? listedBuild.name : "Add a listing to project"} icon="$" />
        <StatCard label="Net Profit" value={money(metrics.confirmedNetProfit)} hint="Confirmed only" icon="↗" />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-white">Confirmed money</h2>
            {soldBuild ? (
              <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                <div className="font-semibold">{soldBuild.name} sold{soldBuild.marketplace ? ` via ${soldBuild.marketplace}` : ""}</div>
                <div className="mt-2">Sale price: {money(soldBuild.salePrice)}</div>
                <div>Payout: {money(soldBuild.mercariPayout ?? soldBuild.profitBreakdown?.payout)}</div>
                <div>Net profit: {money(soldBuild.netProfit ?? soldBuild.profitBreakdown?.netProfit)}</div>
              </div>
            ) : (
              <EmptySales title="No confirmed sales yet" description="When you mark a build as sold and enter the final sale details, its confirmed result will appear here." />
            )}
          </section>

          <section className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-white">Projected money</h2>
            {listedBuild ? (
              <div className="mt-4 rounded-2xl border border-sky-400/20 bg-sky-500/10 p-4 text-sm text-sky-100">
                <div className="font-semibold">{listedBuild.name} is listed</div>
                <div className="mt-2">Listing price: {money(listedBuild.listingPrice)}</div>
                <div>Expected sale: {money(listedBuild.expectedSale)}</div>
                <div>Projected profit: {money(listedBuild.projectedProfit)}</div>
              </div>
            ) : (
              <EmptySales title="No active listings" description="Mark a build as Listed and add a listing price to keep projected revenue visible here." />
            )}
          </section>
        </div>

        <section className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
          <h2 className="text-xl font-semibold text-white">What needs attention</h2>
          <div className="mt-4 space-y-3 text-sm text-zinc-400">
            {needsSaleDetails.length ? needsSaleDetails.map((build) => (
              <Link key={build.id} href={`/builds/${build.slug}`} className="block rounded-2xl border border-amber-400/20 bg-amber-500/10 p-3 text-amber-100 transition hover:border-amber-300/40">
                <span className="font-medium">{build.name}</span> is marked sold, but its final sale price or payout is missing.
              </Link>
            )) : (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-emerald-100">Your sold builds have the sale details needed for confirmed reporting.</div>
            )}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">Marketplace comparisons are not connected in this beta. DealiX only reports the marketplace and amounts you save with each build.</div>
          </div>
        </section>
      </div>
    </div>
  );
}

function EmptySales({ title, description }: { title: string; description: string }) {
  return <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-white/5 p-5 text-sm text-zinc-400"><div className="font-medium text-zinc-200">{title}</div><p className="mt-2 leading-6">{description}</p></div>;
}
