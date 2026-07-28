'use client';

import Link from "next/link";
import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { InventoryForm } from "@/components/InventoryForm";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { inventoryInsights } from "@/lib/inventoryIntelligence";
import { dealixStore, useDealiXData } from "@/lib/store";

type SortKey = "name" | "cost" | "value" | "quantity" | "updated";

export default function InventoryPage() {
  const snapshot = useDealiXData();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState<SortKey>("name");
  const [showArchived, setShowArchived] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [confirm, setConfirm] = useState<"delete" | "archive" | null>(null);
  const [message, setMessage] = useState("");
  const categories = ["All", ...Array.from(new Set(snapshot.inventory.map((item) => item.category))).sort()];
  const statuses = ["All", ...Array.from(new Set(snapshot.inventory.map((item) => item.currentStatus))).sort()];
  const activeInventory = snapshot.inventory.filter((item) => Boolean(item.archivedAt) === showArchived);

  const items = useMemo(() => activeInventory.filter((item) => {
    const haystack = `${item.name} ${item.brandModel} ${item.storageLocation} ${item.serialNumber ?? ""}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (category === "All" || item.category === category) && (status === "All" || item.currentStatus === status);
  }).sort((a, b) => {
    if (sort === "cost") return b.purchaseCost - a.purchaseCost;
    if (sort === "value") return (b.estimatedResaleValue ?? -1) - (a.estimatedResaleValue ?? -1);
    if (sort === "quantity") return (a.quantity ?? 1) - (b.quantity ?? 1);
    if (sort === "updated") return (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "");
    return a.name.localeCompare(b.name);
  }), [activeInventory, category, query, sort, status]);
  const lowStock = activeInventory.filter((item) => (item.quantity ?? 1) <= 1 && item.currentStatus === "Available");
  const toggle = (id: string) => setSelected((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  const clearSelection = () => setSelected([]);
  const bulkStatus = (next: string) => { dealixStore.bulkUpdateInventory(selected, { currentStatus: next }); setMessage(`${selected.length} part${selected.length === 1 ? " was" : "s were"} updated.`); clearSelection(); };
  const archiveSelection = () => { dealixStore.archiveInventory(selected); setMessage(`${selected.length} part${selected.length === 1 ? " was" : "s were"} archived.`); clearSelection(); };
  const deleteSelection = () => { selected.forEach((id) => dealixStore.deleteInventory(id)); setMessage(`${selected.length} part${selected.length === 1 ? " was" : "s were"} deleted.`); clearSelection(); };

  return <div className="space-y-6">
    <PageHeader eyebrow="Inventory intelligence" title="Inventory" description="Track every part's cost, value, condition, location, quantity, and build assignment in one workspace." action={<button onClick={() => setAdding(true)} className="rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-sky-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300">Add part</button>} />
    {adding ? <InventoryForm builds={snapshot.builds.filter((build) => !build.archivedAt)} onSave={(item) => { dealixStore.addInventory(item); setAdding(false); setMessage(`${item.name} was added to inventory.`); }} onCancel={() => setAdding(false)} /> : null}
    {message ? <p role="status" className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</p> : null}

    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Active parts" value={String(activeInventory.length)} hint="Saved inventory records" icon="□" />
      <StatCard label="Ready to use" value={String(activeInventory.filter((item) => item.currentStatus === "Available" && item.availability === "Available").length)} hint="Available for a build" icon="✓" accent="sky" />
      <StatCard label="Low stock" value={String(lowStock.length)} hint="Available items at quantity 1" icon="!" accent="purple" />
      <StatCard label="Recorded value" value={`$${activeInventory.reduce((total, item) => total + (item.estimatedResaleValue ?? 0), 0).toFixed(2)}`} hint="Only entered current values" icon="$" />
    </section>
    {lowStock.length ? <div className="rounded-[24px] border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100"><span className="font-semibold">Low-stock attention:</span> {lowStock.map((item) => item.name).join(", ")}. These are your last available units—reserve them deliberately.</div> : null}
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{inventoryInsights(activeInventory).map((insight) => <div key={insight.title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><p className="text-sm font-medium text-white">{insight.title}</p><p className="mt-1 text-xs leading-5 text-zinc-400">{insight.detail}</p></div>)}</section>

    <section className="rounded-[28px] border border-white/10 bg-slate-950/40 p-4 shadow-[0_20px_60px_rgba(2,12,27,0.28)]">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_repeat(3,auto)]"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, model, location, or serial number" className="min-w-0 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/50" /><Select value={category} onChange={setCategory} options={categories} label="Category" /><Select value={status} onChange={setStatus} options={statuses} label="Status" /><Select value={sort} onChange={(value) => setSort(value as SortKey)} options={["name", "cost", "value", "quantity", "updated"]} label="Sort" /></div>
      <div className="mt-3 flex flex-wrap items-center gap-2"><button onClick={() => { setShowArchived((value) => !value); clearSelection(); }} className={`rounded-full border px-3 py-2 text-xs ${showArchived ? "border-amber-300/30 bg-amber-400/10 text-amber-100" : "border-white/10 text-zinc-400 hover:bg-white/5"}`}>{showArchived ? "Viewing archived" : "View archived"}</button>{selected.length ? <><span className="text-xs text-zinc-400">{selected.length} selected</span><button onClick={() => bulkStatus("Needs Testing")} className="rounded-full border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5">Mark needs testing</button>{showArchived ? <button onClick={() => { dealixStore.restoreInventory(selected); setMessage("Selected parts restored."); clearSelection(); }} className="rounded-full border border-emerald-400/25 px-3 py-2 text-xs text-emerald-200">Restore</button> : <button onClick={() => setConfirm("archive")} className="rounded-full border border-amber-400/25 px-3 py-2 text-xs text-amber-100">Archive</button>}<button onClick={() => setConfirm("delete")} className="rounded-full border border-rose-400/25 px-3 py-2 text-xs text-rose-200">Delete</button></> : null}</div>
    </section>

    {items.length ? <section className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/40 shadow-[0_20px_60px_rgba(2,12,27,0.28)]"><div className="overflow-x-auto"><table className="min-w-[980px] w-full text-left text-sm text-zinc-300"><thead className="sticky top-0 border-b border-white/10 bg-slate-950/95 text-xs uppercase tracking-[0.14em] text-zinc-500"><tr><th className="px-4 py-3"><input aria-label="Select all visible parts" type="checkbox" checked={items.length > 0 && items.every((item) => selected.includes(item.id))} onChange={(event) => setSelected(event.target.checked ? items.map((item) => item.id) : [])} /></th><th className="px-4 py-3">Part</th><th className="px-4 py-3">Cost / value</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Location</th><th className="px-4 py-3">Assignment</th><th className="px-4 py-3">Action</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-b border-white/[0.06] transition hover:bg-white/[0.035]"><td className="px-4 py-4"><input aria-label={`Select ${item.name}`} type="checkbox" checked={selected.includes(item.id)} onChange={() => toggle(item.id)} /></td><td className="px-4 py-4"><Link href={`/inventory/${item.slug}`} className="font-medium text-white hover:text-sky-200">{item.name}</Link><p className="mt-1 text-xs text-zinc-500">{item.brandModel}{item.serialNumber ? ` · ${item.serialNumber}` : ""}</p></td><td className="px-4 py-4"><div>${item.purchaseCost.toFixed(2)}</div><div className="mt-1 text-xs text-zinc-500">{item.estimatedResaleValue === undefined ? "Value not entered" : `$${item.estimatedResaleValue.toFixed(2)} value`}</div></td><td className="px-4 py-4">{item.quantity ?? 1}</td><td className="px-4 py-4"><StatusBadge status={item.currentStatus}>{item.currentStatus}</StatusBadge></td><td className="px-4 py-4">{item.storageLocation || "Not entered"}</td><td className="px-4 py-4">{item.assignedBuild ?? "Unassigned"}</td><td className="px-4 py-4"><div className="flex gap-2"><Link href={`/inventory/${item.slug}`} className="text-xs text-sky-200 hover:text-sky-100">Open</Link>{showArchived ? <button onClick={() => { dealixStore.restoreInventory([item.id]); setMessage(`${item.name} restored.`); }} className="text-xs text-emerald-200">Restore</button> : <button onClick={() => { dealixStore.archiveInventory([item.id]); setMessage(`${item.name} archived.`); }} className="text-xs text-amber-100">Archive</button>}</div></td></tr>)}</tbody></table></div></section> : <section className="rounded-[28px] border border-dashed border-white/15 bg-white/[0.035] p-10 text-center"><h2 className="text-xl font-semibold text-white">{showArchived ? "No archived parts" : "No matching parts"}</h2><p className="mt-2 text-sm text-zinc-400">{showArchived ? "Archived parts can be restored whenever you need them again." : "Add a part or broaden your filters to keep the workspace complete."}</p>{!showArchived ? <button onClick={() => setAdding(true)} className="mt-5 rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white">Add part</button> : null}</section>}
    <ConfirmDialog open={confirm !== null} title={confirm === "delete" ? "Delete selected parts?" : "Archive selected parts?"} description={confirm === "delete" ? "This permanently removes the selected inventory records. This cannot be undone." : "Archived parts are hidden from active inventory and can be restored later."} confirmLabel={confirm === "delete" ? "Delete parts" : "Archive parts"} danger={confirm === "delete"} onCancel={() => setConfirm(null)} onConfirm={() => { if (confirm === "delete") deleteSelection(); else archiveSelection(); setConfirm(null); }} />
  </div>;
}

function Select({ value, onChange, options, label }: { value: string; onChange: (value: string) => void; options: string[]; label: string }) { return <label className="text-xs text-zinc-500"><span className="sr-only">{label}</span><select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-zinc-200 outline-none focus:border-sky-400/50">{options.map((option) => <option key={option} value={option} className="bg-slate-900">{option}</option>)}</select></label>; }
