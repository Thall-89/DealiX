'use client';

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import Link from "next/link";
import { dealixStore, useDealiXData } from "@/lib/store";
import { InventoryForm } from "@/components/InventoryForm";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const categories = ["All", "GPU", "PSU", "Memory", "Storage", "Case"] as const;
const statuses = ["All", "Available", "Assigned to Build", "Needs Testing", "Listed Separately", "Sold"] as const;

type Category = (typeof categories)[number];
type StatusFilter = (typeof statuses)[number];

export default function InventoryPage() {
  const snapshot = useDealiXData();
  const { inventory } = snapshot;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("All");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("");

  const visibleItems = useMemo(() => {
    return inventory.filter((item) => {
      const matchesQuery = `${item.name} ${item.brandModel} ${item.storageLocation}`.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "All" || item.category === category;
      const matchesStatus = status === "All" || item.currentStatus === status;
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [category, inventory, query, status]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Mock inventory"
        title="Inventory"
        description="Track PC components and parts. This page uses mock inventory until real data is entered."
        action={<button onClick={() => setAdding(true)} className="rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-400">Add Part</button>}
      />

      {adding ? <InventoryForm builds={snapshot.builds} onSave={(item) => { dealixStore.addInventory(item); setAdding(false); setSaveMessage(`${item.name} was added and is now available everywhere in DealiX.`); }} onCancel={() => setAdding(false)} /> : null}
      {saveMessage ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{saveMessage}</div> : null}

      <div className="rounded-[28px] border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-200">
        <div className="font-semibold">Important note</div>
        <div className="mt-1 text-amber-300/90">The RTX 3070 current location still needs confirmation. A physical part cannot be assigned to two builds at the same time.</div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Parts" value={`${inventory.length}`} hint="Saved entries" icon="📦" />
        <StatCard label="Available Parts" value={`${inventory.filter((item) => item.currentStatus === "Available").length}`} hint="Ready for use" icon="✅" accent="sky" />
        <StatCard label="Needs Testing" value={`${inventory.filter((item) => item.testingStatus === "Needs Testing").length}`} hint="Requires review" icon="🧪" accent="purple" />
        <StatCard label="Recorded Purchase Cost" value={`$${inventory.reduce((sum, item) => sum + item.purchaseCost, 0).toFixed(2)}`} hint="Purchase history" icon="💳" />
      </section>

      <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-4 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search parts"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 lg:max-w-md"
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <button key={item} onClick={() => setCategory(item)} className={`rounded-full px-3 py-2 text-sm transition ${category === item ? "bg-sky-500/15 text-sky-200" : "border border-white/10 bg-white/5 text-zinc-400"}`}>
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {statuses.map((item) => (
            <button key={item} onClick={() => setStatus(item)} className={`rounded-full px-3 py-2 text-sm transition ${status === item ? "bg-sky-500/15 text-sky-200" : "border border-white/10 bg-white/5 text-zinc-400"}`}>
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/40 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-zinc-300">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-[0.24em] text-zinc-500">
              <tr>
                <th className="px-4 py-3">Part name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Purchase cost</th>
                <th className="px-4 py-3">Condition</th>
                <th className="px-4 py-3">Testing status</th>
                <th className="px-4 py-3">Current status</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((item) => (
                <tr key={item.id} className="border-b border-white/5 last:border-none">
                  <td className="px-4 py-4">
                    <Link href={`/inventory/${item.slug}`} className="font-medium text-white hover:text-sky-200">{item.name}</Link>
                    <div className="mt-1 text-xs text-zinc-500">{item.brandModel}</div>
                  </td>
                  <td className="px-4 py-4">{item.category}</td>
                  <td className="px-4 py-4">${item.purchaseCost.toFixed(2)}</td>
                  <td className="px-4 py-4">{item.condition}</td>
                  <td className="px-4 py-4"><StatusBadge status={item.testingStatus}>{item.testingStatus}</StatusBadge></td>
                  <td className="px-4 py-4"><StatusBadge status={item.currentStatus}>{item.currentStatus}</StatusBadge></td>
                  <td className="px-4 py-4">{item.storageLocation}</td>
                  <td className="px-4 py-4"><button onClick={() => setDeletingId(item.id)} className="text-xs text-rose-200">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {visibleItems.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-white/15 bg-white/5 p-8 text-center text-zinc-400">No parts match the current filters yet.</div>
      ) : null}
      {(() => { const item = inventory.find((entry) => entry.id === deletingId); return <ConfirmDialog open={Boolean(item)} title="Delete inventory part?" description="This removes the part record from this browser. It does not alter a build's recorded financial history." confirmLabel="Delete Part" danger onCancel={() => setDeletingId(null)} onConfirm={() => { if (item) { dealixStore.deleteInventory(item.id); setSaveMessage(`${item.name} was deleted.`); } setDeletingId(null); }} />; })()}
    </div>
  );
}
