import type { Metadata } from "next";
export const metadata: Metadata = { title: "Build" };
export default function BuildLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
