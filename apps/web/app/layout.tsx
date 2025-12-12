import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@nvii/ui/lib/utils";
import { siteConfig } from "@/lib/site";
import "@nvii/ui/globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type React from "react";
import local from "next/font/local";
import Link from "next/link";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const sans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const cooper = local({
  src: [
    {
      path: "../fonts/CooperBlkBT-Italic.ttf",
      weight: "900",
      style: "italic",
    },
    {
      path: "../fonts/CooperBlkBT-Regular.ttf",
      weight: "900",
      style: "normal",
    },

    {
      path: "../fonts/CooperLtBT-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/CooperBlkBT-Regular.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/CooperLtBT-Italic.ttf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../fonts/CooperBlkBT-Regular.ttf",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-cooper",
});

export const metadata: Metadata = {
  title: {
    template: `%s | ${siteConfig.name}`,
    default: siteConfig.name,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  alternates: {
    canonical: siteConfig.url,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(sans.className, geistMono.variable, cooper.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="flex-1 w-full h-screen min-h-[calc(100vh-64px)]">
            {children}
          </main>{" "}
        </ThemeProvider>
      </body>
    </html>
  );
}
