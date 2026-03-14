import type { Metadata } from "next";

import "@/app/globals.css";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "AI Network Operations Center",
  description: "5G network monitoring, slice operations, and AI-assisted diagnosis."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
