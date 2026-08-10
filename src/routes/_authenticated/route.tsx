import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin, useProfile } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { StoredImage } from "@/components/StoredImage";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

const nav = [
  { to: "/area", label: "Home" },
  { to: "/stanze", label: "Stanze" },
  { to: "/artisti", label: "Artisti" },
  { to: "/eventi", label: "Eventi" },
  { to: "/gallerie", label: "Gallerie" },
  { to: "/profilo", label: "Profilo" },
] as const;

function AuthenticatedLayout() {
  const { data: profile } = useProfile();
  const { data: isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="surface-lava sticky top-0 z-20 shadow-soft">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-5 py-3">
          <Link to="/area" className="font-display text-base">
            Casa Museo · Nicolosi
          </Link>
          <nav className="flex flex-1 flex-wrap gap-1">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeProps={{ className: "bg-white/15" }}
                className="rounded-full px-3 py-1.5 text-sm opacity-90 transition-colors hover:bg-white/10"
              >
                {item.label}
              </Link>
            ))}
            {isAdmin ? (
              <Link
                to="/admin"
                activeProps={{ className: "bg-white/15" }}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-primary-foreground opacity-90 transition-colors hover:bg-white/10"
              >
                <Shield className="size-3.5" /> Amministrazione
              </Link>
            ) : null}
          </nav>
          <div className="flex items-center gap-2">
            <StoredImage
              reference={profile?.avatar_url ?? null}
              alt={profile ? `${profile.first_name} ${profile.last_name}` : "Socio"}
              className="size-8 rounded-full"
            />
            <Button size="icon" variant="ghost" onClick={signOut} aria-label="Esci">
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">
        <Outlet />
      </main>
    </div>
  );
}
