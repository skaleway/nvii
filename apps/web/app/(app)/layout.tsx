import { auth } from "@/lib/auth";
import { ProjectsProvider } from "@/components/projects-provider";
import { SessionProvider } from "@/provider/session";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import { Header } from "@/components/header";

const AfterAuthLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-in");
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
