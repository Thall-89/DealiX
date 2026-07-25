'use client';

import { useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { dealixStore, useDealiXData } from "@/lib/store";

export default function NotificationsPage() {
  const { notifications } = useDealiXData();

  const unreadCount = useMemo(() => notifications.filter((item) => item.unread && !item.dismissed).length, [notifications]);

  const dismiss = (id: string) => {
    dealixStore.dismissNotification(id);
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Alerts" title="Notifications" description="Review the latest build, inventory, and sales updates in one place." />

      <div className="rounded-[24px] border border-white/10 bg-slate-950/40 p-4 text-sm text-zinc-300">Unread notifications: {unreadCount}</div>

      <div className="space-y-3">
        {notifications.filter((item) => !item.dismissed).map((item) => (
          <div key={item.id} className={`rounded-[28px] border p-5 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl ${item.unread ? "border-sky-400/20 bg-sky-500/10" : "border-white/10 bg-slate-950/40"}`}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-lg font-semibold text-white">{item.title}</div>
                <div className="mt-2 text-sm text-zinc-400">{item.description}</div>
              </div>
              <button onClick={() => dismiss(item.id)} className="rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-300">Dismiss</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
