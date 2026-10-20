import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/SiteFooter";

export function PublicMuseumLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="surface-lava">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-5 py-4">
          <Link to="/" className="font-display text-lg">Casa Museo · Nicolosi</Link>
          <nav aria-label="Visita il museo" className="flex flex-1 flex-wrap gap-1">
            {([
              ["/museo", "Il Museo"], ["/stanze", "Stanze"], ["/artisti", "Artisti"],
              ["/eventi", "Eventi"], ["/gallerie", "Gallerie"],
            ] as const).map(([to, label]) => (
              <Button key={to} asChild variant="ghost" size="sm">
                <Link to={to} activeProps={{ className: "underline" }}>{label}</Link>
              </Button>
            ))}
          </nav>
          <Button asChild variant="secondary" size="sm"><Link to="/admin">Amministrazione</Link></Button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
      <SiteFooter />
    </div>
  );
}