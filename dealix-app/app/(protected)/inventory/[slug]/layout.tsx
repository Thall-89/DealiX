import type { Metadata } from "next";
export const metadata: Metadata = { title: "Inventory Item" };
export default function InventoryItemLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
