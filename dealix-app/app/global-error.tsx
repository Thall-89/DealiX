"use client";

export default function GlobalError({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return <html lang="en"><body className="m-0 grid min-h-screen place-items-center bg-[#05070d] p-6 font-sans text-slate-100"><main role="alert" className="max-w-md rounded-3xl border border-white/10 bg-slate-950 p-8 text-center shadow-2xl"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">DealiX</p><h1 className="mt-3 text-2xl font-semibold">Something went wrong.</h1><p className="mt-3 text-sm leading-6 text-slate-400">Your workspace data is safe. Please try loading DealiX again.</p><button type="button" onClick={() => unstable_retry()} className="mt-6 rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white">Try again</button></main></body></html>;
}
