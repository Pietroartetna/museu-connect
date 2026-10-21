import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const navLinks = [
  ["/museo", "Il Museo"],
  ["/stanze", "Stanze"],
  ["/artisti", "Artisti"],
  ["/eventi", "Eventi"],
  ["/gallerie", "Gallerie"],
] as const;

/** Compact navigation bar that stays pinned to the top of the page while scrolling. */
export function MuseumNav() {
  return (
    <header className="surface-lava sticky top-0 z-30 shadow-soft">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-2">
        <Link to="/" className="shrink-0 font-display text-base leading-none">
          Casa Museo · Nicolosi
        </Link>
        <nav
          aria-label="Visita il museo"
          className="flex flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {navLinks.map(([to, label]) => (
            <Button
              key={to}
              asChild
              variant="ghost"
              size="sm"
              className="shrink-0 whitespace-nowrap"
            >
              <Link to={to} activeProps={{ className: "underline" }}>
                {label}
              </Link>
            </Button>
          ))}
        </nav>
        <Button asChild variant="secondary" size="sm" className="shrink-0">
          <Link to="/admin">Amministrazione</Link>
        </Button>
      </div>
    </header>
  );
}
