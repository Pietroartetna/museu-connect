import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/storage";
import { StoredImage } from "@/components/StoredImage";
import { StoredVideo } from "@/components/StoredVideo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function GalleryImagesSection() {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState("");
  const [galleryId, setGalleryId] = useState("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: galleries } = useQuery({
    queryKey: ["galleries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("galleries")
        .select("id, title, category")
        .order("category")
        .order("title");
      if (error) throw error;
      return data;
    },
  });

  const categories = useMemo(
    () => Array.from(new Set((galleries ?? []).map((g) => g.category ?? "Generale"))).sort(),
    [galleries],
  );

  const visibleGalleries = (galleries ?? []).filter(
    (g) => !category || (g.category ?? "Generale") === category,
  );

  const { data: media } = useQuery({
    queryKey: ["gallery-images", galleryId],
    enabled: !!galleryId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("id, image_url, caption, media_type")
        .eq("gallery_id", galleryId)
        .order("position");
      if (error) throw error;
      return data;
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gallery_images").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Contenuto eliminato");
      queryClient.invalidateQueries({ queryKey: ["gallery-images"] });
    },
  });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!galleryId || !file) {
      toast.error("Seleziona una galleria e un file");
      return;
    }
    setBusy(true);
    try {
      const image_url = await uploadFile("museo", `gallerie/${galleryId}`, file);
      const media_type = file.type.startsWith("video") ? "video" : "image";
      const { error } = await supabase
        .from("gallery_images")
        .insert({ gallery_id: galleryId, image_url, caption: caption || null, media_type });
      if (error) throw error;
      toast.success(media_type === "video" ? "Video aggiunto" : "Foto aggiunta");
      setCaption("");
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ["gallery-images"] });
    } catch {
      toast.error("Caricamento non riuscito");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl">Foto e video delle gallerie</h2>
        <p className="text-sm text-muted-foreground">
          Scegli la categoria, poi la galleria, e carica foto o video. Puoi eliminarli in qualsiasi
          momento.
        </p>
      </div>

      <form onSubmit={add} className="grid gap-4 rounded-xl border bg-card p-5 shadow-soft md:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="cat">Categoria</Label>
          <select
            id="cat"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setGalleryId("");
            }}
          >
            <option value="">Tutte</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="gal">Galleria</Label>
          <select
            id="gal"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={galleryId}
            onChange={(e) => setGalleryId(e.target.value)}
          >
            <option value="">Seleziona…</option>
            {visibleGalleries.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cap">Didascalia</Label>
          <Input id="cap" value={caption} onChange={(e) => setCaption(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="img">Foto o video</Label>
          <Input
            id="img"
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <div className="md:col-span-4">
          <Button type="submit" disabled={busy}>
            Carica contenuto
          </Button>
        </div>
      </form>

      {galleryId ? (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {(media ?? []).map((item) => (
            <div key={item.id} className="overflow-hidden rounded-lg border bg-card">
              {item.media_type === "video" ? (
                <StoredVideo reference={item.image_url} className="h-28 w-full" />
              ) : (
                <StoredImage reference={item.image_url} alt={item.caption ?? ""} className="h-28 w-full" />
              )}
              <div className="flex items-center justify-between gap-1 p-2">
                <span className="truncate text-xs text-muted-foreground">{item.caption}</span>
                <button type="button" onClick={() => remove.mutate(item.id)} aria-label="Elimina">
                  <Trash2 className="size-4 text-destructive" />
                </button>
              </div>
            </div>
          ))}
          {(media?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">Nessun contenuto in questa galleria.</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
