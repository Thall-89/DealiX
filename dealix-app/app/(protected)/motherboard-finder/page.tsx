'use client';

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { motherboardCompatibility } from "@/lib/mockData";
import { useDealiXData } from "@/lib/store";
import { dealixStore } from "@/lib/store";

const savedSearches = ["i7-7700K motherboard", "Z270 motherboard", "H270 motherboard", "B250 motherboard", "LGA1151 7th Gen", "Kaby Lake motherboard"];

export default function MotherboardFinderPage() {
  const { builds } = useDealiXData();
  const legacyBuild = builds.find((build) => build.slug === "legacy-powerhouse");
  const [query, setQuery] = useState("LGA1151 7th gen motherboard");
  const [saveMessage, setSaveMessage] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase();
    return motherboardCompatibility.filter((item) => `${item.name} ${item.summary}`.toLowerCase().includes(normalized));
  }, [query]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Compatibility assistant" title="Find Compatible Motherboard" description="Legacy Powerhouse is blocked until a compatible motherboard is found. This assistant uses mock compatibility logic for now." />

      <div className="rounded-[28px] border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-200">
        <div className="font-semibold">Legacy Powerhouse is blocked.</div>
        <div className="mt-1 text-amber-300/90">Reason: compatible motherboard required. The build is waiting on replacement hardware before it can continue.</div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
          <div className="text-xl font-semibold text-white">Current build requirements</div>
          <div className="mt-4 space-y-3 text-sm text-zinc-400">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">CPU: {legacyBuild?.cpu ?? "Not entered"}</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">GPU: {legacyBuild?.gpu ?? "Not entered"}</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">RAM: {legacyBuild?.ram ?? "Not entered"}</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">PSU: {legacyBuild?.psu ?? "Not entered"}</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">Status: {legacyBuild?.status ?? "Not entered"} - {legacyBuild?.partsNeeded?.[0]?.name ?? "No missing part recorded"}</div>
          </div>

          <div className="mt-6 text-xl font-semibold text-white">Compatibility checklist</div>
          <div className="mt-4 space-y-2 text-sm text-zinc-300">
            {[
              "Socket matches",
              "CPU supported",
              "DDR4 supported",
              "PCIe slot available",
              "Correct size",
              "BIOS compatible",
              "Seller condition",
              "I/O shield included",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2">✓ {item}</div>
            ))}
          </div>

          <div className="mt-6 text-xl font-semibold text-white">Saved searches</div>
          <div className="mt-4 flex flex-wrap gap-2">
            {savedSearches.map((search) => (
              <button key={search} onClick={() => setQuery(search)} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300">{search}</button>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search compatibility terms" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500" />
          <div className="mt-4 space-y-3">
            {filtered.map((item) => (
              <div key={item.name} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-white">{item.name}</div>
                  <div className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-xs text-sky-200">{item.compatibilityScore}%</div>
                </div>
                <div className="mt-3 text-zinc-400">{item.summary}</div>
                <div className="mt-3 text-xs uppercase tracking-[0.24em] text-zinc-500">{item.status}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.notes.map((note) => <span key={note} className="rounded-full border border-white/10 px-2.5 py-1 text-xs">{note}</span>)}
                </div>
                {item.status.startsWith("Compatible") && legacyBuild ? <button onClick={() => { dealixStore.assignMockMotherboard(legacyBuild.id, item.name, item.summary); setSaveMessage(`${item.name} was assigned as a mock compatibility candidate. Confirm the real board condition before purchase or installation.`); }} className="mt-4 rounded-full border border-sky-400/30 px-3 py-2 text-sm text-sky-200">Assign to Legacy Powerhouse</button> : <button disabled className="mt-4 rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-500">Not compatible</button>}
              </div>
            ))}
          </div>

          {saveMessage ? <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">{saveMessage}</div> : null}

          <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-zinc-400">
            <div className="font-medium text-white">Marketplace integration</div>
            <div className="mt-2">Marketplace integration coming soon. This page is ready to later rank real marketplace recommendations.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
