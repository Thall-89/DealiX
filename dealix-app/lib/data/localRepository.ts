import type { DealiXData } from "@/lib/store";
import type { DataRepository } from "@/lib/data/types";
const key = "dealix_data_v1";
export const localRepository: DataRepository = { mode: "local", configured: true, async load() { if (typeof window === "undefined") return null; const stored = window.localStorage.getItem(key); return stored ? JSON.parse(stored) as DealiXData : null; }, async save(snapshot) { if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(snapshot)); }, async exportData() { return this.load(); } };
