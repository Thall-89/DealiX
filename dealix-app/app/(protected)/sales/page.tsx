'use client';

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { getDashboardMetrics, useDealiXData } from "@/lib/store";

export default function SalesPage() {
  const snapshot = useDealiXData();
  const { builds } = snapshot;
  const metrics = getDashboardMetrics(snapshot);
  const soldBuild = builds.find((build) => build.status === "Sold");
  const listedBuild = builds.find((build) => build.status === "Listed");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sales workflow"
        title="Sales"
        description="Track confirmed sales, active listings, expected payouts, and missing sale information."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Confirmed Sales" value={`${metrics.completedSales}`} hint="Completed sale" icon="✅" accent="sky" />
        <StatCard label="Active Listings" value={`${metrics.listedBuilds}`} hint="Currently listed" icon="🛍" accent="purple" />
        <StatCard label="Expected Sale" value={listedBuild?.expectedSale ? `$${listedBuild.expectedSale}` : "Not entered"} hint="Projected range" icon="💸" />
        <StatCard label="Net Profit" value={`$${metrics.confirmedNetProfit.toFixed(2)}`} hint="Confirmed profit" icon="📈" />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
            <div className="text-xl font-semibold text-white">Confirmed money</div>
            <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              <div className="font-semibold">Build #1 sold via Mercari</div>
              <div className="mt-2">Sale price: ${soldBuild?.salePrice?.toFixed(2) ?? "0.00"}</div>
              <div>Payout: ${soldBuild?.mercariPayout?.toFixed(2) ?? "0.00"}</div>
              <div>Net profit: ${soldBuild?.netProfit?.toFixed(2) ?? "0.00"}</div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
            <div className="text-xl font-semibold text-white">Projected money</div>
            <div className="mt-4 rounded-2xl border border-sky-400/20 bg-sky-500/10 p-4 text-sm text-sky-200">
              <div className="font-semibold">Blue Titan is active as a listing</div>
              <div className="mt-2">Listing price: ${listedBuild?.listingPrice?.toFixed(2) ?? "0.00"}</div>
              <div>Expected sale: {listedBuild?.expectedSale}</div>
              <div>Projected profit: {listedBuild?.projectedProfit}</div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
          <div className="text-xl font-semibold text-white">Missing information</div>
          <div className="mt-4 space-y-3 text-sm text-zinc-400">
            <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-3 text-amber-200">Legacy Powerhouse has not yet reached a final sale outcome.</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">Marketplace comparison placeholders are shown for Mercari, eBay, and Facebook Marketplace.</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">This page uses mock figures and should not be treated as live market data.</div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
        <div className="text-xl font-semibold text-white">Marketplace comparison placeholder</div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            { name: "Mercari", note: "Current listing placeholder" },
            { name: "eBay", note: "Comparison placeholder" },
            { name: "Facebook Marketplace", note: "Local market placeholder" },
          ].map((item) => (
            <div key={item.name} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-400">
              <div className="font-medium text-white">{item.name}</div>
              <div className="mt-2">{item.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
