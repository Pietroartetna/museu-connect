import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StoredImage } from "@/components/StoredImage";

export const Route = createFileRoute("/_authenticated/gallerie")({
  head: () => ({
    meta: [
      { title: "Gallerie — Casa Museo Nicolosi" },
      {
        name: "description",
        content: "Raccolte fotografiche della Casa Museo della Civiltà Contadina di Nicolosi.",
      },
      { property: "og:title", content: "Gallerie — Casa Museo Nicolosi" },
      { property: "og:description", content: "Fotografie degli oggetti e della memoria contadina." },
    ],
  }),
  component: GalleriePage,
});

function GalleriePage() {
  const [openId, setOpenId] = useState<string | null>(null);

  const { data: galleries } = useQuery({
    queryKey: ["galleries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("galleries")
        .select("id, title, description, cover_url")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: images } = useQuery({
    queryKey: ["gallery-images", openId],
    enabled: !!openId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("id, image_url, caption")
        .eq("gallery_id", openId!)
        .order("position");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <h1 className="text-3xl">Gallerie</h1>
      <p className="mt-2 text-muted-foreground">
        Immagini degli oggetti, delle feste e della vita quotidiana contadina.
      </p>

      {(galleries?.length ?? 0) === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Nessuna galleria pubblicata.
        </p>
      ) : null}

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {(galleries ?? []).map((gallery) => (
          <button
            key={gallery.id}
            type="button"
            onClick={() => setOpenId(openId === gallery.id ? null : gallery.id)}
            className="overflow-hidden rounded-xl border bg-card text-left shadow-soft transition-transform hover:-translate-y-0.5"
          >
            <StoredImage reference={gallery.cover_url} alt={gallery.title} className="h-44 w-full" />
            <div className="p-4">
              <h2 className="text-lg text-primary">{gallery.title}</h2>
              <p className="text-sm text-muted-foreground">{gallery.description}</p>
            </div>
          </button>
        ))}
      </div>

      {openId ? (
        <section className="mt-10">
          <h2 className="text-2xl">
            {galleries?.find((g) => g.id === openId)?.title ?? "Galleria"}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(images ?? []).map((img) => (
              <figure key={img.id} className="overflow-hidden rounded-lg border bg-card">
                <StoredImage reference={img.image_url} alt={img.caption ?? ""} className="h-40 w-full" />
                {img.caption ? (
                  <figcaption className="p-2 text-xs text-muted-foreground">{img.caption}</figcaption>
                ) : null}
              </figure>
            ))}
            {(images?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">Nessuna immagine in questa galleria.</p>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
