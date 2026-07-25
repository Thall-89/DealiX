"use client";

import { useSyncExternalStore } from "react";
import {
  builds,
  inventoryItems,
  notifications,
  settingsDefaults,
  tasks,
  testingChecklist,
} from "@/lib/mockData";
import type {
  Build,
  InventoryItem,
  NotificationItem,
  Settings,
  TaskItem,
  TestingResult,
} from "@/types";

const STORAGE_KEY = "dealix_data_v1";

export interface DealiXData {
  builds: Build[];
  inventory: InventoryItem[];
  tasks: TaskItem[];
  notifications: NotificationItem[];
  settings: Settings;
  testingResults: Record<string, TestingResult>;
}

function cloneSeedData(): DealiXData {
  return {
    builds: structuredClone(builds),
    inventory: structuredClone(inventoryItems),
    tasks: structuredClone(tasks),
    notifications: structuredClone(notifications),
    settings: structuredClone(settingsDefaults),
    testingResults: {},
  };
}

const serverSnapshot = cloneSeedData();
let data = serverSnapshot;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<DealiXData>;
      data = {
        ...cloneSeedData(),
        ...parsed,
        testingResults: parsed.testingResults ?? {},
      };
    }
  } catch {
    data = cloneSeedData();
  }
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function emit() {
  persist();
  listeners.forEach((listener) => listener());
}

function setData(next: DealiXData) {
  data = next;
  emit();
}

export const dealixStore = {
  getSnapshot() {
    load();
    return data;
  },
  subscribe(listener: () => void) {
    load();
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  updateBuild(build: Build) {
    const previous = data.builds.find((item) => item.id === build.id);
    const missingPartNames = new Set((build.partsNeeded ?? []).map((part) => part.name.toLowerCase()));
    const reconciledTasks: TaskItem[] = data.tasks.map((task) => {
      if (task.buildId !== build.id || !task.title.startsWith("Find missing part:")) return task;
      const partName = task.title.replace("Find missing part:", "").trim().toLowerCase();
      return missingPartNames.has(partName) ? task : { ...task, completed: true, status: "Completed" as const };
    });
    const newTasks = (build.partsNeeded ?? []).filter((part) => !reconciledTasks.some((task) => task.buildId === build.id && task.title.toLowerCase() === `find missing part: ${part.name}`.toLowerCase())).map((part) => ({
      id: `task-missing-${crypto.randomUUID()}`,
      title: `Find missing part: ${part.name}`,
      buildId: build.id,
      relatedBuild: build.name,
      priority: part.priority,
      status: "Blocked" as const,
      completed: false,
      notes: part.details,
    }));
    const status = previous?.partsNeeded?.length && !build.partsNeeded?.length && build.status === "Active" ? "Active" : build.status;
    setData({ ...data, builds: data.builds.map((item) => (item.id === build.id ? { ...build, status } : item)), tasks: [...reconciledTasks, ...newTasks] });
  },
  addBuild(build: Build) {
    data = { ...data, builds: [...data.builds, build] };
    this.updateBuild(build);
  },
  deleteBuild(id: string) {
    setData({ ...data, builds: data.builds.filter((build) => build.id !== id), tasks: data.tasks.filter((task) => task.buildId !== id) });
  },
  updateInventory(item: InventoryItem) {
    setData({ ...data, inventory: data.inventory.map((entry) => (entry.id === item.id ? item : entry)) });
  },
  addInventory(item: InventoryItem) {
    setData({ ...data, inventory: [...data.inventory, item] });
  },
  deleteInventory(id: string) {
    setData({ ...data, inventory: data.inventory.filter((item) => item.id !== id) });
  },
  updateTask(task: TaskItem) {
    setData({ ...data, tasks: data.tasks.map((item) => (item.id === task.id ? task : item)) });
  },
  dismissNotification(id: string) {
    setData({ ...data, notifications: data.notifications.map((item) => (item.id === id ? { ...item, dismissed: true, unread: false } : item)) });
  },
  updateSettings(settings: Settings) {
    setData({ ...data, settings });
  },
  updateTestingResult(result: TestingResult) {
    const build = data.builds.find((item) => item.id === result.buildId);
    const hasFailure = Boolean(result.failedPart);
    const repairTitle = `Repair or replace failed part: ${result.failedPart}`;
    const repairTaskExists = data.tasks.some((task) => task.buildId === result.buildId && task.title === repairTitle && !task.completed);
    const nextTasks = hasFailure && result.createRepairTask === false ? data.tasks.filter((task) => task.title !== repairTitle || task.buildId !== result.buildId) : hasFailure && !repairTaskExists ? [...data.tasks, { id: `task-repair-${crypto.randomUUID()}`, title: repairTitle, buildId: result.buildId, relatedBuild: build?.name, priority: "High" as const, status: "Open" as const, completed: false, notes: "Created from the testing workflow." }] : data.tasks;
    const nextNotifications = hasFailure ? [...data.notifications.filter((item) => item.id !== `testing-failure-${result.buildId}`), { id: `testing-failure-${result.buildId}`, title: `${build?.name ?? "Build"} has a failed test`, description: `${result.failedPart} needs attention before the build is ready.`, unread: true }] : data.notifications;
    setData({ ...data, tasks: nextTasks, notifications: nextNotifications, testingResults: { ...data.testingResults, [result.buildId]: result } });
  },
  assignMockMotherboard(buildId: string, motherboard: string, explanation: string) {
    const build = data.builds.find((item) => item.id === buildId);
    if (!build) return;
    this.updateBuild({ ...build, motherboard, partsNeeded: (build.partsNeeded ?? []).filter((part) => part.name.toLowerCase() !== "compatible motherboard"), notes: `${build.notes ?? ""}\nMock compatibility candidate selected: ${motherboard}. ${explanation}`.trim(), health: "Needs attention" });
  },
  resetDemoData() {
    setData(cloneSeedData());
  },
};

export function useDealiXData() {
  return useSyncExternalStore(dealixStore.subscribe, dealixStore.getSnapshot, () => serverSnapshot);
}

export function getDashboardMetrics(snapshot: DealiXData) {
  const soldBuilds = snapshot.builds.filter((build) => build.status === "Sold");
  const activeBuilds = snapshot.builds.filter((build) => build.status === "Active");
  const listedBuilds = snapshot.builds.filter((build) => build.status === "Listed");
  const confirmedNetProfit = soldBuilds.reduce((total, build) => total + (build.netProfit ?? 0), 0);
  const totalRecordedBuildCost = snapshot.builds.reduce((total, build) => total + build.buildCost, 0);

  return {
    confirmedNetProfit,
    completedSales: soldBuilds.length,
    activeBuilds: activeBuilds.length,
    listedBuilds: listedBuilds.length,
    openBuilds: activeBuilds.length + listedBuilds.length,
    totalRecordedBuildCost,
    pendingTasks: snapshot.tasks.filter((task) => !task.completed).length,
    unreadNotifications: snapshot.notifications.filter((notification) => notification.unread && !notification.dismissed).length,
  };
}

export function createDefaultTestingResult(buildId: string): TestingResult {
  return {
    buildId,
    checklist: structuredClone(testingChecklist),
    notes: "Starting the workflow for the active build.",
    cpuTemp: "",
    gpuTemp: "",
    benchmark: "",
    failedPart: "",
    createRepairTask: true,
  };
}
