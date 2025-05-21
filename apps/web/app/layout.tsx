import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Lora } from "next/font/google";

import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";
import { ClerkProvider } from "@clerk/nextjs";
import { Metadata } from "next";
import { siteConfig } from "@/lib/site";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: ` %s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  keywords: [
    "Portofio",
    "Interactive",
    "Frontend Developer",
    "Developer in Africa",
    "Developer in Cameroon",
    "React",
    "Tailwind CSS",
    "Framer motion",
    "Animation",
    "Bossadi",
    "Zenith",
    "Nothing",
  ],
  creator: siteConfig.links.author,
  authors: [
    {
      name: siteConfig.links.author,
      url: siteConfig.links.authorSite,
    },
  ],
  icons: {
    icon: [
      { url: "/notpadd-light.png", media: "(prefers-color-scheme: dark)" },
      { url: "/notpadd-dark.png", media: "(prefers-color-scheme: light)" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@bossadizenith",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${GeistSans.className} ${GeistMono.variable} ${lora.variable} antialiased `}
        >
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
