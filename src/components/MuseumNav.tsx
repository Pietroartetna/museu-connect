import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  ["/museo", "Il Museo"],
  ["/stanze", "Stanze"],
  ["/artisti", "Artisti"],
  ["/eventi", "Eventi"],
  ["/gallerie", "Gallerie"],
] as const;

const FADE = 26;

/** Compact navigation bar that stays pinned to the top of the page while scrolling. */
export function MuseumNav() {
  const navRef = useRef<HTMLElement | null>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const update = () =>
      setEdges({
        left: el.scrollLeft > 2,
        right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2,
      });
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const mask = `linear-gradient(to right, ${edges.left ? "transparent" : "black"} 0, black ${FADE}px, black calc(100% - ${FADE}px), ${edges.right ? "transparent" : "black"} 100%)`;

  return (
    <header className="surface-lava sticky top-0 z-30 shadow-soft">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 sm:gap-3 sm:px-5">
        <Link to="/" className="shrink-0 font-display text-base leading-none">
          Casa Museo<span className="hidden sm:inline"> · Nicolosi</span>
        </Link>
        <nav
          ref={navRef}
          aria-label="Visita il museo"
          style={{ maskImage: mask, WebkitMaskImage: mask }}
          className="flex flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {navLinks.map(([to, label]) => (
            <Button
              key={to}
              asChild
              variant="ghost"
              size="sm"
              className="shrink-0 whitespace-nowrap px-2 text-xs sm:px-3 sm:text-sm"
            >
              <Link to={to} activeProps={{ className: "underline" }}>
                {label}
              </Link>
            </Button>
          ))}
        </nav>
        <Button asChild variant="secondary" size="sm" className="shrink-0">
          <Link to="/admin" aria-label="Amministrazione">
            <Lock className="size-4 sm:hidden" />
            <span className="hidden sm:inline">Amministrazione</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
