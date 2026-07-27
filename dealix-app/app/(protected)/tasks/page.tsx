'use client';

import { useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { dealixStore, useDealiXData } from "@/lib/store";

export default function TasksPage() {
  const { tasks } = useDealiXData();

  const completedCount = useMemo(() => tasks.filter((task) => task.completed).length, [tasks]);

  const toggleTask = (id: string) => {
    const task = tasks.find((item) => item.id === id);
    if (task) dealixStore.updateTask({ ...task, completed: !task.completed, status: !task.completed ? "Completed" : "Open" });
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Workflow" title="Tasks" description="Track the work tied to each build, including priorities, notes, and due dates." />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-white/10 bg-slate-950/40 p-4 text-sm text-zinc-300">Open tasks: {tasks.filter((task) => !task.completed).length}</div>
        <div className="rounded-[24px] border border-white/10 bg-slate-950/40 p-4 text-sm text-zinc-300">Completed: {completedCount}</div>
        <div className="rounded-[24px] border border-white/10 bg-slate-950/40 p-4 text-sm text-zinc-300">Blocked: {tasks.filter((task) => task.status === "Blocked").length}</div>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="rounded-[28px] border border-white/10 bg-slate-950/40 p-5 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-semibold text-white">{task.title}</h2>
                  <span className={`rounded-full px-3 py-1 text-xs ${task.completed ? "bg-emerald-500/10 text-emerald-300" : task.priority === "High" ? "bg-amber-500/10 text-amber-300" : "bg-sky-500/10 text-sky-300"}`}>{task.priority}</span>
                </div>
                <div className="mt-3 text-sm text-zinc-400">Related build: {task.relatedBuild ?? "General"}</div>
                <div className="mt-1 text-sm text-zinc-400">Due date: {task.dueDate ?? "Not entered"}</div>
                <div className="mt-1 text-sm text-zinc-400">Status: {task.status}</div>
                <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">{task.notes ?? "No notes yet."}</div>
              </div>
              <label className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-300">
                <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} className="h-4 w-4 accent-sky-500" />
                Completed
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
