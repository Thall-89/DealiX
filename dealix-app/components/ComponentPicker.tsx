"use client";

import { useEffect } from "react";
import type { ComponentSpecs } from "@/lib/componentCatalog";

export type PlannerPartSource = "Inventory" | "Recon" | "Marketplace" | "Catalog";
export type PlannerChoice = {
  id: string;
  name: string;
  source: PlannerPartSource;
  cost?: number;
  value?: number;
  note: string;
  compatibility: string;
  specs?: ComponentSpecs;
};

interface ComponentPickerProps {
  open: boolean;
  slot: string | null;
  choices: PlannerChoice[];
  selectedId?: string;
  onChoose: (choice: PlannerChoice) => void;
  onClose: () => void;
}

const money = (value?: number) => value === undefined ? "Not recorded" : `$${value.toFixed(2)}`;

export function ComponentPicker({ open, slot, choices, selectedId, onChoose, onClose }: ComponentPickerProps) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);

  if (!open || !slot) return null;
  const grouped = ["Inventory", "Recon", "Marketplace", "Catalog"].map((source) => ({ source, items: choices.filter((choice) => choice.source === source) })).filter((group) => group.items.length);
  return <div className="fixed inset-0 z-50 flex items-end bg-slate-950/75 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="component-picker-title" onMouseDown={onClose}>
    <section className="max-h-[88vh] w-full max-w-4xl overflow-hidden rounded-t-[28px] border border-white/10 bg-[#101827] shadow-[0_32px_100px_rgba(0,0,0,0.55)] sm:rounded-[28px]" onMouseDown={(event) => event.stopPropagation()}>
      <div className="flex items-start justify-between border-b border-white/10 px-5 py-5 sm:px-7"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">Component picker</p><h2 id="component-picker-title" className="mt-1 text-2xl font-semibold text-white">Choose a {slot}</h2><p className="mt-1 text-sm text-zinc-400">Owned parts appear first, then Recon opportunities, then connected marketplaces when they provide results.</p></div><button onClick={onClose} className="rounded-xl border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5">Close</button></div>
      <div className="max-h-[calc(88vh-130px)] overflow-y-auto p-5 sm:p-7">
        {grouped.length ? grouped.map(({ source, items }) => <div key={source} className="mb-7 last:mb-0"><div className="mb-3 flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${source === "Inventory" ? "bg-emerald-400" : source === "Recon" ? "bg-sky-400" : source === "Marketplace" ? "bg-violet-400" : "bg-amber-300"}`} /><h3 className="text-sm font-semibold text-white">{source === "Inventory" ? "Owned inventory" : source === "Recon" ? "Recon recommendations" : source === "Marketplace" ? "Best deals" : "Compatible catalog"}</h3><span className="text-xs text-zinc-500">{items.length}</span></div><div className="grid gap-3 md:grid-cols-2">{items.map((choice, index) => { const selected = choice.id === selectedId; const margin = choice.cost === undefined || choice.value === undefined ? undefined : choice.value - choice.cost; return <article key={choice.id} className={`rounded-2xl border p-4 transition ${selected ? "border-sky-400/55 bg-sky-400/10" : "border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.06]"}`}><div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2">{index === 0 && source !== "Catalog" ? <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-200">Best available</span> : null}{selected ? <span className="rounded-full bg-sky-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-200">Selected</span> : null}</div><h4 className="mt-2 font-medium text-white">{choice.name}</h4><p className="mt-1 text-xs text-zinc-500">{choice.note}</p></div><span className="rounded-full border border-white/10 px-2 py-1 text-[11px] text-zinc-300">{choice.source}</span></div><div className="mt-4 grid grid-cols-2 gap-2 text-xs"><Data label={choice.source === "Catalog" ? "Pricing" : "Cost"} value={choice.source === "Catalog" ? "No live price" : money(choice.cost)} /><Data label="Potential margin" value={margin === undefined ? "Needs market value" : money(margin)} /><Data label="Availability" value={choice.source === "Inventory" ? "Owned" : choice.source === "Catalog" ? "Specification only" : "Available"} /><Data label="Compatibility" value={choice.compatibility} /></div><button onClick={() => onChoose(choice)} className={`mt-4 w-full rounded-xl px-3 py-2.5 text-sm font-medium transition ${selected ? "border border-white/10 text-zinc-300 hover:bg-white/5" : "bg-sky-500 text-white hover:bg-sky-400"}`}>{selected ? "Keep selected" : choice.source === "Catalog" ? "Use as planned part" : "Use this part"}</button></article>; })}</div></div>) : <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.025] p-8 text-center"><p className="font-medium text-white">No compatible {slot} specifications yet</p><p className="mt-2 text-sm text-zinc-400">Add or verify the selected parts so DealiX can narrow the catalog safely.</p></div>}
      </div>
    </section>
  </div>;
}

function Data({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-black/15 p-2"><p className="text-[10px] uppercase tracking-[0.1em] text-zinc-500">{label}</p><p className="mt-1 truncate text-zinc-200" title={value}>{value}</p></div>; }
