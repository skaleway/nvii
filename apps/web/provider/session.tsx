"use client";

import { Session } from "@/lib/auth";
import { User } from "better-auth";
import { PropsWithChildren, createContext, useContext } from "react";

interface SessionContext {
  user: User;
  session: Session;
}

export const SessionContext = createContext<SessionContext | null>(null);

export const SessionProvider = ({
  children,
  value,
}: PropsWithChildren<{ value: SessionContext }>) => {
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
