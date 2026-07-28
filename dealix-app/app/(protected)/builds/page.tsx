'use client';

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { useDealiXData } from "@/lib/store";
import { dealixStore } from "@/lib/store";
import { BuildForm } from "@/components/BuildForm";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { BuildHealthCard } from "@/components/BuildHealthCard";

const filters = ["All", "Active", "Listed", "Sold"] as const;

type Filter = (typeof filters)[number];

export default function BuildsPage() {
  const { builds, tasks, testingResults } = useDealiXData();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const visibleBuilds = useMemo(() => {
    return builds.filter((build) => {
      if (Boolean(build.archivedAt) !== showArchived) return false;
      const matchesFilter = filter === "All" || build.status === filter;
      const matchesQuery = `${build.name} ${build.cpu ?? ""} ${build.gpu ?? ""}`.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [builds, filter, query, showArchived]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Build command center"
        title="Builds"
        description="Track the historical builds, current progress, and missing parts for your active projects."
        action={<button onClick={() => setAdding(true)} className="rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-400">Add Build</button>}
      />

      {adding ? <BuildForm onSave={(build) => { dealixStore.addBuild(build); setAdding(false); setSaveMessage(`${build.name} was added and is now visible across DealiX.`); }} onCancel={() => setAdding(false)} /> : null}
      {saveMessage ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{saveMessage}</div> : null}

      <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-4 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search builds"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-0 placeholder:text-zinc-500 lg:max-w-md"
          />
          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-full px-3 py-2 text-sm transition ${filter === item ? "bg-sky-500/15 text-sky-200" : "border border-white/10 bg-white/5 text-zinc-400"}`}
              >
                {item}
              </button>
            ))}
            <button onClick={() => setShowArchived((value) => !value)} className={`rounded-full px-3 py-2 text-sm transition ${showArchived ? "bg-amber-500/15 text-amber-200" : "border border-white/10 bg-white/5 text-zinc-400"}`}>{showArchived ? "Viewing archived" : "Archived"}</button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {visibleBuilds.map((build) => (
          <div key={build.id} className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold text-white">{build.name}</h2>
                  <StatusBadge status={build.status} />
                  {build.favorite ? <span className="rounded-full border border-amber-300/30 bg-amber-400/10 px-2 py-1 text-xs text-amber-100">Favorite</span> : null}
                  {build.finalizedAt ? <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-100">Finalized</span> : null}
                </div>
                <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
                  <div className="grid gap-2 md:grid-cols-2">
                    <div>Build cost: ${build.buildCost.toFixed(2)}</div>
                    {build.status === "Sold" ? <div>Confirmed sale: ${build.salePrice?.toFixed(2) ?? "0.00"}</div> : null}
                    {build.status === "Active" ? <div>Estimated resale: {build.estimatedResale}</div> : null}
                    {build.status === "Listed" ? <div>Listing price: ${build.listingPrice?.toFixed(2) ?? "0.00"}</div> : null}
                    {build.status === "Sold" ? <div>Mercari payout: ${build.mercariPayout?.toFixed(2) ?? "0.00"}</div> : null}
                    {build.status === "Active" ? <div>Projected profit: {build.projectedProfit}</div> : null}
                    {build.status === "Listed" ? <div>Projected profit: {build.projectedProfit}</div> : null}
                  </div>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-zinc-400 md:grid-cols-2">
                  <div>CPU: {build.cpu}</div>
                  <div>GPU: {build.gpu}</div>
                  <div>RAM: {build.ram}</div>
                  <div>Storage: {build.storage}</div>
                  {build.psu ? <div>PSU: {build.psu}</div> : null}
                  {build.motherboard ? <div>Motherboard: {build.motherboard}</div> : null}
                  {build.case ? <div>Case: {build.case}</div> : null}
                  {build.os ? <div>OS: {build.os}</div> : null}
                </div>
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-400">
                  <div className="font-medium text-zinc-200">Work completed</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {build.workCompleted?.map((item) => (
                      <span key={item} className="rounded-full border border-white/10 px-2.5 py-1 text-xs">{item}</span>
                    ))}
                  </div>
                </div>
                {build.partsNeeded?.length ? (
                  <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-200">
                    <div className="font-semibold">Parts needed</div>
                    <div className="mt-2">{build.partsNeeded[0].name} • {build.partsNeeded[0].priority} priority • {build.partsNeeded[0].status}</div>
                  </div>
                ) : null}
                <div className="mt-4"><BuildHealthCard build={build} tasks={tasks} testing={testingResults[build.id]} compact /></div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/builds/${build.slug}`} className="rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:border-sky-400/30 hover:text-sky-200">View Details</Link>
                <Link href={`/builds/${build.slug}`} className="rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:border-sky-400/30 hover:text-sky-200">Edit</Link>
                <button onClick={() => { dealixStore.toggleBuildFavorite(build.id); setSaveMessage(`${build.name} ${build.favorite ? "removed from" : "added to"} favorites.`); }} className="rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-300">{build.favorite ? "Unfavorite" : "Favorite"}</button>
                <button onClick={() => { dealixStore.cloneBuild(build.id); setSaveMessage(`${build.name} was cloned as a new planning build.`); }} className="rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-300">Clone</button>
                {!showArchived ? <><button onClick={() => { dealixStore.finalizeBuild(build.id); setSaveMessage(`${build.name} was finalized. You can still edit it later.`); }} className="rounded-full border border-emerald-400/20 px-3 py-2 text-sm text-emerald-200">Finalize</button><button onClick={() => { dealixStore.archiveBuild(build.id); setSaveMessage(`${build.name} archived.`); }} className="rounded-full border border-amber-400/20 px-3 py-2 text-sm text-amber-200">Archive</button></> : <button onClick={() => { dealixStore.restoreBuild(build.id); setSaveMessage(`${build.name} restored.`); }} className="rounded-full border border-emerald-400/20 px-3 py-2 text-sm text-emerald-200">Restore</button>}
                <button onClick={() => setDeletingId(build.id)} className="rounded-full border border-rose-400/20 px-3 py-2 text-sm text-rose-200">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {visibleBuilds.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-white/15 bg-white/5 p-8 text-center text-zinc-400">
          No builds match this search yet.
        </div>
      ) : null}
      {(() => { const build = builds.find((item) => item.id === deletingId); return <ConfirmDialog open={Boolean(build)} title={build?.status === "Sold" ? "Delete sold build?" : "Delete build?"} description={build?.status === "Sold" ? "This build has financial history. Deleting it removes its saved record and its linked tasks. This cannot be undone." : "This removes the saved build and its linked tasks from this browser."} confirmLabel="Delete Build" danger onCancel={() => setDeletingId(null)} onConfirm={() => { if (build) { dealixStore.deleteBuild(build.id); setSaveMessage(`${build.name} was deleted.`); } setDeletingId(null); }} />; })()}
    </div>
  );
}
