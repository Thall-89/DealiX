"use client";

import { BuyVsPartOut } from "@/components/BuyVsPartOut";
import Link from "next/link";
import { scoreDeal } from "@/lib/dealScoring";
import { dealixStore, useDealiXData } from "@/lib/store";
import type { DealOpportunity } from "@/types";

const money = (value?: number) => value === undefined ? "Not entered" : `$${value.toFixed(2)}`;

export function DealDetailDrawer({ deal, onClose }: { deal?: DealOpportunity; onClose: () => void }) {
  const { builds, watchlist } = useDealiXData();
  if (!deal) return null;
  const score = scoreDeal(deal);
  const watched = watchlist.some((item) => item.dealId === deal.id);
  const title = deal.detectedHardware?.model ?? deal.title;
  const canOpenListing = Boolean(deal.listingUrl && /^https?:\/\//.test(deal.listingUrl));
  const recommendation = score.urgency === "Review Now" ? "Worth a prompt review" : score.urgency === "Review Soon" ? "Promising, but verify the remaining details" : score.urgency === "Watch" ? "Keep this on the watchlist until the value improves" : "Do not prioritize this listing yet";

  return <div role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }} className="fixed inset-0 z-50 flex justify-end bg-slate-950/65 backdrop-blur-sm">
    <aside role="dialog" aria-modal="true" aria-labelledby="deal-analysis-title" className="h-full w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-[#0b101b] p-5 shadow-2xl sm:p-7">
      <header className="flex items-start justify-between gap-4 border-b border-white/10 pb-5"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">Expanded deal analysis</p><h2 id="deal-analysis-title" className="mt-1 text-xl font-semibold text-white sm:text-2xl">{title}</h2><p className="mt-1 text-sm text-zinc-400">{deal.category} · {deal.marketplace} · {deal.condition ?? "Condition not entered"}</p></div><button onClick={onClose} aria-label="Close deal analysis" className="rounded-xl border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:border-white/20 hover:text-white">Close</button></header>

      <section className="mt-6 rounded-2xl border border-sky-400/20 bg-sky-500/[0.08] p-4 sm:p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-medium uppercase tracking-[0.14em] text-sky-200">Recommendation</p><h3 className="mt-1 text-lg font-semibold text-white">{recommendation}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-zinc-300">Score {score.score}/100. {score.reasons[0] ?? "There is not enough positive evidence recorded yet."}</p></div><span className="w-fit rounded-xl border border-sky-400/20 bg-slate-950/40 px-3 py-2 text-sm font-semibold text-sky-100">{score.urgency}</span></div></section>

      <section className="mt-5"><SectionHeading title="Decision snapshot" description="The numbers to use before contacting the seller." /><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4"><Stat label="Landed cost" value={money(score.landedCost)} /><Stat label="Estimated profit" value={money(score.estimatedProfit)} positive={score.estimatedProfit !== undefined && score.estimatedProfit >= 0} /><Stat label="Estimated ROI" value={score.estimatedRoi === undefined ? "Not entered" : `${score.estimatedRoi.toFixed(1)}%`} /><Stat label="Score" value={`${score.score}/100`} /></div><div className="mt-3 grid gap-3 sm:grid-cols-3"><Signal label="Compatibility" value={score.compatibility} /><Signal label="Risk" value={score.risk} /><Signal label="Confidence" value={score.confidence} /></div></section>

      <section className="mt-7"><SectionHeading title="Pricing analysis" description="Recorded inputs only; no financial values are invented." /><dl className="mt-3 grid grid-cols-2 gap-x-5 gap-y-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm"><Detail label="Asking price" value={money(deal.askingPrice)} /><Detail label="Shipping" value={money(deal.shipping)} /><Detail label="Target buy price" value={money(deal.targetPrice)} /><Detail label="Break-even price" value={money(score.breakEvenPrice)} /><Detail label="Expected resale" value={money(deal.estimatedResaleValue)} /><Detail label="Maximum recommended" value={money(score.maximumRecommendedPrice)} /></dl></section>

      <section className="mt-7 grid gap-5 lg:grid-cols-2"><div><SectionHeading title="AI reasoning" description="Why this recommendation was produced." /><Evidence items={score.reasons} empty="No positive evidence has been recorded." tone="positive" /></div><div><SectionHeading title="Risks to verify" description="Items that could change the decision." /><Evidence items={score.risks} empty="No specific risks are recorded." tone="risk" /></div></section>

      <section className="mt-7"><SectionHeading title="Build compatibility" description="How this listing fits your current work." /><div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm leading-6 text-zinc-300">{deal.compatibilityExplanation ?? "Compatibility has not been confirmed. Assign a build only after you verify the component details."}</div></section>

      <section className="mt-7"><SectionHeading title="Actions" description="Update the opportunity without leaving the analysis." /><div className="mt-3 flex flex-wrap gap-2"><Link href={`/planner?target=${encodeURIComponent(deal.id)}`} className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-400">Build around this</Link><a href={canOpenListing ? deal.listingUrl : undefined} target="_blank" rel="noreferrer" aria-disabled={!canOpenListing} className="rounded-xl bg-sky-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-400 aria-disabled:cursor-not-allowed aria-disabled:opacity-50">Open listing</a><button onClick={() => dealixStore.saveDeal(deal)} className="rounded-xl border border-white/10 px-3 py-2 text-sm text-zinc-200 transition hover:bg-white/5">Save deal</button><button onClick={() => watched ? dealixStore.removeWatch(deal.id) : dealixStore.watchDeal(deal.id)} className="rounded-xl border border-white/10 px-3 py-2 text-sm text-zinc-200 transition hover:bg-white/5">{watched ? "Remove watch" : "Watch deal"}</button><select defaultValue="" onChange={(event) => { if (event.target.value) dealixStore.assignDealToBuild(deal.id, event.target.value); }} aria-label="Assign deal to build" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"><option value="">Assign to build</option>{builds.map((build) => <option key={build.id} value={build.id}>{build.name}</option>)}</select><button onClick={() => { dealixStore.dismissDeal(deal.id); onClose(); }} className="rounded-xl border border-rose-400/20 px-3 py-2 text-sm text-rose-200 transition hover:bg-rose-500/10">Dismiss</button></div></section>

      <div className="mt-7 border-t border-white/10 pt-6"><BuyVsPartOut title={deal.title} marketplace={deal.marketplace} /></div>
    </aside>
  </div>;
}

function SectionHeading({ title, description }: { title: string; description: string }) { return <div><h3 className="font-semibold text-white">{title}</h3><p className="mt-1 text-sm text-zinc-500">{description}</p></div>; }
function Stat({ label, value, positive }: { label: string; value: string; positive?: boolean }) { return <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3"><p className="text-xs text-zinc-500">{label}</p><p className={`mt-1 text-base font-semibold ${positive ? "text-emerald-300" : "text-white"}`}>{value}</p></div>; }
function Signal({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2"><p className="text-xs text-zinc-500">{label}</p><p className="mt-1 text-sm font-medium text-zinc-200">{value}</p></div>; }
function Detail({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs text-zinc-500">{label}</dt><dd className="mt-1 font-medium text-zinc-200">{value}</dd></div>; }
function Evidence({ items, empty, tone }: { items: string[]; empty: string; tone: "positive" | "risk" }) { return <ul className="mt-3 space-y-2">{(items.length ? items : [empty]).map((item) => <li key={item} className="flex gap-2 rounded-xl border border-white/10 bg-white/[0.025] p-3 text-sm leading-6 text-zinc-300"><span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${tone === "positive" ? "bg-emerald-300" : "bg-amber-300"}`} />{item}</li>)}</ul>; }
