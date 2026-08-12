import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/lib/auth";
import { SocialLinks } from "@/components/SiteFooter";

export const Route = createFileRoute("/_authenticated/area")({
  head: () => ({
    meta: [
      { title: "Area soci — Casa Museo Nicolosi" },
      { name: "description", content: "Panoramica delle aree della Casa Museo per i soci." },
      { property: "og:title", content: "Area soci — Casa Museo Nicolosi" },
      { property: "og:description", content: "Stanze, artisti, eventi e gallerie della Casa Museo." },
    ],
  }),
  component: AreaHome,
});

const cards = [
  { to: "/stanze", title: "Stanze", text: "Gli ambienti della casa contadina" },
  { to: "/artisti", title: "Artisti", text: "Maestri storici e contemporanei" },
  { to: "/eventi", title: "Eventi", text: "Iscriviti alle iniziative" },
  { to: "/gallerie", title: "Gallerie", text: "Raccolte fotografiche" },
] as const;

function AreaHome() {
  const { data: profile } = useProfile();

  const { data: counts } = useQuery({
    queryKey: ["area-counts"],
    queryFn: async () => {
      const [rooms, artists, events, galleries] = await Promise.all([
        supabase.from("rooms").select("id", { count: "exact", head: true }),
        supabase.from("artists").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("galleries").select("id", { count: "exact", head: true }),
      ]);
      return {
        "/stanze": rooms.count ?? 0,
        "/artisti": artists.count ?? 0,
        "/eventi": events.count ?? 0,
        "/gallerie": galleries.count ?? 0,
      } as Record<string, number>;
    },
  });

  return (
    <div>
      <h1 className="text-3xl">
        Benvenuto{profile?.first_name ? `, ${profile.first_name}` : ""}
      </h1>
      <p className="mt-2 text-muted-foreground">
        Esplora le aree della Casa Museo della Civiltà Contadina di Nicolosi.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="rounded-xl border bg-card p-5 shadow-soft transition-transform hover:-translate-y-0.5"
          >
            <p className="text-2xl text-primary">{counts?.[card.to] ?? 0}</p>
            <h2 className="mt-1 text-lg">{card.title}</h2>
            <p className="text-sm text-muted-foreground">{card.text}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-xl border bg-paper p-6">
        <h2 className="text-xl">Informazioni</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Via G. Garibaldi 58, 95052 Nicolosi (CT) — Tel. 095 910980 — Aperto da martedì a sabato
          dalle 9:30 alle 12:30.
        </p>
        <SocialLinks className="mt-4 flex flex-wrap gap-2" />
      </div>
    </div>
  );
}
