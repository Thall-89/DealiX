"use client";

export default function ProtectedError({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return <section role="alert" className="rounded-[28px] border border-rose-400/20 bg-rose-500/[0.07] p-6 text-center"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-300">Workspace issue</p><h1 className="mt-2 text-2xl font-semibold text-white">This part of DealiX could not load.</h1><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-zinc-400">Your saved information is still protected. Try loading this screen again.</p><button type="button" onClick={() => unstable_retry()} className="mt-5 rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400">Try again</button></section>;
}
