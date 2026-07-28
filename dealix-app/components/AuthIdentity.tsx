"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type Theme = "dark" | "light";
export type AuthIdentity = {
  userId: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  theme: Theme;
  hasLoggedInBefore: boolean;
};

type AuthIdentityContextValue = AuthIdentity & {
  preferredName: string;
  updateIdentity: (changes: Partial<Pick<AuthIdentity, "username" | "displayName" | "avatarUrl" | "bio" | "theme" | "hasLoggedInBefore">>) => void;
};

const AuthIdentityContext = createContext<AuthIdentityContextValue | null>(null);

export function AuthIdentityProvider({ identity, children }: { identity: AuthIdentity; children: React.ReactNode }) {
  const [currentIdentity, setCurrentIdentity] = useState(identity);
  const value = useMemo<AuthIdentityContextValue>(() => ({
    ...currentIdentity,
    preferredName: currentIdentity.username || currentIdentity.displayName || currentIdentity.email.split("@", 1)[0] || "there",
    updateIdentity: (changes) => setCurrentIdentity((current) => ({ ...current, ...changes })),
  }), [currentIdentity]);
  return <AuthIdentityContext.Provider value={value}>{children}</AuthIdentityContext.Provider>;
}

export function useAuthIdentity() {
  const identity = useContext(AuthIdentityContext);
  if (!identity) throw new Error("Authenticated identity is required inside protected routes.");
  return identity;
}
