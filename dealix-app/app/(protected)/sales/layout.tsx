import type { Metadata } from "next";
export const metadata: Metadata = { title: "Sales" };
export default function SalesLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
