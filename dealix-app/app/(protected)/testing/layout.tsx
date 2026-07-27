import type { Metadata } from "next";
export const metadata: Metadata = { title: "Testing" };
export default function TestingLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
