'use client';

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { deals } from "@/lib/mockData";
import { StatusBadge } from "@/components/StatusBadge";

export default function DealsPage() {
  const [query, setQuery] = useState("");
  const [marketplace, setMarketplace] = useState("All");
  const [category, setCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(300);
  const [minProfit, setMinProfit] = useState(15);

  const visibleDeals = useMemo(() => {
    return deals.filter((deal) => {
      const matchesQuery = `${deal.title} ${deal.marketplace}`.toLowerCase().includes(query.toLowerCase());
      const matchesMarketplace = marketplace === "All" || deal.marketplace === marketplace;
      const matchesCategory = category === "All" || deal.category === category;
      const matchesPrice = deal.listingPrice <= maxPrice;
      const matchesProfit = deal.estimatedProfit >= minProfit;
      return matchesQuery && matchesMarketplace && matchesCategory && matchesPrice && matchesProfit;
    });
  }, [category, marketplace, maxPrice, minProfit, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Demo mode"
        title="Deal Finder"
        description="Explore mock marketplace opportunities. Live marketplace scanning will be added later through official APIs where permitted."
      />

      <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-4 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
        <div className="grid gap-3 lg:grid-cols-4">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search deals" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500" />
          <select value={marketplace} onChange={(event) => setMarketplace(event.target.value)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none">
            <option value="All" className="bg-slate-900">All</option>
            <option value="Facebook Marketplace" className="bg-slate-900">Facebook Marketplace</option>
            <option value="eBay" className="bg-slate-900">eBay</option>
            <option value="Mercari" className="bg-slate-900">Mercari</option>
            <option value="Demo Search" className="bg-slate-900">Demo Search</option>
          </select>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none">
            <option value="All" className="bg-slate-900">All</option>
            <option value="GPU" className="bg-slate-900">GPU</option>
            <option value="CPU Bundle" className="bg-slate-900">CPU Bundle</option>
            <option value="Motherboard" className="bg-slate-900">Motherboard</option>
          </select>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
            <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Max price</div>
            <input type="range" min="100" max="400" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} className="mt-2 w-full accent-sky-500" />
            <div className="mt-2 text-white">${maxPrice}</div>
          </div>
        </div>
        <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-400">
          <div className="flex items-center justify-between">
            <span>Minimum estimated profit</span>
            <input type="range" min="10" max="50" value={minProfit} onChange={(event) => setMinProfit(Number(event.target.value))} className="ml-3 w-40 accent-sky-500" />
            <span className="text-white">${minProfit}</span>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-200">
        <div className="font-semibold">Mock saved search</div>
        <div className="mt-1 text-amber-300/90">Legacy Powerhouse motherboard compatibility is being tracked as a mock search for now. This is not a live listing and should not be treated as a confirmed match.</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {visibleDeals.map((deal) => (
          <div key={deal.id} className="rounded-[28px] border border-white/10 bg-slate-950/40 p-5 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-sky-300">{deal.marketplace}</div>
                <h3 className="mt-1 text-lg font-semibold text-white">{deal.title}</h3>
              </div>
              <StatusBadge status={deal.riskLevel === "Low" ? "Active" : deal.riskLevel === "Medium" ? "Needs Testing" : "Failed"}>{deal.riskLevel} risk</StatusBadge>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-zinc-400 sm:grid-cols-2">
              <div>Listing price: ${deal.listingPrice.toFixed(2)}</div>
              <div>Estimated market value: ${deal.estimatedMarketValue.toFixed(2)}</div>
              <div>Estimated fees: ${deal.estimatedFees.toFixed(2)}</div>
              <div>Estimated shipping: ${deal.estimatedShipping.toFixed(2)}</div>
              <div>Estimated profit: ${deal.estimatedProfit.toFixed(2)}</div>
              <div>Flip Score: {deal.flipScore}/100</div>
              <div>Seller rating: {deal.sellerRating}</div>
              <div>Category: {deal.category}</div>
            </div>
            <p className="mt-4 text-sm leading-7 text-zinc-400">{deal.note}</p>
            <button className="mt-4 rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:border-sky-400/30 hover:text-sky-200">View Listing</button>
          </div>
        ))}
      </div>

      {visibleDeals.length === 0 ? <div className="rounded-[24px] border border-dashed border-white/15 bg-white/5 p-8 text-center text-zinc-400">No demo deals match your current filters.</div> : null}
    </div>
  );
}
