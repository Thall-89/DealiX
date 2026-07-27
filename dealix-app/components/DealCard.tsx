"use client";

import { dealixStore, useDealiXData } from "@/lib/store";
import { scoreDeal } from "@/lib/dealScoring";
import type { DealOpportunity } from "@/types";

const money = (value?: number) => value === undefined ? "—" : `$${value.toFixed(0)}`;
const percentage = (value?: number) => value === undefined ? "—" : `${value.toFixed(0)}%`;

export function DealCard({ deal, onSelect }: { deal: DealOpportunity; onSelect?: () => void }) {
  const { watchlist } = useDealiXData();
  const score = scoreDeal(deal);
  const watched = watchlist.some((item) => item.dealId === deal.id);
  const title = deal.detectedHardware?.model ?? deal.title;
  const riskClass = score.risk === "Low" ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200" : score.risk === "Critical" ? "border-rose-400/20 bg-rose-500/10 text-rose-200" : "border-amber-400/20 bg-amber-500/10 text-amber-100";
  const compatibilityClass = score.compatibility === "Compatible" ? "text-emerald-300" : score.compatibility === "Not Compatible" ? "text-rose-300" : "text-amber-200";

  return <article onClick={onSelect} className={`rounded-[20px] border border-white/10 bg-slate-950/50 p-4 shadow-[0_14px_40px_rgba(2,12,27,0.2)] transition duration-200 hover:-translate-y-0.5 hover:border-sky-400/30 ${onSelect ? "cursor-pointer" : ""}`}>
    <header className="flex items-start justify-between gap-4">
      <div className="min-w-0"><p className="text-xs font-medium uppercase tracking-[0.14em] text-sky-300">{deal.category} · {deal.marketplace}</p><h3 className="mt-1 truncate text-base font-semibold text-white">{title}</h3><p className="mt-1 truncate text-xs text-zinc-500">{deal.condition ?? "Condition not entered"} · {deal.sourceType}</p></div>
      <div className="shrink-0 rounded-xl border border-sky-400/20 bg-sky-500/10 px-2.5 py-1.5 text-right"><span className="block text-[10px] font-medium uppercase tracking-wider text-sky-200">Score</span><strong className="text-lg leading-none text-white">{score.score}</strong></div>
    </header>

    <div className="mt-4 grid grid-cols-3 divide-x divide-white/10 rounded-xl border border-white/10 bg-white/[0.035] py-2.5">
      <Metric label="Landed" value={money(score.landedCost)} />
      <Metric label="Profit" value={money(score.estimatedProfit)} tone={score.estimatedProfit !== undefined && score.estimatedProfit >= 0 ? "positive" : score.estimatedProfit !== undefined ? "negative" : undefined} />
      <Metric label="ROI" value={percentage(score.estimatedRoi)} />
    </div>

    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs"><span className={`rounded-full border px-2.5 py-1 ${compatibilityClass}`}>{score.compatibility}</span><span className={`rounded-full border px-2.5 py-1 ${riskClass}`}>{score.risk} risk</span><span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-zinc-400">{score.confidence} confidence</span></div>

    <footer className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3" onClick={(event) => event.stopPropagation()}>
      <span className="truncate text-xs text-zinc-500">{score.urgency} · {deal.returnPolicy ?? "Returns unknown"}</span>
      <div className="flex shrink-0 gap-2"><button onClick={() => watched ? dealixStore.removeWatch(deal.id) : dealixStore.watchDeal(deal.id)} className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-sky-400/30 hover:text-sky-200">{watched ? "Watching" : "Watch"}</button><button onClick={onSelect} className="rounded-lg bg-sky-500 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-sky-400">Analyze</button></div>
    </footer>
  </article>;
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "positive" | "negative" }) { return <div className="px-3 first:pl-4 last:pr-4"><p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{label}</p><p className={`mt-1 text-sm font-semibold ${tone === "positive" ? "text-emerald-300" : tone === "negative" ? "text-rose-300" : "text-white"}`}>{value}</p></div>; }
