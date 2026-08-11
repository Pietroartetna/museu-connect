import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StoredImage } from "@/components/StoredImage";
import { EntityGallery } from "@/components/EntityGallery";

export const Route = createFileRoute("/_authenticated/stanze")({
  head: () => ({
    meta: [
      { title: "Le stanze — Casa Museo Nicolosi" },
      {
        name: "description",
        content: "Gli ambienti ricostruiti della casa contadina etnea: cucina, camera, magazzino.",
      },
      { property: "og:title", content: "Le stanze — Casa Museo Nicolosi" },
      { property: "og:description", content: "Gli ambienti della casa contadina etnea." },
    ],
  }),
  component: StanzePage,
});

function StanzePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("id, name, description, image_url")
        .order("position");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <h1 className="text-3xl">Le stanze</h1>
      <p className="mt-2 text-muted-foreground">
        Ogni ambiente racconta un pezzo di vita rurale ai piedi dell'Etna.
      </p>

      {isLoading ? <p className="mt-8 text-sm text-muted-foreground">Caricamento…</p> : null}
      {!isLoading && (data?.length ?? 0) === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Nessuna stanza pubblicata. L'amministratore può aggiungerle dall'area amministrazione.
        </p>
      ) : null}

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((room) => (
          <article key={room.id} className="overflow-hidden rounded-xl border bg-card shadow-soft">
            <StoredImage reference={room.image_url} alt={room.name} className="h-48 w-full" />
            <div className="p-5">
              <h2 className="text-xl text-primary">{room.name}</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                {room.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
