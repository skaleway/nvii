import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@workspace/ui/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import {
  SidebarProvider,
  SidebarInset,
} from "@workspace/ui/components/sidebar";
import { ProjectsProvider } from "@/components/projects-provider";
import { AppSidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Toaster } from "@workspace/ui/components/toaster";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Envi - Environment Variable Manager",
  description: "Modern environment variable manager for your projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <ProjectsProvider>
              <SidebarProvider>
                <AppSidebar variant="inset" collapsible="icon" />
                <SidebarInset>
                  <Header />
                  <main className="flex-1 overflow-auto">{children}</main>
                </SidebarInset>
              </SidebarProvider>
            </ProjectsProvider>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
