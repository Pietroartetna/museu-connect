import type { ReactNode } from "react";
import { MuseumNav } from "@/components/MuseumNav";
import { SiteFooter } from "@/components/SiteFooter";

export function PublicMuseumLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <MuseumNav />
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
      <SiteFooter />
    </div>
  );
}