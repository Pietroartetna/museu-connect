import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/storage";
import { StoredImage } from "@/components/StoredImage";
import type { EntityType } from "@/components/EntityGallery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  entityType: EntityType;
  table: "rooms" | "artists" | "events";
  labelField: "name" | "title";
  title: string;
  description: string;
};

export function EntityImagesSection({ entityType, table, labelField, title, description }: Props) {
  const queryClient = useQueryClient();
  const [entityId, setEntityId] = useState("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: entities } = useQuery({
    queryKey: ["entity-picker", table],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select(`id, ${labelField}`)
        .order(labelField);
      if (error) throw error;
      return data as unknown as Array<Record<string, string>>;
    },
  });

  const { data: images } = useQuery({
    queryKey: ["entity-images", entityType, entityId],
    enabled: !!entityId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entity_images")
        .select("id, image_url, caption")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .order("position");
      if (error) throw error;
      return data;
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("entity_images").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Immagine eliminata");
      queryClient.invalidateQueries({ queryKey: ["entity-images"] });
    },
    onError: () => toast.error("Eliminazione non riuscita"),
  });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!entityId || !file) {
      toast.error("Seleziona un elemento e un'immagine");
      return;
    }
    setBusy(true);
    try {
      const image_url = await uploadFile("museo", `${entityType}/${entityId}`, file);
      const { error } = await supabase.from("entity_images").insert({
        entity_type: entityType,
        entity_id: entityId,
        image_url,
        caption: caption || null,
        position: images?.length ?? 0,
      });
      if (error) throw error;
      toast.success("Immagine aggiunta");
      setCaption("");
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ["entity-images"] });
    } catch {
      toast.error("Caricamento non riuscito");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <form
        onSubmit={add}
        className="grid gap-4 rounded-xl border bg-card p-5 shadow-soft md:grid-cols-3"
      >
        <div className="space-y-1.5">
          <Label htmlFor={`ent-${entityType}`}>Elemento</Label>
          <select
            id={`ent-${entityType}`}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={entityId}
            onChange={(e) => setEntityId(e.target.value)}
          >
            <option value="">Seleziona…</option>
            {(entities ?? []).map((item) => (
              <option key={item['id']} value={item['id']}>
                {item[labelField]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`cap-${entityType}`}>Didascalia</Label>
          <Input
            id={`cap-${entityType}`}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`img-${entityType}`}>Immagine</Label>
          <Input
            id={`img-${entityType}`}
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

      {entityId ? (
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
          {(images?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">Nessuna foto in questa galleria.</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
