import { Header } from "@/components/header";
import { ProjectsProvider } from "@/components/projects-provider";
import { auth } from "@/lib/auth";
import { SessionProvider } from "@/provider/session";
import { headers } from "next/headers";
import React from "react";

const AfterAuthLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <SessionProvider value={{ session, user: session.user }}>
      <ProjectsProvider>
        <Header />
        {children}
      </ProjectsProvider>
    </SessionProvider>
  );
};

export default AfterAuthLayout;
