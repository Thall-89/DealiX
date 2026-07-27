"use client";

import { useState } from "react";
import { useDealiXData } from "@/lib/store";
import type { Build } from "@/types";

export function RecreateBuild({ build }: { build: Build }) {
  const [open, setOpen] = useState(false);
  const { inventory } = useDealiXData();
  const components = [["CPU", build.cpu], ["GPU", build.gpu], ["Motherboard", build.motherboard], ["RAM", build.ram], ["Storage", build.storage], ["PSU", build.psu], ["Case", build.case], ["Cooling", build.cooling]].filter((item): item is [string, string] => Boolean(item[1]));
  if (!open) return <button onClick={() => setOpen(true)} className="rounded-full border border-sky-400/30 px-4 py-2 text-sm text-sky-200">Recreate This Build</button>;
  return <section className="rounded-[28px] border border-sky-400/20 bg-slate-950/50 p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-sky-300">Recreate This Build</p><h2 className="mt-1 text-xl font-semibold text-white">Local availability plan</h2></div><button onClick={() => setOpen(false)} className="text-sm text-zinc-400">Close</button></div><p className="mt-2 text-sm text-zinc-400">Exact/compatible used/new pricing needs live or manual marketplace data. This local planner only identifies eligible owned assets and missing pricing.</p><div className="mt-4 space-y-2">{components.map(([label, value]) => { const owned = inventory.find((item) => item.availability === "Available" && `${item.name} ${item.brandModel}`.toLowerCase().includes(value.toLowerCase())); return <div key={label} className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm sm:flex-row sm:items-center sm:justify-between"><span>{label}: <span className="text-white">{value}</span></span><span className={owned ? "text-emerald-300" : "text-amber-300"}>{owned ? `Already Owned: ${owned.name}` : "Needs manual source or price"}</span></div>; })}</div>{build.name === "Blue Titan" ? <div className="mt-4 rounded-2xl border border-purple-400/20 bg-purple-500/10 p-4 text-sm text-purple-100">Saved manual rebuild estimate: $805.00. Your recorded cost: $715.00. Difference: $90.00. This is a saved manual estimate, not a live market value.</div> : null}</section>;
}
