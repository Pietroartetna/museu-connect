import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/storage";
import { StoredImage } from "@/components/StoredImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function GalleryImagesSection() {
  const queryClient = useQueryClient();
  const [galleryId, setGalleryId] = useState("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: galleries } = useQuery({
    queryKey: ["galleries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("galleries").select("id, title").order("title");
      if (error) throw error;
      return data;
    },
  });

  const { data: images } = useQuery({
    queryKey: ["gallery-images", galleryId],
    enabled: !!galleryId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("id, image_url, caption")
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
      toast.success("Immagine eliminata");
      queryClient.invalidateQueries({ queryKey: ["gallery-images"] });
    },
  });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!galleryId || !file) {
      toast.error("Seleziona una galleria e un'immagine");
      return;
    }
    setBusy(true);
    try {
      const image_url = await uploadFile("museo", `gallerie/${galleryId}`, file);
      const { error } = await supabase
        .from("gallery_images")
        .insert({ gallery_id: galleryId, image_url, caption: caption || null });
      if (error) throw error;
      toast.success("Immagine aggiunta");
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
        <h2 className="text-2xl">Immagini delle gallerie</h2>
        <p className="text-sm text-muted-foreground">
          Carica le fotografie all'interno di una galleria esistente.
        </p>
      </div>

      <form onSubmit={add} className="grid gap-4 rounded-xl border bg-card p-5 shadow-soft md:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="gal">Galleria</Label>
          <select
            id="gal"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={galleryId}
            onChange={(e) => setGalleryId(e.target.value)}
          >
            <option value="">Seleziona…</option>
            {(galleries ?? []).map((g) => (
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
          <Label htmlFor="img">Immagine</Label>
          <Input
            id="img"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <div className="md:col-span-3">
          <Button type="submit" disabled={busy}>
            Carica immagine
          </Button>
        </div>
      </form>

      {galleryId ? (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {(images ?? []).map((img) => (
            <div key={img.id} className="overflow-hidden rounded-lg border bg-card">
              <StoredImage reference={img.image_url} alt={img.caption ?? ""} className="h-28 w-full" />
              <div className="flex items-center justify-between gap-1 p-2">
                <span className="truncate text-xs text-muted-foreground">{img.caption}</span>
                <button type="button" onClick={() => remove.mutate(img.id)} aria-label="Elimina">
                  <Trash2 className="size-4 text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
