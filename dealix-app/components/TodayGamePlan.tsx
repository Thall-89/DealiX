'use client';

import Link from "next/link";
import { dealixStore, useDealiXData } from "@/lib/store";

type PlanItem = { id: string; title: string; why: string; next: string; href: string; taskId?: string; tone: "sky" | "amber" | "emerald" };

export function TodayGamePlan() {
  const snapshot = useDealiXData();
  const plan: PlanItem[] = [];
  const blockedBuild = snapshot.builds.find((build) => build.partsNeeded?.some((part) => part.priority === "High"));
  if (blockedBuild) {
    const part = blockedBuild.partsNeeded?.find((item) => item.priority === "High");
    plan.push({ id: `blocked-${blockedBuild.id}`, title: `Unblock ${blockedBuild.name}`, why: `${part?.name ?? "A required part"} is marked high priority, so the build cannot move forward.`, next: "Review compatible sourcing options", href: "/motherboard-finder", tone: "amber" });
  }
  const pendingTask = [...snapshot.tasks].filter((task) => !task.completed).sort((a, b) => (a.priority === "High" ? -1 : b.priority === "High" ? 1 : 0))[0];
  if (pendingTask) plan.push({ id: pendingTask.id, title: pendingTask.title, why: `${pendingTask.priority} priority work is still open${pendingTask.relatedBuild ? ` for ${pendingTask.relatedBuild}` : ""}.`, next: "Complete the task and update the workflow", href: "/tasks", taskId: pendingTask.id, tone: "sky" });
  const listedBuild = snapshot.builds.find((build) => build.status === "Listed");
  if (listedBuild) plan.push({ id: `listed-${listedBuild.id}`, title: `Review ${listedBuild.name} listing`, why: "The build is already open for sale, so a timely follow-up protects momentum.", next: "Review price, listing copy, and buyer activity", href: `/builds/${listedBuild.slug}`, tone: "emerald" });
  const untestedBuild = snapshot.builds.find((build) => !snapshot.testingResults[build.id] && build.status === "Active" && build.id !== blockedBuild?.id);
  if (untestedBuild) plan.push({ id: `testing-${untestedBuild.id}`, title: `Test ${untestedBuild.name}`, why: "No testing result has been saved yet, leaving readiness uncertain.", next: "Run the checklist before listing", href: "/testing", tone: "sky" });
  const savedDeal = snapshot.dealOpportunities.find((deal) => deal.saved && !deal.dismissed);
  if (savedDeal && plan.length < 5) plan.push({ id: `deal-${savedDeal.id}`, title: `Review saved deal: ${savedDeal.title}`, why: "You saved this opportunity for follow-up, and it still needs a decision.", next: "Validate condition and decide whether to pursue it", href: "/deals", tone: "emerald" });
  if (!plan.length) plan.push({ id: "inventory", title: "Review available inventory", why: "No urgent blockers are recorded right now.", next: "Turn ready parts into the next profitable build", href: "/inventory", tone: "sky" });

  const toneClasses = { sky: "border-sky-400/20 bg-sky-500/[0.08]", amber: "border-amber-400/20 bg-amber-500/[0.08]", emerald: "border-emerald-400/20 bg-emerald-500/[0.08]" };
  return <section className="rounded-[28px] border border-white/10 bg-slate-950/40 p-5 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl sm:p-6"><div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">Business advisor</p><h2 className="mt-1 text-xl font-semibold text-white">Today&apos;s Game Plan</h2><p className="mt-1 text-sm text-zinc-400">The few actions most likely to keep your business moving.</p></div><span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">{plan.length} next actions</span></div><div className="grid gap-3 lg:grid-cols-2">{plan.slice(0, 5).map((item) => <div key={item.id} className={`rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 ${toneClasses[item.tone]}`}><div className="flex gap-3"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-current text-sky-300" /><div className="min-w-0 flex-1"><h3 className="font-medium text-white">{item.title}</h3><p className="mt-1 text-sm leading-6 text-zinc-400"><span className="text-zinc-300">Why:</span> {item.why}</p><p className="mt-1 text-sm leading-6 text-zinc-400"><span className="text-zinc-300">Next:</span> {item.next}</p><div className="mt-3 flex items-center gap-3">{item.taskId ? <button onClick={() => { const task = snapshot.tasks.find((entry) => entry.id === item.taskId); if (task) dealixStore.updateTask({ ...task, completed: true, status: "Completed" }); }} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:bg-white/10">Mark done</button> : null}<Link href={item.href} className="text-xs font-semibold text-sky-300 transition-colors hover:text-sky-200">Open workflow →</Link></div></div></div></div>)}</div></section>;
}
