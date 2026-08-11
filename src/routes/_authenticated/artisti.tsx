import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StoredImage } from "@/components/StoredImage";
import { EntityGallery } from "@/components/EntityGallery";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/artisti")({
  head: () => ({
    meta: [
      { title: "Artisti — Casa Museo Nicolosi" },
      {
        name: "description",
        content: "Artisti storici e contemporanei legati alla Casa Museo della Civiltà Contadina.",
      },
      { property: "og:title", content: "Artisti — Casa Museo Nicolosi" },
      { property: "og:description", content: "Maestri di ieri e voci contemporanee del territorio." },
    ],
  }),
  component: ArtistiPage,
});

function ArtistiPage() {
  const [filter, setFilter] = useState<"tutti" | "storico" | "contemporaneo">("tutti");

  const { data } = useQuery({
    queryKey: ["artists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artists")
        .select("id, name, era, bio, image_url")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const list = (data ?? []).filter((a) => filter === "tutti" || a.era === filter);

  return (
    <div>
      <h1 className="text-3xl">Artisti</h1>
      <p className="mt-2 text-muted-foreground">
        Le mani e le storie che hanno dato forma alla tradizione nicolosita.
      </p>

      <div className="mt-6 flex gap-2">
        {(["tutti", "storico", "contemporaneo"] as const).map((value) => (
          <Button
            key={value}
            size="sm"
            variant={filter === value ? "default" : "outline"}
            onClick={() => setFilter(value)}
          >
            {value === "tutti" ? "Tutti" : value === "storico" ? "Storici" : "Contemporanei"}
          </Button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Nessun artista pubblicato in questa sezione.
        </p>
      ) : null}

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {list.map((artist) => (
          <article key={artist.id} className="overflow-hidden rounded-xl border bg-card shadow-soft">
            <StoredImage reference={artist.image_url} alt={artist.name} className="h-52 w-full" />
            <div className="p-5">
              <span className="text-xs uppercase tracking-wide text-accent">
                {artist.era === "storico" ? "Artista storico" : "Artista contemporaneo"}
              </span>
              <h2 className="mt-1 text-xl text-primary">{artist.name}</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{artist.bio}</p>
              <EntityGallery entityType="artist" entityId={artist.id} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
