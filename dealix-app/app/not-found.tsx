import Link from "next/link";

export default function NotFound() {
  return <main className="grid min-h-screen place-items-center bg-[#05070d] p-6 text-slate-100"><section className="max-w-md rounded-[28px] border border-white/10 bg-slate-950/70 p-8 text-center shadow-2xl"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">DealiX</p><h1 className="mt-3 text-3xl font-semibold">This page does not exist.</h1><p className="mt-3 text-sm leading-6 text-slate-400">The link may be outdated, or the page may have moved.</p><Link href="/" className="mt-6 inline-flex rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400">Return to DealiX</Link></section></main>;
}
