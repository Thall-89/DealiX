"use client";

import { createContext, useContext } from "react";

export type AuthIdentity = { userId: string; email: string; displayName: string };

const AuthIdentityContext = createContext<AuthIdentity | null>(null);

export function AuthIdentityProvider({ identity, children }: { identity: AuthIdentity; children: React.ReactNode }) {
  return <AuthIdentityContext.Provider value={identity}>{children}</AuthIdentityContext.Provider>;
}

export function useAuthIdentity() {
  const identity = useContext(AuthIdentityContext);
  if (!identity) throw new Error("Authenticated identity is required inside protected routes.");
  return identity;
}
