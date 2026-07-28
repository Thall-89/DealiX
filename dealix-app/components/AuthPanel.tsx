"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { supabase, supabaseConfigured } from "@/lib/supabase/client";

const credentialsSchema = z.object({ email: z.string().email().max(254), password: z.string().min(12).max(128) });

function MailIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]"><path d="M4 6h16v12H4zM4 7l8 6 8-6" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function LockIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]"><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" /></svg>; }

export function AuthPanel({ mode = "signIn" }: { mode?: "signIn" | "signUp" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const signUp = mode === "signUp";

  const submit = async () => {
    const valid = credentialsSchema.safeParse({ email, password }).success;
    if (!valid) { setStatus("Use a valid email and a password of at least 12 characters."); return; }
    if (!supabase) { setStatus("Authentication is not configured for this deployment."); return; }
    setIsLoading(true);
    setStatus("");
    const emailPrefix = email.split("@", 1)[0]?.replace(/[^a-z0-9_]/gi, "").toLowerCase() || "user";
    const outcome = signUp
      ? await supabase.auth.signUp({ email, password, options: { data: { username: emailPrefix, display_name: emailPrefix } } })
      : await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    if (outcome.error) { setStatus(outcome.error.message); return; }
    if (!signUp || outcome.data.session) { router.replace("/"); router.refresh(); return; }
    setStatus("Account created. Check your email to confirm your account, then sign in.");
  };

  const resetPassword = async () => {
    if (!z.string().email().safeParse(email).success || !supabase) { setStatus("Enter your email address first."); return; }
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setIsLoading(false);
    setStatus(error ? error.message : "Password reset email requested. Check your inbox.");
  };

  const isError = /valid|error|failed|required|at least|configured|incorrect|invalid/i.test(status);
  return <section aria-labelledby="auth-heading" className="auth-panel w-full rounded-[22px] border border-white/[0.10] bg-slate-950/55 p-6 shadow-[0_24px_65px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-8">
    <div><p className="text-xs font-medium uppercase tracking-[0.16em] text-sky-300">DealiX workspace</p><h1 id="auth-heading" className="mt-3 text-3xl font-medium tracking-[-0.04em] text-white">{signUp ? "Create your DealiX Workspace" : "Welcome back 👋"}</h1><p className="mt-2 text-sm leading-6 text-slate-400">{signUp ? "Build your AI-powered PC flipping business from one workspace." : "Sign in to continue building your PC flipping business."}</p></div>
    {supabaseConfigured ? <div className="mt-8 space-y-5">
      <div><label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">Email address</label><div className="group relative"><input id="email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" placeholder="you@company.com" disabled={isLoading} className="h-12 w-full rounded-xl border border-white/[0.10] bg-white/[0.045] py-3 pr-4 pl-11 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/[0.16] focus:border-sky-400/65 focus:bg-sky-400/[0.045] focus:ring-4 focus:ring-sky-400/[0.10] disabled:cursor-not-allowed disabled:opacity-60" /><span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500 transition group-focus-within:text-sky-300"><MailIcon /></span></div></div>
      <div><div className="mb-2 flex items-center justify-between gap-4"><label htmlFor="password" className="text-sm font-medium text-slate-200">Password</label>{!signUp ? <button type="button" disabled={isLoading} onClick={resetPassword} className="text-xs font-medium text-sky-300 transition hover:text-sky-200">Forgot password?</button> : null}</div><div className="group relative"><input id="password" value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? "text" : "password"} autoComplete={signUp ? "new-password" : "current-password"} placeholder="At least 12 characters" disabled={isLoading} className="h-12 w-full rounded-xl border border-white/[0.10] bg-white/[0.045] py-3 pr-12 pl-11 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/[0.16] focus:border-sky-400/65 focus:bg-sky-400/[0.045] focus:ring-4 focus:ring-sky-400/[0.10] disabled:cursor-not-allowed disabled:opacity-60" /><span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500 transition group-focus-within:text-sky-300"><LockIcon /></span><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword((value) => !value)} disabled={isLoading} className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-xl text-slate-500 transition hover:text-slate-200">{showPassword ? "Hide" : "Show"}</button></div></div>
      <div aria-live="polite" className={`min-h-5 text-sm ${isError ? "text-rose-300" : "text-emerald-300"}`}>{status}</div>
      <button type="button" disabled={isLoading} onClick={submit} className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-b from-sky-400 to-blue-600 px-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.30)] transition duration-200 hover:-translate-y-0.5 hover:from-sky-300 hover:to-blue-500 hover:shadow-[0_14px_30px_rgba(37,99,235,0.36)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60">{isLoading ? "Please wait…" : signUp ? "Create workspace" : "Sign in to DealiX"}</button>
      <p className="text-center text-sm text-slate-400">{signUp ? "Already have an account?" : "New to DealiX?"} <Link href={signUp ? "/login" : "/signup"} className="font-medium text-sky-300 hover:text-sky-200">{signUp ? "Sign in" : "Create your workspace"}</Link></p>
    </div> : <div className="mt-8 rounded-xl border border-rose-300/15 bg-rose-300/[0.06] p-4 text-sm leading-6 text-rose-100/85">Authentication is not configured for this deployment. Add the required Supabase environment variables before allowing access.</div>}
  </section>;
}
