import { ThemeProvider } from "@/components/theme-provider";
import "@nvii/ui/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";
import { Toaster as Toast } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nvii - Environment Variable Manager",
  description: "Modern environment variable manager for your projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <main className="flex-1 bg-muted/10 w-full h-screen min-h-[calc(100vh-64px)]">
            {children}
          </main>{" "}
        </ThemeProvider>
      </body>
    </html>
  );
}
