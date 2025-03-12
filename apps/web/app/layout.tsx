import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode } from "react";

import "@repo/ui/globals.css";
import { Toaster } from "sonner";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
