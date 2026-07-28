'use client';

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { createDefaultTestingResult, dealixStore, useDealiXData } from "@/lib/store";
import type { TestingResult } from "@/types";

export default function TestingPage() {
  const snapshot = useDealiXData();
  const [selectedBuildId, setSelectedBuildId] = useState(snapshot.builds.find((build) => build.status === "Active")?.id ?? snapshot.builds[0]?.id ?? "");
  const [saveMessage, setSaveMessage] = useState("");
  const selectedBuild = snapshot.builds.find((build) => build.id === selectedBuildId) ?? snapshot.builds[0];

  if (!selectedBuild) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Testing workflow" title="Testing" description="Record a build's hardware checks, temperatures, and benchmark results in one place." />
        <section className="rounded-[28px] border border-dashed border-white/15 bg-white/5 p-8 text-center shadow-[0_20px_60px_rgba(2,12,27,0.2)]">
          <h2 className="text-xl font-semibold text-white">Create a build before testing it</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-zinc-400">Testing results are linked to a saved build, so your temperatures, checklist, and repair notes stay with the right PC.</p>
          <Link href="/builds" className="mt-5 inline-flex rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:bg-sky-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300">Create a build</Link>
        </section>
      </div>
    );
  }

  const result = snapshot.testingResults[selectedBuild.id] ?? createDefaultTestingResult(selectedBuild.id);

  const saveResult = (next: TestingResult) => {
    dealixStore.updateTestingResult(next);
    dealixStore.updateBuild({
      ...selectedBuild,
      health: next.failedPart ? "Needs attention" : next.checklist.every((item) => item.done) ? "Ready" : "Not assessed",
      benchmarking: {
        ...selectedBuild.benchmarking,
        cpuLoadTemp: next.cpuTemp || selectedBuild.benchmarking?.cpuLoadTemp,
        gpuLoadTemp: next.gpuTemp || selectedBuild.benchmarking?.gpuLoadTemp,
        threeDMark: next.benchmark || selectedBuild.benchmarking?.threeDMark,
        notes: next.notes,
        status: next.failedPart ? "Fail" : next.checklist.every((item) => item.done) ? "Pass" : selectedBuild.benchmarking?.status ?? "Not entered",
      },
    });
    setSaveMessage("Testing result saved to this build.");
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Testing workflow" title="Testing" description="Use this saved workflow to track the USB and hardware testing process for a selected build." />

      <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="text-sm font-medium text-sky-300">Build</div>
            <select value={selectedBuildId} onChange={(event) => setSelectedBuildId(event.target.value)} className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none">
              {snapshot.builds.map((build) => <option key={build.id} value={build.id} className="bg-slate-900">{build.name}</option>)}
            </select>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-400">
              <div className="font-medium text-zinc-200">Selected build</div>
              <div className="mt-2">{selectedBuild.name}</div><div className="mt-2">Status: {selectedBuild.status}</div><div className="mt-2">CPU: {selectedBuild.cpu}</div><div className="mt-2">GPU: {selectedBuild.gpu}</div>
            </div>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-medium text-white">Checklist</div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {result.checklist.map((item) => <label key={item.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-zinc-300"><input type="checkbox" checked={item.done} onChange={() => saveResult({ ...result, checklist: result.checklist.map((entry) => entry.id === item.id ? { ...entry, done: !entry.done } : entry) })} className="h-4 w-4 rounded border-white/20 bg-transparent accent-sky-500" /><span>{item.label}</span></label>)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
          <div className="text-xl font-semibold text-white">Notes and measurements</div>
          <textarea value={result.notes} onChange={(event) => saveResult({ ...result, notes: event.target.value })} className="mt-4 min-h-32 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300"><div className="text-xs uppercase tracking-[0.24em] text-zinc-500">CPU temperature</div><input value={result.cpuTemp} onChange={(event) => saveResult({ ...result, cpuTemp: event.target.value })} className="mt-2 w-full bg-transparent text-white outline-none" /></label>
            <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300"><div className="text-xs uppercase tracking-[0.24em] text-zinc-500">GPU temperature</div><input value={result.gpuTemp} onChange={(event) => saveResult({ ...result, gpuTemp: event.target.value })} className="mt-2 w-full bg-transparent text-white outline-none" /></label>
            <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300"><div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Benchmark score</div><input value={result.benchmark} onChange={(event) => saveResult({ ...result, benchmark: event.target.value })} className="mt-2 w-full bg-transparent text-white outline-none" /></label>
            <label className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300"><div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Failed component</div><input value={result.failedPart} onChange={(event) => saveResult({ ...result, failedPart: event.target.value })} className="mt-2 w-full bg-transparent text-white outline-none" placeholder="Optional" /></label>
          </div>
          {result.failedPart ? <label className="mt-4 flex items-center gap-3 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-100"><input type="checkbox" checked={result.createRepairTask !== false} onChange={() => saveResult({ ...result, createRepairTask: result.createRepairTask === false })} className="h-4 w-4 accent-sky-500" />Create a linked repair task</label> : null}
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl"><div className="text-xl font-semibold text-white">Current status</div><div className="mt-4 space-y-3 text-sm text-zinc-400"><div className="rounded-2xl border border-white/10 bg-white/5 p-3">Status: {selectedBuild.benchmarking?.status ?? "Not entered"}</div><div className="rounded-2xl border border-white/10 bg-white/5 p-3">CPU temp: {result.cpuTemp || "Not entered"}</div><div className="rounded-2xl border border-white/10 bg-white/5 p-3">GPU temp: {result.gpuTemp || "Not entered"}</div><div className="rounded-2xl border border-white/10 bg-white/5 p-3">Benchmark: {result.benchmark || "Not entered"}</div>{result.failedPart ? <div className="rounded-2xl border border-white/10 bg-white/5 p-3">Failed part: {result.failedPart}</div> : null}{saveMessage ? <div className="text-sm font-medium text-emerald-300">{saveMessage}</div> : null}</div></div>
      </div>
    </div>
  );
}
