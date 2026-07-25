'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const commands = [
  { label: "Dashboard", href: "/" },
  { label: "Builds", href: "/builds" },
  { label: "Inventory", href: "/inventory" },
  { label: "Deal Finder", href: "/deals" },
  { label: "Testing", href: "/testing" },
  { label: "Sales", href: "/sales" },
  { label: "Analytics", href: "/analytics" },
  { label: "AI Assistant", href: "/ai" },
  { label: "Settings", href: "/settings" },
  { label: "Find Compatible Motherboard", href: "/motherboard-finder" },
  { label: "Tasks", href: "/tasks" },
  { label: "Notifications", href: "/notifications" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const visibleCommands = useMemo(() => {
    const normalized = query.toLowerCase();
    return commands.filter((command) => `${command.label} ${command.href}`.toLowerCase().includes(normalized));
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/80 px-4 pt-20 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-slate-950/90 p-4 shadow-[0_24px_80px_rgba(2,12,27,0.38)]">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pages, builds, tasks, commands" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500" autoFocus />
        <div className="mt-4 space-y-2">
          {visibleCommands.map((command) => (
            <Link key={command.href} href={command.href} onClick={() => setOpen(false)} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300 hover:border-sky-400/30 hover:bg-sky-500/10">
              <span>{command.label}</span>
              <span className="text-sky-300">Open</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
