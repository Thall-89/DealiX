"use client";
import { dealixStore, useDealiXData } from "@/lib/store";
import type { SavedDealSearch } from "@/types";

const interests = [
  ["GPUs", [["RTX 30 Series", "GPU", "RTX 30", "RTX 30-series"], ["RTX 40 Series", "GPU", "RTX 40", "RTX 40-series"], ["RX 6000", "GPU", "RX 6000", "RX 6000-series"], ["RX 7000", "GPU", "RX 7000", "RX 7000-series"], ["Intel Arc", "GPU", "Intel Arc", "Intel Arc"]]],
  ["CPUs", [["Ryzen 5000", "CPU", "Ryzen 5000"], ["Ryzen 7000", "CPU", "Ryzen 7000"], ["Ryzen 9000", "CPU", "Ryzen 9000"], ["Intel 12th Gen", "CPU", "Intel 12th Gen"], ["Intel 13th Gen", "CPU", "Intel 13th Gen"], ["Intel 14th Gen", "CPU", "Intel 14th Gen"]]],
  ["Motherboards", [["AM4", "Motherboard", "AM4"], ["AM5", "Motherboard", "AM5"], ["Intel LGA1700", "Motherboard", "LGA1700"]]],
  ["Memory", [["DDR4", "RAM", "DDR4"], ["DDR5", "RAM", "DDR5"]]],
  ["Storage", [["NVMe SSDs", "Storage", "NVMe SSD"], ["SATA SSDs", "Storage", "SATA SSD"]]],
  ["Complete PCs", [["Gaming PCs", "Complete PC", "Gaming PC"], ["Workstations", "Complete PC", "Workstation"]]],
] as const;

export function ReconInterestCenter() {
  const { savedDealSearches } = useDealiXData();
  const toggle = (name: string, category: string, terms: string, generation?: string) => {
    const existing = savedDealSearches.find((item) => item.name === name && item.terms === terms);
    if (existing) dealixStore.saveSearch({ ...existing, active: !existing.active, updatedAt: new Date().toISOString() });
    else { const now = new Date().toISOString(); const next: SavedDealSearch = { id: `recon-interest-${crypto.randomUUID()}`, name, category, terms, marketplace: "All", condition: "Used", fulfillment: "Any", returnsRequired: false, riskThreshold: "High", notificationEnabled: true, active: true, minimumOpportunityScore: 75, gpuGeneration: generation, createdAt: now, updatedAt: now }; dealixStore.saveSearch(next); }
  };
  return <section className="rounded-2xl border border-white/10 bg-slate-950/35 p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-300">Recon Interest Center</p><h2 className="mt-1 text-lg font-semibold text-white">Choose what Recon should hunt for</h2><p className="mt-1 text-sm text-zinc-400">Select an interest once. Recon creates and updates the monitoring profile for you.</p><div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{interests.map(([group, entries]) => <fieldset key={group}><legend className="mb-2 text-sm font-semibold text-zinc-200">{group}</legend><div className="space-y-2">{entries.map(([name, category, terms, generation]) => { const active = savedDealSearches.some((item) => item.name === name && item.terms === terms && item.active); return <label key={name} className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300"><input type="checkbox" checked={active} onChange={() => toggle(name, category, terms, generation)} className="h-4 w-4 accent-sky-500" />{name}</label>; })}</div></fieldset>)}</div></section>;
}
