'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDealiXData } from "@/lib/store";

type Command = { id: string; label: string; detail: string; href: string; shortcut?: string; group: "Navigate" | "Search" | "Create" };

const pageCommands: Command[] = [
  { id: "new-build", label: "New Build", detail: "Open build management", href: "/builds", shortcut: "B", group: "Create" },
  { id: "dashboard", label: "Dashboard", detail: "Business advisor", href: "/", group: "Navigate" },
  { id: "inventory", label: "Inventory", detail: "Track available parts", href: "/inventory", shortcut: "I", group: "Navigate" },
  { id: "market-intelligence", label: "Market Intelligence", detail: "Review sourcing opportunities", href: "/deals", shortcut: "D", group: "Navigate" },
  { id: "sales", label: "Sales", detail: "Review completed sales", href: "/sales", shortcut: "S", group: "Navigate" },
  { id: "tasks", label: "Tasks", detail: "Manage next actions", href: "/tasks", group: "Navigate" },
  { id: "analytics", label: "Analytics", detail: "Review performance", href: "/analytics", group: "Navigate" },
  { id: "settings", label: "Settings", detail: "Manage your workspace", href: "/settings", group: "Navigate" },
];

export function CommandPalette() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { builds, inventory, tasks } = useDealiXData();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const commands = useMemo<Command[]>(() => [
    ...pageCommands,
    ...builds.map((build) => ({ id: `build-${build.id}`, label: build.name, detail: `${build.status} build`, href: `/builds/${build.slug}`, group: "Search" as const })),
    ...inventory.map((item) => ({ id: `inventory-${item.id}`, label: item.name, detail: `${item.category} inventory`, href: `/inventory/${item.slug}`, group: "Search" as const })),
    ...tasks.filter((task) => !task.completed).map((task) => ({ id: `task-${task.id}`, label: task.title, detail: `${task.priority} priority task`, href: "/tasks", group: "Search" as const })),
  ], [builds, inventory, tasks]);

  const visibleCommands = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized ? commands.filter((command) => `${command.label} ${command.detail} ${command.group}`.toLowerCase().includes(normalized)).slice(0, 10) : commands.slice(0, 10);
  }, [commands, query]);

  const close = useCallback(() => { setOpen(false); setQuery(""); setActiveIndex(0); }, []);
  const run = useCallback((command: Command | undefined) => { if (!command) return; router.push(command.href); close(); }, [close, router]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true); setActiveIndex(0);
        return;
      }
      if (!open) return;
      if (event.key === "Escape") { event.preventDefault(); close(); return; }
      if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex((index) => Math.min(index + 1, Math.max(visibleCommands.length - 1, 0))); return; }
      if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((index) => Math.max(index - 1, 0)); return; }
      if (event.key === "Enter") { event.preventDefault(); run(visibleCommands[activeIndex]); return; }
      if (!query && !event.altKey && !event.ctrlKey && !event.metaKey && event.key.length === 1) {
        const command = pageCommands.find((item) => item.shortcut?.toLowerCase() === event.key.toLowerCase());
        if (command) { event.preventDefault(); run(command); }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, close, open, query, run, visibleCommands]);

  useEffect(() => { if (open) requestAnimationFrame(() => inputRef.current?.focus()); }, [open]);

  if (!open) return null;

  return (
    <div role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) close(); }} className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/80 px-4 pt-[12vh] backdrop-blur-md">
      <section role="dialog" aria-modal="true" aria-labelledby="command-palette-title" className="w-full max-w-xl overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/95 p-2 shadow-[0_24px_80px_rgba(2,12,27,0.38)]">
        <h2 id="command-palette-title" className="sr-only">Command palette</h2>
        <div className="flex items-center gap-3 border-b border-white/10 px-3 py-2">
          <span aria-hidden="true" className="text-sky-300">⌘</span>
          <input ref={inputRef} value={query} onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); }} placeholder="Search builds, inventory, tasks, and pages" className="h-11 w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500" />
          <kbd className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-medium text-zinc-400">Esc</kbd>
        </div>
        <div role="listbox" aria-label="Commands" className="max-h-[min(440px,60vh)] overflow-y-auto p-1">
          {visibleCommands.length ? visibleCommands.map((command, index) => (
            <button key={command.id} role="option" aria-selected={activeIndex === index} onMouseEnter={() => setActiveIndex(index)} onClick={() => run(command)} className={`flex min-h-11 w-full items-center justify-between gap-4 rounded-xl px-3 text-left transition ${activeIndex === index ? "bg-sky-500/15 text-white" : "text-zinc-300 hover:bg-white/5"}`}>
              <span><span className="block text-sm font-medium">{command.label}</span><span className="mt-0.5 block text-xs text-zinc-500">{command.detail}</span></span>
              <span className="flex items-center gap-2 text-xs text-zinc-500">{command.shortcut ? <kbd className="rounded border border-white/10 px-1.5 py-0.5">{command.shortcut}</kbd> : null}<span>{command.group}</span></span>
            </button>
          )) : <div className="px-3 py-10 text-center text-sm text-zinc-500">No matching commands. Try a build, part, task, or page name.</div>}
        </div>
        <footer className="flex items-center gap-3 border-t border-white/10 px-3 py-2 text-[11px] text-zinc-500"><span><kbd className="rounded border border-white/10 px-1">↑</kbd> <kbd className="rounded border border-white/10 px-1">↓</kbd> Navigate</span><span><kbd className="rounded border border-white/10 px-1">↵</kbd> Open</span></footer>
      </section>
    </div>
  );
}
