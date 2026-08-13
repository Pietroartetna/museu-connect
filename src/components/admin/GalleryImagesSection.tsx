import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/storage";
import { StoredMedia } from "@/components/StoredMedia";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type MediaType = "image" | "video";

export function GalleryImagesSection() {
  const queryClient = useQueryClient();
  const [galleryId, setGalleryId] = useState("");
  const [caption, setCaption] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>("image");
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

  const { data: images } = useQuery({
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
      toast.success("File eliminato");
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
      const image_url = await uploadFile("museo", `gallerie/${galleryId}`, file, {
        optimize: mediaType === "image",
      });
      const { error } = await supabase
        .from("gallery_images")
        .insert({ gallery_id: galleryId, image_url, caption: caption || null, media_type: mediaType });
      if (error) throw error;
      toast.success(mediaType === "video" ? "Video aggiunto" : "Foto aggiunta e ottimizzata in WebP");
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
        <h2 className="text-2xl">Contenuti delle gallerie</h2>
        <p className="text-sm text-muted-foreground">
          Carica foto o video all'interno di una galleria esistente. Le foto vengono convertite
          automaticamente in WebP per un caricamento più veloce.
        </p>
      </div>

      <form onSubmit={add} className="grid gap-4 rounded-xl border bg-card p-5 shadow-soft md:grid-cols-4">
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
                {g.category ? `${g.category} — ${g.title}` : g.title}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mtype">Tipo di file</Label>
          <select
            id="mtype"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={mediaType}
            onChange={(e) => {
              setMediaType(e.target.value as MediaType);
              setFile(null);
            }}
          >
            <option value="image">Foto</option>
            <option value="video">Video</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cap">Didascalia</Label>
          <Input id="cap" value={caption} onChange={(e) => setCaption(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="img">{mediaType === "video" ? "Video" : "Foto"}</Label>
          <Input
            id="img"
            key={mediaType}
            type="file"
            accept={mediaType === "video" ? "video/*" : "image/*"}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <div className="md:col-span-4">
          <Button type="submit" disabled={busy}>
            {busy ? "Caricamento…" : "Carica file"}
          </Button>
        </div>
      </form>

      {galleryId ? (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {(images ?? []).map((img) => (
            <div key={img.id} className="overflow-hidden rounded-lg border bg-card">
              <StoredMedia
                reference={img.image_url}
                mediaType={img.media_type}
                alt={img.caption ?? ""}
                className="h-28 w-full"
              />
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
