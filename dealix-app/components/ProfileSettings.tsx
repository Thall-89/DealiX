"use client";

import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";
import { useAuthIdentity } from "@/components/AuthIdentity";
import { ThemeToggle } from "@/components/ThemeProvider";

const profileSchema = z.object({
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,32}$/, "Use 3–32 lowercase letters, numbers, or underscores."),
  displayName: z.string().trim().min(1, "Enter a display name.").max(80),
  avatarUrl: z.string().trim().url("Enter a complete image URL or leave this blank.").max(2048).or(z.literal("")),
  bio: z.string().trim().max(500, "Keep your bio under 500 characters."),
});

export function ProfileSettings() {
  const identity = useAuthIdentity();
  const [username, setUsername] = useState(identity.username);
  const [displayName, setDisplayName] = useState(identity.displayName);
  const [avatarUrl, setAvatarUrl] = useState(identity.avatarUrl ?? "");
  const [bio, setBio] = useState(identity.bio ?? "");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const parsed = profileSchema.safeParse({ username, displayName, avatarUrl, bio });
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? "Check the profile fields and try again.");
      return;
    }
    if (!supabase) return;
    setSaving(true);
    setMessage("");
    const { error } = await supabase.from("profiles").update({
      username: parsed.data.username,
      display_name: parsed.data.displayName,
      avatar_url: parsed.data.avatarUrl || null,
      bio: parsed.data.bio || null,
    }).eq("id", identity.userId);
    setSaving(false);
    if (error) {
      setMessage(error.code === "23505" ? "That username is already taken." : "Your profile could not be saved. Please try again.");
      return;
    }
    identity.updateIdentity({ username: parsed.data.username, displayName: parsed.data.displayName, avatarUrl: parsed.data.avatarUrl || null, bio: parsed.data.bio || null });
    setMessage("Profile saved. Your greeting updated immediately.");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-sky-500/15 text-xl font-semibold text-sky-200">{(displayName || username || "D").slice(0, 1).toUpperCase()}</div>
          <div><h2 className="text-xl font-semibold text-white">Profile</h2><p className="mt-1 text-sm text-zinc-400">This is how DealiX addresses you around the workspace.</p></div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-zinc-300">Username<input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-white outline-none focus:border-sky-400/65 focus:ring-4 focus:ring-sky-400/10" /><span className="mt-1 block text-xs font-normal text-zinc-500">Used first in your dashboard greeting.</span></label>
          <label className="text-sm font-medium text-zinc-300">Display name<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name" className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-white outline-none focus:border-sky-400/65 focus:ring-4 focus:ring-sky-400/10" /></label>
        </div>
        <label className="mt-4 block text-sm font-medium text-zinc-300">Profile picture URL <span className="font-normal text-zinc-500">(optional placeholder support)</span><input value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} type="url" placeholder="https://…" className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-white outline-none placeholder:text-zinc-600 focus:border-sky-400/65 focus:ring-4 focus:ring-sky-400/10" /></label>
        <label className="mt-4 block text-sm font-medium text-zinc-300">Bio <span className="font-normal text-zinc-500">(optional)</span><textarea value={bio} onChange={(event) => setBio(event.target.value)} maxLength={500} rows={4} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-sky-400/65 focus:ring-4 focus:ring-sky-400/10" /></label>
        <div className="mt-5 flex flex-wrap items-center gap-3"><button type="button" disabled={saving} onClick={save} className="h-11 rounded-xl bg-sky-500 px-4 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving…" : "Save profile"}</button>{message ? <p aria-live="polite" className={message.includes("saved") ? "text-sm text-emerald-300" : "text-sm text-rose-300"}>{message}</p> : null}</div>
      </section>
      <aside className="space-y-6">
        <section className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl"><h2 className="text-xl font-semibold text-white">Appearance</h2><p className="mt-1 text-sm text-zinc-400">Your theme follows you to every signed-in device.</p><div className="mt-4"><ThemeToggle compact /></div></section>
        <section className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl"><h2 className="text-xl font-semibold text-white">Account</h2><p className="mt-1 text-sm text-zinc-400">Your email is kept here for account management only.</p><p className="mt-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300">{identity.email}</p></section>
      </aside>
    </div>
  );
}
