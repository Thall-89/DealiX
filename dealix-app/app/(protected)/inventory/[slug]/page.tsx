'use client';

import { useMemo, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { InventoryForm } from "@/components/InventoryForm";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PartSaleForm } from "@/components/PartSaleForm";
import Link from "next/link";
import { dealixStore, useDealiXData } from "@/lib/store";

export default function InventoryDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const snapshot = useDealiXData();
  const { inventory } = snapshot;
  const item = useMemo(() => inventory.find((entry) => entry.slug === slug) ?? null, [inventory, slug]);
  const [draft, setDraft] = useState(() => item ?? inventory[0]!);
  const [saveMessage, setSaveMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [recordingSale, setRecordingSale] = useState(false);

  if (!item) {
    notFound();
  }

  const saveChanges = () => {
    dealixStore.updateInventory(draft);
    setSaveMessage("Saved everywhere in this browser.");
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Inventory details" title={item.name} description="Track serial number, warranty, assigned build, and testing history for this part." action={<button onClick={() => setEditing(true)} className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300">Edit Part</button>} />

      {editing ? <InventoryForm initial={draft} builds={snapshot.builds} onSave={(next) => { dealixStore.updateInventory(next); setDraft(next); setEditing(false); setSaveMessage("Part saved everywhere in this browser."); }} onCancel={() => setEditing(false)} /> : null}

      <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
        <div className="flex flex-wrap gap-2">
          <button onClick={saveChanges} className="rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white">Save</button>
          <button onClick={() => setDraft(item)} className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300">Discard Unsaved Changes</button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300"><div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Quantity</div><div className="mt-2 text-white">{draft.quantity ?? 1}</div></div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300"><div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Current value</div><div className="mt-2 text-white">{draft.estimatedResaleValue === undefined ? "Not entered" : `$${draft.estimatedResaleValue.toFixed(2)}`}</div></div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300"><div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Receipt reference</div><div className="mt-2 break-words text-white">{draft.receiptReference || "Not entered"}</div></div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
            <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Part name</div>
            <input value={draft.name} onChange={(event) => setDraft((prev: typeof draft) => ({ ...prev, name: event.target.value }))} className="mt-2 w-full bg-transparent text-white outline-none" />
          </label>
          <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
            <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Serial number</div>
            <input value={draft.serialNumber ?? ""} onChange={(event) => setDraft((prev: typeof draft) => ({ ...prev, serialNumber: event.target.value }))} className="mt-2 w-full bg-transparent text-white outline-none" />
          </label>
          <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
            <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Purchase price</div>
            <input value={draft.purchaseCost} onChange={(event) => setDraft((prev: typeof draft) => ({ ...prev, purchaseCost: Number(event.target.value) }))} className="mt-2 w-full bg-transparent text-white outline-none" />
          </label>
          <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
            <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Seller</div>
            <input value={draft.seller ?? ""} onChange={(event) => setDraft((prev: typeof draft) => ({ ...prev, seller: event.target.value }))} className="mt-2 w-full bg-transparent text-white outline-none" />
          </label>
          <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
            <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Purchase date</div>
            <input value={draft.purchaseDate ?? ""} onChange={(event) => setDraft((prev: typeof draft) => ({ ...prev, purchaseDate: event.target.value }))} className="mt-2 w-full bg-transparent text-white outline-none" />
          </label>
          <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
            <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Warranty</div>
            <input value={draft.warranty ?? ""} onChange={(event) => setDraft((prev: typeof draft) => ({ ...prev, warranty: event.target.value }))} className="mt-2 w-full bg-transparent text-white outline-none" />
          </label>
          <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
            <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Assigned build</div>
            <input value={draft.assignedBuild ?? ""} onChange={(event) => setDraft((prev: typeof draft) => ({ ...prev, assignedBuild: event.target.value }))} className="mt-2 w-full bg-transparent text-white outline-none" />
          </label>
          <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
            <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Current location</div>
            <input value={draft.storageLocation} onChange={(event) => setDraft((prev: typeof draft) => ({ ...prev, storageLocation: event.target.value }))} className="mt-2 w-full bg-transparent text-white outline-none" />
          </label>
        </div>
        <label className="mt-4 block rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
          <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Notes</div>
          <textarea value={draft.notes ?? ""} onChange={(event) => setDraft((prev: typeof draft) => ({ ...prev, notes: event.target.value }))} className="mt-2 min-h-24 w-full bg-transparent text-white outline-none" />
        </label>
        {saveMessage ? <div className="mt-4 text-sm font-medium text-emerald-300">{saveMessage}</div> : null}
      </div>
      {item.sourceTransactionId ? <div className="rounded-[24px] border border-sky-400/20 bg-sky-500/10 p-4 text-sm text-sky-100">Source transaction: <Link href={`/transactions/${item.sourceTransactionId}`} className="font-medium underline">View transaction and allocations</Link></div> : null}
      {item.sourceTransactionId && !item.partSale?.payoutConfirmed ? <><button onClick={() => setRecordingSale(true)} className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white">Record Sale</button>{recordingSale ? <PartSaleForm item={item} onClose={() => setRecordingSale(false)} /> : null}</> : null}
      {item.partSale?.payoutConfirmed ? <div className="rounded-[24px] border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">Confirmed part payout: ${(item.partSale.payout ?? 0).toFixed(2)}. This part is no longer available.</div> : null}
      <div className="flex justify-end"><button onClick={() => setDeleting(true)} className="rounded-full border border-rose-400/20 px-4 py-2 text-sm text-rose-200">Delete Part</button></div>
      <ConfirmDialog open={deleting} title="Delete inventory part?" description="This removes the saved part record from this browser." confirmLabel="Delete Part" danger onCancel={() => setDeleting(false)} onConfirm={() => { dealixStore.deleteInventory(draft.id); window.location.assign("/inventory"); }} />
    </div>
  );
}
