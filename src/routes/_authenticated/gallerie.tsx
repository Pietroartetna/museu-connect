import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StoredImage } from "@/components/StoredImage";
import { StoredVideo } from "@/components/StoredVideo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/gallerie")({
  head: () => ({
    meta: [
      { title: "Gallerie — Casa Museo Nicolosi" },
      {
        name: "description",
        content: "Raccolte fotografiche e video della Casa Museo della Civiltà Contadina di Nicolosi.",
      },
      { property: "og:title", content: "Gallerie — Casa Museo Nicolosi" },
      { property: "og:description", content: "Foto e video della memoria contadina, divisi per categoria." },
    ],
  }),
  component: GalleriePage,
});

function GalleriePage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("");

  const { data: galleries } = useQuery({
    queryKey: ["galleries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("galleries")
        .select("id, title, description, cover_url, category")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const categories = useMemo(
    () => Array.from(new Set((galleries ?? []).map((g) => g.category ?? "Generale"))).sort(),
    [galleries],
  );

  const grouped = useMemo(() => {
    const list = (galleries ?? []).filter(
      (g) => !category || (g.category ?? "Generale") === category,
    );
    const map = new Map<string, typeof list>();
    for (const g of list) {
      const key = g.category ?? "Generale";
      map.set(key, [...(map.get(key) ?? []), g]);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [galleries, category]);

  const { data: media } = useQuery({
    queryKey: ["gallery-images", openId],
    enabled: !!openId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("id, image_url, caption, media_type")
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
        Foto e video degli oggetti, delle feste e della vita quotidiana contadina, divisi per categoria.
      </p>

      {categories.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory("")}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              category === "" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted",
            )}
          >
            Tutte
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                category === c ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      ) : null}

      {(galleries?.length ?? 0) === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Nessuna galleria pubblicata.
        </p>
      ) : null}

      {grouped.map(([cat, list]) => (
        <section key={cat} className="mt-10">
          <h2 className="text-2xl text-primary">{cat}</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-3">
            {list.map((gallery) => (
              <button
                key={gallery.id}
                type="button"
                onClick={() => setOpenId(openId === gallery.id ? null : gallery.id)}
                className="overflow-hidden rounded-xl border bg-card text-left shadow-soft transition-transform hover:-translate-y-0.5"
              >
                <StoredImage reference={gallery.cover_url} alt={gallery.title} className="h-44 w-full" />
                <div className="p-4">
                  <h3 className="text-lg text-primary">{gallery.title}</h3>
                  <p className="text-sm text-muted-foreground">{gallery.description}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      ))}

      {openId ? (
        <section className="mt-10">
          <h2 className="text-2xl">
            {galleries?.find((g) => g.id === openId)?.title ?? "Galleria"}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(media ?? []).map((item) => (
              <figure key={item.id} className="overflow-hidden rounded-lg border bg-card">
                {item.media_type === "video" ? (
                  <StoredVideo reference={item.image_url} className="h-40 w-full" />
                ) : (
                  <StoredImage reference={item.image_url} alt={item.caption ?? ""} className="h-40 w-full" />
                )}
                {item.caption ? (
                  <figcaption className="p-2 text-xs text-muted-foreground">{item.caption}</figcaption>
                ) : null}
              </figure>
            ))}
            {(media?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">Nessun contenuto in questa galleria.</p>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
