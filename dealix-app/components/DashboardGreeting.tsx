"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuthIdentity } from "@/components/AuthIdentity";

const returningGreetings = ["Hey", "Hello", "Welcome back", "Good to see you", "Glad you’re back"];

function dailyGreeting(userId: string) {
  const seed = `${userId}:${new Date().toDateString()}`;
  const hash = [...seed].reduce((value, character) => ((value << 5) - value + character.charCodeAt(0)) | 0, 0);
  return returningGreetings[Math.abs(hash) % returningGreetings.length];
}

export function useDashboardGreeting() {
  const { userId, preferredName, hasLoggedInBefore, updateIdentity } = useAuthIdentity();

  useEffect(() => {
    if (hasLoggedInBefore) return;
    updateIdentity({ hasLoggedInBefore: true });
    void supabase?.from("profiles").update({ has_logged_in_before: true }).eq("id", userId);
  }, [hasLoggedInBefore, updateIdentity, userId]);

  const title = hasLoggedInBefore
    ? `${dailyGreeting(userId)}, ${preferredName} 👋`
    : `Welcome to DealiX, ${preferredName}! 👋`;
  const description = hasLoggedInBefore
    ? "Ready to find your next profitable deal?"
    : "Let’s build your PC flipping business from one workspace.";
  return { title, description };
}
