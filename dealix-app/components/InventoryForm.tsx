"use client";

import { useEffect, useState } from "react";
import type { Build, InventoryItem } from "@/types";

interface InventoryFormProps { builds: Build[]; initial?: InventoryItem; onSave: (item: InventoryItem) => void; onCancel: () => void; }

const categories = ["CPU", "GPU", "Motherboard", "Memory", "Storage", "PSU", "Cooling", "Case", "Operating System", "Accessory", "Other"];
const conditions = ["New", "Like New", "Excellent", "Good", "Fair", "Poor"];
const testingStatuses = ["Untested", "Needs Testing", "Passed", "Failed"];
const currentStatuses = ["Available", "Assigned to Build", "Installed in Personal PC", "Needs Testing", "In Repair", "Listed Separately", "Sold"];
const availabilityOptions = ["Available", "Unavailable", "Restricted", "Unknown"];

function blankPart(): InventoryItem {
  const id = `part-${crypto.randomUUID()}`;
  return { id, slug: id, name: "", category: "GPU", brandModel: "", purchaseCost: 0, estimatedResaleValue: undefined, quantity: 1, condition: "Good", testingStatus: "Needs Testing", currentStatus: "Available", availability: "Available", storageLocation: "", notes: "" };
}

export function InventoryForm({ builds, initial, onSave, onCancel }: InventoryFormProps) {
  const [draft, setDraft] = useState<InventoryItem>(() => structuredClone(initial ?? blankPart()));
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const update = <K extends keyof InventoryItem>(key: K, value: InventoryItem[K]) => { setDraft((current) => ({ ...current, [key]: value })); setDirty(true); };

  useEffect(() => { const warn = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); }; window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn); }, [dirty]);
  const cancel = () => { if (!dirty || window.confirm("Discard unsaved inventory changes?")) onCancel(); };
  const save = () => {
    if (!draft.name.trim() || !draft.brandModel.trim()) { setError("Part name and brand/model are required."); return; }
    onSave({ ...draft, name: draft.name.trim(), brandModel: draft.brandModel.trim(), slug: draft.slug === draft.id ? draft.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || draft.id : draft.slug });
  };

  const textFields: Array<[string, keyof InventoryItem, "text" | "date"]> = [["Part name", "name", "text"], ["Brand / model", "brandModel", "text"], ["Storage location", "storageLocation", "text"], ["Serial number", "serialNumber", "text"], ["Seller", "seller", "text"], ["Purchase date", "purchaseDate", "date"], ["Warranty", "warranty", "text"]];
  return <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-6 shadow-[0_20px_60px_rgba(2,12,27,0.34)]"><div className="grid gap-3 md:grid-cols-2">
    {textFields.map(([label, key, type]) => <label key={String(key)} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300"><span className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</span><input type={type} value={String(draft[key] ?? "")} onChange={(event) => update(key, event.target.value as never)} className="mt-2 w-full bg-transparent text-white outline-none" /></label>)}
    <Select label="Category" value={draft.category} options={categories} onChange={(value) => update("category", value)} />
    <Select label="Condition" value={draft.condition} options={conditions} onChange={(value) => update("condition", value)} />
    <Select label="Testing status" value={draft.testingStatus} options={testingStatuses} onChange={(value) => update("testingStatus", value)} />
    <Select label="Current status" value={draft.currentStatus} options={currentStatuses} onChange={(value) => update("currentStatus", value)} />
    <Select label="Availability" value={draft.availability ?? "Available"} options={availabilityOptions} onChange={(value) => update("availability", value as InventoryItem["availability"])} />
    <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300"><span className="text-xs uppercase tracking-[0.18em] text-zinc-500">Purchase cost</span><input type="number" min="0" step="0.01" value={draft.purchaseCost} onChange={(event) => update("purchaseCost", Number(event.target.value))} className="mt-2 w-full bg-transparent text-white outline-none" /></label>
    <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300"><span className="text-xs uppercase tracking-[0.18em] text-zinc-500">Current value</span><input type="number" min="0" step="0.01" value={draft.estimatedResaleValue ?? ""} onChange={(event) => update("estimatedResaleValue", event.target.value === "" ? undefined : Number(event.target.value))} className="mt-2 w-full bg-transparent text-white outline-none" placeholder="Optional" /></label>
    <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300"><span className="text-xs uppercase tracking-[0.18em] text-zinc-500">Quantity</span><input type="number" min="0" step="1" value={draft.quantity ?? 1} onChange={(event) => update("quantity", Math.max(0, Number(event.target.value)))} className="mt-2 w-full bg-transparent text-white outline-none" /></label>
    <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300"><span className="text-xs uppercase tracking-[0.18em] text-zinc-500">Receipt reference</span><input value={draft.receiptReference ?? ""} onChange={(event) => update("receiptReference", event.target.value)} className="mt-2 w-full bg-transparent text-white outline-none" placeholder="Receipt number or saved file name" /></label>
    <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300"><span className="text-xs uppercase tracking-[0.18em] text-zinc-500">Assigned build</span><select value={draft.assignedBuild ?? ""} onChange={(event) => update("assignedBuild", event.target.value || undefined)} className="mt-2 w-full bg-transparent text-white outline-none"><option value="" className="bg-slate-900">Unassigned</option>{builds.map((build) => <option key={build.id} value={build.name} className="bg-slate-900">{build.name}</option>)}</select></label>
  </div><label className="mt-3 block rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300"><span className="text-xs uppercase tracking-[0.18em] text-zinc-500">Notes</span><textarea value={draft.notes ?? ""} onChange={(event) => update("notes", event.target.value)} className="mt-2 min-h-24 w-full bg-transparent text-white outline-none" /></label><div className="mt-5 flex flex-wrap items-center gap-3"><button type="button" onClick={save} className="rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white">Save Part</button><button type="button" onClick={cancel} className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300">Cancel</button>{dirty ? <span className="text-sm text-amber-300">Unsaved changes</span> : null}{error ? <span role="alert" className="text-sm text-rose-300">{error}</span> : null}</div></div>;
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300"><span className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full bg-transparent text-white outline-none">{options.map((option) => <option key={option} className="bg-slate-900">{option}</option>)}</select></label>;
}
