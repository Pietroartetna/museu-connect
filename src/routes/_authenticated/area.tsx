import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/lib/auth";
import { SocialLinks } from "@/components/SiteFooter";
import { StoredImage } from "@/components/StoredImage";

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

function truncate(text: string | null | undefined, n = 90) {
  if (!text) return "";
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > n ? `${flat.slice(0, n).trimEnd()}…` : flat;
}

function AreaHome() {
  const { data: profile } = useProfile();

  const { data: rooms } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("id, name, description, image_url")
        .order("position")
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const { data: artists } = useQuery({
    queryKey: ["artists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artists")
        .select("id, name, era, bio, image_url")
        .order("name")
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const { data: events } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, description, image_url, location, starts_at, is_paid, price")
        .order("starts_at", { ascending: true })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const { data: galleries } = useQuery({
    queryKey: ["galleries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("galleries")
        .select("id, title, description, cover_url")
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
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

      <PreviewSection
        title="Le stanze"
        to="/stanze"
        empty="Nessuna stanza pubblicata."
        items={(rooms ?? []).map((r) => ({
          id: r.id,
          to: "/stanze",
          image: r.image_url,
          title: r.name,
          text: truncate(r.description),
        }))}
      />

      <PreviewSection
        title="Artisti"
        to="/artisti"
        empty="Nessun artista pubblicato."
        items={(artists ?? []).map((a) => ({
          id: a.id,
          to: "/artisti",
          image: a.image_url,
          title: a.name,
          badge: a.era === "storico" ? "Storico" : "Contemporaneo",
          text: truncate(a.bio),
        }))}
      />

      <PreviewSection
        title="Eventi"
        to="/eventi"
        empty="Nessun evento in programma."
        items={(events ?? []).map((e) => ({
          id: e.id,
          to: "/eventi",
          image: e.image_url,
          title: e.title,
          badge:
            new Date(e.starts_at).toLocaleDateString("it-IT", {
              day: "numeric",
              month: "short",
            }) + (e.location ? ` · ${e.location}` : ""),
          text: truncate(e.description),
        }))}
      />

      <PreviewSection
        title="Gallerie"
        to="/gallerie"
        empty="Nessuna galleria pubblicata."
        items={(galleries ?? []).map((g) => ({
          id: g.id,
          to: "/gallerie",
          image: g.cover_url,
          title: g.title,
          text: truncate(g.description),
        }))}
      />

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

type PreviewItem = {
  id: string;
  to: string;
  image: string | null;
  title: string;
  text: string;
  badge?: string;
};

function PreviewSection({
  title,
  to,
  empty,
  items,
}: {
  title: string;
  to: string;
  empty: string;
  items: PreviewItem[];
}) {
  return (
    <section className="mt-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl text-primary">{title}</h2>
        <Link
          to={to}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          Vedi tutti <ArrowRight className="size-4" />
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          {empty}
        </p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.id}
              to={item.to}
              className="group overflow-hidden rounded-xl border bg-card shadow-soft transition-transform hover:-translate-y-0.5"
            >
              <StoredImage
                reference={item.image}
                alt={item.title}
                className="h-32 w-full"
              />
              <div className="p-4">
                {item.badge ? (
                  <span className="text-[11px] uppercase tracking-wide text-accent">
                    {item.badge}
                  </span>
                ) : null}
                <h3 className="text-lg text-primary">{item.title}</h3>
                {item.text ? (
                  <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
