"use client";

import { User } from "@workspace/db";
import { PropsWithChildren, createContext, useContext } from "react";

interface SessionProviderContext {
  user: User;
}

export const SessionContext = createContext<SessionProviderContext | null>(
  null,
);

export const SessionProvider = ({
  children,
  value,
}: PropsWithChildren<{ value: SessionProviderContext }>) => {
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
