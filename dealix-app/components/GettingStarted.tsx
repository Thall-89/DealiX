"use client";

import Link from "next/link";
import { dealixStore, useDealiXData } from "@/lib/store";
import { useAuthIdentity } from "@/components/AuthIdentity";

export function GettingStarted() {
  const data = useDealiXData();
  const { preferredName } = useAuthIdentity();
  if (data.settings.onboardingDismissed) return null;

  const steps = [
    { label: "Complete your profile", href: "/settings/profile", complete: Boolean(preferredName), description: "Set the name DealiX uses around your workspace." },
    { label: "Create your first build", href: "/builds", complete: data.builds.length > 0, description: "Start with a PC you own or a flip you are planning." },
    { label: "Add inventory", href: "/inventory", complete: data.inventory.length > 0, description: "Track the parts already available to use." },
    { label: "Explore Recon", href: "/deals", complete: data.dealOpportunities.length > 0 || data.savedDealSearches.length > 0, description: "Set what hardware Recon should watch for you." },
  ];
  const completed = steps.filter((step) => step.complete).length;

  return <section className="rounded-[28px] border border-sky-400/20 bg-sky-500/[0.07] p-5 shadow-[0_20px_60px_rgba(14,116,144,0.12)] sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">Getting started</p><h2 className="mt-1 text-xl font-semibold text-white">Welcome to DealiX, {preferredName}.</h2><p className="mt-1 text-sm text-zinc-400">A few small steps will make your workspace useful right away.</p></div><button type="button" onClick={() => dealixStore.updateSettings({ ...data.settings, onboardingDismissed: true })} className="w-fit text-sm font-medium text-zinc-400 transition hover:text-zinc-200">Dismiss</button></div><div className="mt-5 grid gap-3 lg:grid-cols-2">{steps.map((step, index) => <Link key={step.label} href={step.href} className="group rounded-2xl border border-white/10 bg-slate-950/30 p-4 transition hover:-translate-y-0.5 hover:border-sky-400/35 hover:bg-sky-500/[0.06]"><div className="flex items-start gap-3"><span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-semibold ${step.complete ? "bg-emerald-400/15 text-emerald-300" : "bg-white/10 text-zinc-400"}`}>{step.complete ? "✓" : index + 1}</span><div><p className="font-medium text-white">{step.label}</p><p className="mt-1 text-sm leading-6 text-zinc-400">{step.complete ? "Done" : step.description}</p></div></div></Link>)}</div><div className="mt-4 flex items-center justify-between text-xs text-zinc-500"><span>{completed} of {steps.length} complete</span><span>{completed === steps.length ? "You’re ready to flip." : "Your progress saves automatically."}</span></div></section>;
}
