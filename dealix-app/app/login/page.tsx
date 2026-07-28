import { AuthPanel } from "@/components/AuthPanel";
import Image from "next/image";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Sign In" };

const features = ["Build Management", "Inventory Tracking", "Market Intelligence", "Profit Analytics", "Business Dashboard"];

function FeatureMark({ index }: { index: number }) {
  const paths = ["M4 12.5 9 17l11-12", "M5 4h14v16H5zM9 8h6M9 12h4", "M4 17.5 10 11l4 3 6-7", "M5 18V9m5 9V5m5 13v-7m5 7V3", "M5 17.5h14M7 15l3-4 3 2 4-6", "M5 5h14v14H5zM9 9h6M9 13h6"];
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.7]">{paths[index].split("M").filter(Boolean).map((path, pathIndex) => <path key={pathIndex} d={`M${path}`} strokeLinecap="round" strokeLinejoin="round" />)}</svg>;
}

export default async function LoginPage() {
  if (await getServerUser()) redirect("/");
  return <main className="auth-page min-h-screen bg-[#080b13] p-3 text-zinc-100 sm:p-5 lg:p-6"><div className="auth-shell relative mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1580px] overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0b0f19] shadow-2xl shadow-black/30 md:min-h-[calc(100vh-2.5rem)] md:grid-cols-[minmax(0,0.86fr)_minmax(420px,1fr)] lg:min-h-[calc(100vh-3rem)] lg:grid-cols-[minmax(0,1fr)_minmax(500px,0.95fr)]">
    <section className="relative hidden overflow-hidden border-r border-white/[0.07] bg-[radial-gradient(circle_at_24%_18%,rgba(57,137,255,0.20),transparent_28%),radial-gradient(circle_at_70%_72%,rgba(87,67,221,0.14),transparent_34%),linear-gradient(145deg,#111a2c_0%,#0b1120_48%,#090d16_100%)] p-8 md:flex md:flex-col md:p-10 lg:p-14">
      <div aria-hidden="true" className="absolute inset-0 opacity-[0.15] [background-image:linear-gradient(rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.16)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
      <div className="relative flex h-24 items-center"><Image src="/brand/dealix-logo-dark.svg" alt="DealiX" width={234} height={44} priority sizes="234px" className="brand-logo-dark h-auto w-[234px] max-w-full object-contain object-left" /><Image src="/brand/dealix-logo-light.svg" alt="DealiX" width={234} height={44} priority sizes="234px" className="brand-logo-light h-auto w-[234px] max-w-full object-contain object-left" /></div>
      <div className="relative my-auto max-w-xl py-14"><p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-sky-300/80">Built for independent operators</p><h1 className="max-w-lg text-4xl font-medium leading-[1.08] tracking-[-0.045em] text-white lg:text-5xl">The AI Operating System for PC Flipping.</h1><p className="mt-6 max-w-lg text-base leading-7 text-slate-300/85 lg:text-lg">Source parts, manage inventory, understand profitability, monitor the market, and build a more capable flipping business from one calm workspace.</p><div className="mt-11 grid max-w-xl grid-cols-1 gap-x-8 gap-y-4 lg:grid-cols-2">{features.map((feature, index) => <div key={feature} className="flex items-center gap-3 text-sm text-slate-200"><span className="grid h-7 w-7 place-items-center rounded-md border border-white/[0.09] bg-white/[0.045] text-sky-200"><FeatureMark index={index} /></span>{feature}</div>)}</div></div>
      <p className="relative text-xs text-slate-500">A considered workspace for the business behind every build.</p>
    </section>
    <section className="relative flex min-h-[calc(100vh-1.5rem)] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_80%_14%,rgba(57,137,255,0.10),transparent_28%),linear-gradient(145deg,#0d111c,#0a0e17)] p-5 sm:p-8 md:min-h-0 md:p-10 lg:p-14"><div aria-hidden="true" className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sky-500/[0.08] blur-3xl" /><div className="relative w-full max-w-[470px]"><div className="mb-9 flex h-14 items-center md:hidden"><Image src="/brand/dealix-logo-dark.svg" alt="DealiX" width={224} height={42} priority sizes="224px" className="brand-logo-dark h-auto w-[224px] max-w-full object-contain object-left" /><Image src="/brand/dealix-logo-light.svg" alt="DealiX" width={224} height={42} priority sizes="224px" className="brand-logo-light h-auto w-[224px] max-w-full object-contain object-left" /></div><AuthPanel /><p className="mt-6 text-center text-xs leading-5 text-slate-500">By continuing, you acknowledge that DealiX keeps your workspace private to your account.</p></div></section>
  </div></main>;
}
