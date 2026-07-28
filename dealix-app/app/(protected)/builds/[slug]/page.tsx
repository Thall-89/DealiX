'use client';

import { useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { BuildForm } from "@/components/BuildForm";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ListingGenerator } from "@/components/ListingGenerator";
import { BuyVsPartOut } from "@/components/BuyVsPartOut";
import { confirmedBuildFinancials, projectedBuildFinancials } from "@/lib/financials";
import { MarketplaceListings } from "@/components/MarketplaceListings";
import { RecreateBuild } from "@/components/RecreateBuild";
import { dealixStore, useDealiXData } from "@/lib/store";
import { BuildHealthCard } from "@/components/BuildHealthCard";

const tabs = ["Overview", "Parts", "Expenses", "Testing", "Photos", "Listing", "Sale", "Notes", "Timeline", "Profit"] as const;

type TabKey = (typeof tabs)[number];

export default function BuildDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { builds, tasks, testingResults } = useDealiXData();
  const build = useMemo(() => builds.find((item) => item.slug === slug) ?? null, [builds, slug]);
  const [activeTab, setActiveTab] = useState<TabKey>("Overview");
  const [draft, setDraft] = useState(() => build ?? builds[0]!);
  const [saveMessage, setSaveMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!build) {
    notFound();
  }

  const saveChanges = () => {
    dealixStore.updateBuild(draft);
    setSaveMessage("Saved everywhere in this browser.");
  };

  const resetDemoData = () => {
    if (window.confirm("Reset all DealiX demo data in this browser? This will replace saved builds, inventory, tasks, notifications, settings, and testing results.")) {
      dealixStore.resetDemoData();
      const restored = dealixStore.getSnapshot().builds.find((item) => item.slug === slug);
      if (restored) setDraft(restored);
      setSaveMessage("Demo data restored.");
    }
  };

  const computeDays = (start?: string, end?: string) => {
    if (!start) return "Not entered";
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diff = Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    return `${diff} day${diff === 1 ? "" : "s"}`;
  };

  const daysUntilSold = draft.status === "Sold" ? "0 days" : draft.saleDate ? computeDays(draft.saleDate, new Date().toISOString()) : "Not entered";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Build details"
        title={draft.name}
        description="Edit this build, review its timeline, and keep its saved details accurate across your workspace."
        action={
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setEditing(true)} className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300">Edit Build</button>
            <RecreateBuild build={draft} />
            <button onClick={saveChanges} className="rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white">Save</button>
            <button onClick={resetDemoData} className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300">Reset Demo Data</button>
          </div>
        }
      />

      {editing ? <BuildForm initial={draft} onSave={(next) => { dealixStore.updateBuild(next); setDraft(next); setEditing(false); setSaveMessage("Build saved everywhere in this browser."); }} onCancel={() => setEditing(false)} /> : null}
      <div className="flex justify-end"><button onClick={() => setDeleting(true)} className="rounded-full border border-rose-400/20 px-4 py-2 text-sm text-rose-200">Delete Build</button></div>

      <ListingGenerator build={draft} onSaved={(next) => { setDraft(next); setSaveMessage("Listing draft saved everywhere in this browser."); }} />
      <MarketplaceListings build={draft} />
      <BuyVsPartOut title={draft.name} marketplace={draft.marketplace} />

      {draft.status === "Sold" ? (() => { const financials = confirmedBuildFinancials(draft); return <div className="rounded-[28px] border border-emerald-400/20 bg-emerald-500/10 p-6 text-sm text-emerald-100"><h2 className="text-xl font-semibold text-white">Confirmed financial record</h2><div className="mt-4 grid gap-3 md:grid-cols-3"><div>Total invested: ${financials.totalInvested.toFixed(2)}</div><div>Sold price: ${financials.soldPrice.toFixed(2)}</div><div>Actual payout: ${financials.payout.toFixed(2)}</div><div>Marketplace deductions: ${financials.deductions.toFixed(2)}</div><div>Confirmed profit: ${financials.netProfit.toFixed(2)}</div><div>ROI: {financials.roi?.toFixed(2)}% · Margin: {financials.margin?.toFixed(2)}%</div></div></div>; })() : (() => { const projection = projectedBuildFinancials(draft); return <div className="rounded-[28px] border border-amber-400/20 bg-amber-500/10 p-6 text-sm text-amber-100"><h2 className="text-xl font-semibold text-white">Projected financial record</h2><div className="mt-3">Total invested: ${draft.buildCost.toFixed(2)} · Expected sale: {draft.expectedSale ?? draft.estimatedResale ?? "Not entered"}</div><div className="mt-2">Projected profit: {projection ? `$${projection.lowProfit.toFixed(2)} – $${projection.highProfit.toFixed(2)}` : "Not entered"}</div><div className="mt-2 text-amber-200">{projection?.incomplete ? "Incomplete Projection: missing selling expenses, repair costs, or required parts are not treated as confirmed." : "Projected only — not confirmed earnings."}</div></div>; })()}

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-full px-3 py-2 text-sm transition ${activeTab === tab ? "bg-sky-500/15 text-sky-200" : "border border-white/10 bg-white/5 text-zinc-400"}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm uppercase tracking-[0.24em] text-sky-300">Build details</div>
            <div className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-sm text-amber-200">{draft.status}</div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Build name</div>
              <input value={draft.name} onChange={(event) => setDraft((prev: typeof draft) => ({ ...prev, name: event.target.value }))} className="mt-2 w-full bg-transparent text-white outline-none" />
            </label>
            <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Status</div>
              <input value={draft.status} onChange={(event) => setDraft((prev: typeof draft) => ({ ...prev, status: event.target.value as typeof draft.status }))} className="mt-2 w-full bg-transparent text-white outline-none" />
            </label>
            <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Build ID</div>
              <input value={draft.id} onChange={(event) => setDraft((prev: typeof draft) => ({ ...prev, id: event.target.value }))} className="mt-2 w-full bg-transparent text-white outline-none" />
            </label>
            <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Start date</div>
              <input value={draft.startDate ?? ""} onChange={(event) => setDraft((prev: typeof draft) => ({ ...prev, startDate: event.target.value }))} className="mt-2 w-full bg-transparent text-white outline-none" />
            </label>
            <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Completion date</div>
              <input value={draft.completionDate ?? ""} onChange={(event) => setDraft((prev: typeof draft) => ({ ...prev, completionDate: event.target.value }))} className="mt-2 w-full bg-transparent text-white outline-none" />
            </label>
            <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Listing date</div>
              <input value={draft.listingDate ?? ""} onChange={(event) => setDraft((prev: typeof draft) => ({ ...prev, listingDate: event.target.value }))} className="mt-2 w-full bg-transparent text-white outline-none" />
            </label>
            <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Sale date</div>
              <input value={draft.saleDate ?? ""} onChange={(event) => setDraft((prev: typeof draft) => ({ ...prev, saleDate: event.target.value }))} className="mt-2 w-full bg-transparent text-white outline-none" />
            </label>
            <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Last updated</div>
              <input value={draft.lastUpdated ?? ""} onChange={(event) => setDraft((prev: typeof draft) => ({ ...prev, lastUpdated: event.target.value }))} className="mt-2 w-full bg-transparent text-white outline-none" />
            </label>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Days active</div>
              <div className="mt-2 text-white">{computeDays(draft.startDate, draft.completionDate ?? undefined)}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Days listed</div>
              <div className="mt-2 text-white">{computeDays(draft.listingDate, draft.saleDate ?? undefined)}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Days until sold</div>
              <div className="mt-2 text-white">{daysUntilSold}</div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
          <div className="text-xl font-semibold text-white">Quick summary</div>
          <div className="mt-4 space-y-3 text-sm text-zinc-400">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">Build cost: ${draft.buildCost.toFixed(2)}</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">CPU: {draft.cpu ?? "Not entered."}</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">GPU: {draft.gpu ?? "Not entered."}</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">Motherboard: {draft.motherboard ?? "Not entered."}</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">Inventory note: {draft.partsNeeded?.[0]?.name ?? "No missing parts recorded."}</div>
          </div>
        </div>
      </div>

      <BuildHealthCard build={draft} tasks={tasks} testing={testingResults[draft.id]} />

      <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
        <div className="text-xl font-semibold text-white">{activeTab}</div>
        {activeTab === "Overview" ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Hardware</div>
              <div className="mt-3 space-y-2">
                {[
                  ["CPU", draft.cpu ?? "Not entered"],
                  ["GPU", draft.gpu ?? "Not entered"],
                  ["Motherboard", draft.motherboard ?? "Not entered"],
                  ["RAM", draft.ram ?? "Not entered"],
                  ["Storage", draft.storage ?? "Not entered"],
                  ["PSU", draft.psu ?? "Not entered"],
                ].map(([label, value]) => <div key={label} className="flex justify-between gap-4 rounded-xl border border-white/10 px-3 py-2"><span className="text-zinc-500">{label}</span><span className="text-white">{value}</span></div>)}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Financial</div>
              <div className="mt-3 space-y-2">
                {[
                  ["Purchase cost", `$${draft.buildCost.toFixed(2)}`],
                  ["Listing price", draft.listingPrice ? `$${draft.listingPrice.toFixed(2)}` : "Not entered"],
                  ["Marketplace", draft.marketplace ?? "Not entered"],
                  ["Net profit", draft.netProfit ? `$${draft.netProfit.toFixed(2)}` : "Not entered"],
                  ["ROI", draft.profitBreakdown?.roi ?? "Not entered"],
                  ["Profit margin", draft.profitBreakdown?.profitMargin ?? "Not entered"],
                ].map(([label, value]) => <div key={label} className="flex justify-between gap-4 rounded-xl border border-white/10 px-3 py-2"><span className="text-zinc-500">{label}</span><span className="text-white">{value}</span></div>)}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "Parts" ? (
          <div className="mt-4 grid gap-3">
            {(draft.parts ?? []).map((part) => (
              <div key={part.name} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-white">{part.name}</div>
                  <div className="rounded-full border border-white/10 px-3 py-1 text-xs">{part.type}</div>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <div>Condition: {part.condition}</div>
                  <div>Serial number: {part.serialNumber ?? "Not entered"}</div>
                  <div>Seller: {part.seller ?? "Not entered"}</div>
                  <div>Purchase date: {part.purchaseDate ?? "Not entered"}</div>
                  <div>Warranty: {part.warranty ?? "Not entered"}</div>
                  <div>Current location: {part.currentLocation ?? "Not entered"}</div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === "Expenses" ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[
              ["Build cost", `$${draft.buildCost.toFixed(2)}`],
              ["Purchase cost", draft.profitBreakdown?.buildCost ? `$${draft.profitBreakdown.buildCost.toFixed(2)}` : "Not entered"],
              ["Marketplace fees", draft.profitBreakdown?.marketplaceFees ? `$${draft.profitBreakdown.marketplaceFees.toFixed(2)}` : "Not entered"],
              ["Shipping", draft.profitBreakdown?.shipping ? `$${draft.profitBreakdown.shipping.toFixed(2)}` : "Not entered"],
              ["Taxes", draft.profitBreakdown?.taxes ? `$${draft.profitBreakdown.taxes.toFixed(2)}` : "Not entered"],
            ].map(([label, value]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300"><div className="text-xs uppercase tracking-[0.24em] text-zinc-500">{label}</div><div className="mt-2 text-white">{value}</div></div>)}
          </div>
        ) : null}

        {activeTab === "Testing" ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
            <div>Benchmarking status: {draft.benchmarking?.status ?? "Not entered"}</div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <div>Cinebench: {draft.benchmarking?.cinebench ?? "Not entered"}</div>
              <div>3DMark: {draft.benchmarking?.threeDMark ?? "Not entered"}</div>
              <div>CrystalDiskMark: {draft.benchmarking?.crystalDiskMark ?? "Not entered"}</div>
              <div>CPU idle: {draft.benchmarking?.cpuIdleTemp ?? "Not entered"}</div>
              <div>CPU load: {draft.benchmarking?.cpuLoadTemp ?? "Not entered"}</div>
              <div>GPU idle: {draft.benchmarking?.gpuIdleTemp ?? "Not entered"}</div>
              <div>GPU load: {draft.benchmarking?.gpuLoadTemp ?? "Not entered"}</div>
              <div className="md:col-span-2">Notes: {draft.benchmarking?.notes ?? "Not entered"}</div>
            </div>
          </div>
        ) : null}

        {activeTab === "Photos" ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {Object.entries(draft.photos ?? {}).map(([key, value]) => (
              <div key={key} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
                <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">{key}</div>
                <div className="mt-3 rounded-2xl border border-dashed border-white/10 p-6 text-center text-zinc-500">{value ?? "Placeholder"}</div>
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === "Listing" ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Listing details</div>
              <div className="mt-3 space-y-2">
                <div>Listing price: {draft.listingPrice ? `$${draft.listingPrice.toFixed(2)}` : "Not entered"}</div>
                <div>Accepted offer: {draft.acceptedOffer ?? "Not entered"}</div>
                <div>Marketplace: {draft.marketplace ?? "Not entered"}</div>
                <div>Listing date: {draft.listingDate ?? "Not entered"}</div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Notes</div>
              <textarea value={draft.notes ?? ""} onChange={(event) => setDraft((prev: typeof draft) => ({ ...prev, notes: event.target.value }))} className="mt-3 min-h-32 w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-white outline-none" />
            </div>
          </div>
        ) : null}

        {activeTab === "Sale" ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Sale details</div>
              <div className="mt-3 space-y-2">
                <div>Sale date: {draft.saleDate ?? "Not entered"}</div>
                <div>Marketplace: {draft.profitBreakdown?.marketplace ?? "Not entered"}</div>
                <div>Sale price: {draft.profitBreakdown?.salePrice ? `$${draft.profitBreakdown.salePrice.toFixed(2)}` : "Not entered"}</div>
                <div>Payout: {draft.profitBreakdown?.payout ? `$${draft.profitBreakdown.payout.toFixed(2)}` : "Not entered"}</div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Profit</div>
              <div className="mt-3 space-y-2">
                <div>Net profit: {draft.profitBreakdown?.netProfit ? `$${draft.profitBreakdown.netProfit.toFixed(2)}` : "Not entered"}</div>
                <div>ROI: {draft.profitBreakdown?.roi ?? "Not entered"}</div>
                <div>Profit margin: {draft.profitBreakdown?.profitMargin ?? "Not entered"}</div>
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "Notes" ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
            <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Editable notes</div>
            <textarea value={draft.notes ?? ""} onChange={(event) => setDraft((prev: typeof draft) => ({ ...prev, notes: event.target.value }))} className="mt-3 min-h-40 w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-white outline-none" />
          </div>
        ) : null}

        {activeTab === "Timeline" ? (
          <div className="mt-4 space-y-2">
            {(draft.timeline ?? []).map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
                <span>{item.label}</span>
                <span className="text-white">{item.completed ? "Completed" : "Pending"}</span>
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === "Profit" ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Profit breakdown</div>
              <div className="mt-3 space-y-2">
                <div>Sale price: {draft.profitBreakdown?.salePrice ? `$${draft.profitBreakdown.salePrice.toFixed(2)}` : "Not entered"}</div>
                <div>Marketplace fees: {draft.profitBreakdown?.marketplaceFees ? `$${draft.profitBreakdown.marketplaceFees.toFixed(2)}` : "Not entered"}</div>
                <div>Shipping: {draft.profitBreakdown?.shipping ? `$${draft.profitBreakdown.shipping.toFixed(2)}` : "Not entered"}</div>
                <div>Taxes: {draft.profitBreakdown?.taxes ? `$${draft.profitBreakdown.taxes.toFixed(2)}` : "Not entered"}</div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Summary</div>
              <div className="mt-3 space-y-2">
                <div>Payout: {draft.profitBreakdown?.payout ? `$${draft.profitBreakdown.payout.toFixed(2)}` : "Not entered"}</div>
                <div>Net profit: {draft.profitBreakdown?.netProfit ? `$${draft.profitBreakdown.netProfit.toFixed(2)}` : "Not entered"}</div>
                <div>ROI: {draft.profitBreakdown?.roi ?? "Not entered"}</div>
                <div>Profit margin: {draft.profitBreakdown?.profitMargin ?? "Not entered"}</div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-[24px] border border-white/10 bg-slate-950/40 p-4 text-sm text-zinc-400">
        {saveMessage ? <div className="mb-2 font-medium text-emerald-300">{saveMessage}</div> : null}
        <div className="font-medium text-white">Current status</div>
        <div className="mt-2">Estimated values are clearly labeled as estimates until final sale details are recorded.</div>
        <div className="mt-2"><Link href="/builds" className="text-sky-300">Back to builds</Link></div>
      </div>
      <ConfirmDialog open={deleting} title={draft.status === "Sold" ? "Delete sold build?" : "Delete build?"} description={draft.status === "Sold" ? "This sold build contains financial history. Delete only if you are certain you no longer need that record." : "This removes the build and its linked tasks from this browser."} confirmLabel="Delete Build" danger onCancel={() => setDeleting(false)} onConfirm={() => { dealixStore.deleteBuild(draft.id); window.location.assign("/builds"); }} />
    </div>
  );
}
