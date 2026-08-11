import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StoredImage } from "@/components/StoredImage";

export type EntityType = "room" | "artist" | "event";

export function EntityGallery({
  entityType,
  entityId,
}: {
  entityType: EntityType;
  entityId: string;
}) {
  const { data } = useQuery({
    queryKey: ["entity-images", entityType, entityId],
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

  if (!data || data.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">Galleria</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {data.map((img) => (
          <figure key={img.id} className="overflow-hidden rounded-md border bg-background">
            <StoredImage
              reference={img.image_url}
              alt={img.caption ?? "Fotografia"}
              className="h-20 w-full"
            />
            {img.caption ? (
              <figcaption className="truncate p-1 text-[11px] text-muted-foreground">
                {img.caption}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </div>
  );
}
