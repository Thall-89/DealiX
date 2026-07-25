'use client';

import Link from "next/link";
import { useMemo, useState } from "react";
import { useDealiXData } from "@/lib/store";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const { builds, inventory, tasks } = useDealiXData();
  const searchableItems = useMemo(() => [
    ...builds.map((build) => ({ id: build.id, label: build.name, href: `/builds/${build.slug}`, category: "Build" })),
    ...inventory.map((item) => ({ id: item.id, label: item.name, href: `/inventory/${item.slug}`, category: "Inventory" })),
    ...tasks.map((task) => ({ id: task.id, label: task.title, href: "/tasks", category: "Task" })),
    { id: "search-builds", label: "Builds", href: "/builds", category: "Page" },
    { id: "search-inventory", label: "Inventory", href: "/inventory", category: "Page" },
    { id: "search-sales", label: "Sales", href: "/sales", category: "Page" },
    { id: "search-ai", label: "AI Assistant", href: "/ai", category: "Page" },
    { id: "search-notifications", label: "Notifications", href: "/notifications", category: "Page" },
    { id: "search-motherboard", label: "Compatible Motherboard", href: "/motherboard-finder", category: "Page" },
  ], [builds, inventory, tasks]);

  const results = useMemo(() => {
    const normalized = query.toLowerCase();
    if (!normalized) return [];

    return searchableItems.filter((item) => `${item.label} ${item.category}`.toLowerCase().includes(normalized));
  }, [query, searchableItems]);

  return (
    <div className="relative w-full max-w-xl">
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search builds, parts, tasks, inventory" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500" />
      {results.length ? (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-[24px] border border-white/10 bg-slate-950/90 p-2 shadow-[0_20px_80px_rgba(2,12,27,0.38)]">
          {results.slice(0, 8).map((item) => (
            <Link key={item.id} href={item.href} className="flex items-center justify-between rounded-2xl px-3 py-2 text-sm text-zinc-300 hover:bg-white/5">
              <span>{item.label}</span>
              <span className="text-xs uppercase tracking-[0.24em] text-zinc-500">{item.category}</span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
