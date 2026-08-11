import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const menuItems = [
  { to: "/", label: "Home" },
  { to: "/museo", label: "Il Museo" },
  { to: "/auth", label: "Area soci" },
];

export function SiteHeader({ light = true }: { light?: boolean }) {
  const textClass = light
    ? "text-lava-foreground drop-shadow"
    : "text-foreground";

  return (
    <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-5">
      <Link
        to="/"
        className={`inline-flex items-center gap-2 font-display text-lg ${textClass}`}
      >
        Casa Museo · Nicolosi
      </Link>

      <div className="flex items-center gap-2">
        <Button asChild variant="secondary" size="sm" className="hidden sm:inline-flex">
          <Link to="/auth">Area soci</Link>
        </Button>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Apri menu"
              className={light ? "text-lava-foreground hover:bg-white/10" : ""}
            >
              <Menu className="size-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-3/4 max-w-sm">
            <SheetHeader>
              <SheetTitle className="font-display text-left">Menu</SheetTitle>
            </SheetHeader>
            <nav className="mt-8 flex flex-col gap-2">
              {menuItems.map((item) => (
                <SheetTrigger asChild key={item.to}>
                  <Link
                    to={item.to}
                    className="rounded-lg px-4 py-3 text-lg font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {item.label}
                  </Link>
                </SheetTrigger>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
