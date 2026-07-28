'use client';

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

const workflows = [
  {
    title: "Evaluate opportunities",
    description: "Recon ranks the saved targets in your workspace and explains the opportunity, risk, and compatibility signals it has recorded.",
    href: "/deals",
    action: "Open Recon",
  },
  {
    title: "Plan a profitable build",
    description: "Start with a component or an empty build, then use the Planner to compare compatible parts from inventory, Recon, and the catalog.",
    href: "/planner",
    action: "Open Planner",
  },
  {
    title: "Prepare a listing",
    description: "Open any build to create and save a clear marketplace listing draft from the information you have entered.",
    href: "/builds",
    action: "View builds",
  },
];

export default function AiPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workflow intelligence"
        title="AI Assistant"
        description="DealiX keeps automated guidance inside the workflows where it can use your saved data. A general-purpose chat is not enabled for this beta."
      />

      <div className="rounded-[28px] border border-sky-400/20 bg-sky-500/10 p-6 shadow-[0_20px_60px_rgba(14,165,233,0.12)] backdrop-blur-xl sm:p-8">
        <div className="max-w-2xl">
          <div className="text-xl font-semibold text-white">Guidance that stays grounded in your workspace</div>
          <p className="mt-3 text-sm leading-7 text-sky-100/80">
            DealiX will never present a canned answer as live analysis. Use the tools below to work with the builds, inventory, and Recon targets that belong to your account.
          </p>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {workflows.map((workflow) => (
            <div key={workflow.title} className="flex flex-col rounded-[24px] border border-white/10 bg-slate-950/40 p-5">
              <h2 className="text-base font-semibold text-white">{workflow.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-zinc-400">{workflow.description}</p>
              <Link href={workflow.href} className="mt-5 inline-flex w-fit items-center rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-100 transition duration-200 hover:-translate-y-0.5 hover:bg-sky-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300">
                {workflow.action}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
