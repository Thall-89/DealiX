import type { Metadata } from "next";
export const metadata: Metadata = { title: "AI Assistant" };
export default function AiLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
