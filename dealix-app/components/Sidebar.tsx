"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/mockData";
import { getDashboardMetrics, useDealiXData } from "@/lib/store";

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const metrics = getDashboardMetrics(useDealiXData());

  const links = [
    ...navItems,
    { href: "/tasks", label: "Tasks" },
    { href: "/notifications", label: "Notifications" },
    { href: "/motherboard-finder", label: "Motherboard Finder" },
  ];

  return (
    <aside className={`w-full shrink-0 rounded-[28px] border border-white/10 bg-slate-950/60 p-4 shadow-[0_24px_80px_rgba(2,12,27,0.38)] backdrop-blur-xl lg:w-72 lg:p-5 ${mobileOpen ? "block" : "hidden lg:block"}`}>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/15 text-lg text-sky-300">D</div>
          <div>
            <div className="text-lg font-semibold text-white">DealiX</div>
            <div className="text-sm text-zinc-500">Operations OS</div>
          </div>
        </div>
        {onClose ? (
          <button onClick={onClose} className="rounded-full border border-white/10 p-2 text-zinc-400 lg:hidden">
            ×
          </button>
        ) : null}
      </div>

      <nav className="space-y-2">
        {links.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${active ? "bg-sky-500/15 text-sky-200" : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"}`}
            >
              <span>{item.label}</span>
              {active ? <span className="text-sky-300">●</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-medium text-white">Today&apos;s Snapshot</div>
        <div className="mt-3 space-y-2 text-sm text-zinc-400">
          <div className="flex items-center justify-between"><span>Confirmed Profit</span><span className="text-white">${metrics.confirmedNetProfit.toFixed(2)}</span></div>
          <div className="flex items-center justify-between"><span>Active Builds</span><span className="text-white">{metrics.activeBuilds}</span></div>
          <div className="flex items-center justify-between"><span>Listed Builds</span><span className="text-white">{metrics.listedBuilds}</span></div>
          <div className="flex items-center justify-between"><span>Pending Tasks</span><span className="text-white">{metrics.pendingTasks}</span></div>
          <div className="flex items-center justify-between"><span>Unread Alerts</span><span className="text-white">{metrics.unreadNotifications}</span></div>
        </div>
      </div>
    </aside>
  );
}
