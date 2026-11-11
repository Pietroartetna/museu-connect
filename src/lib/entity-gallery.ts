import { supabase } from "@/integrations/supabase/client";
import type { RoomPhoto } from "./room-gallery";

export type GalleryEntityType = "room" | "artist";
export function entityPhotosQuery(entityType: GalleryEntityType) {
  return {
    queryKey: [entityType === "room" ? "room-photos" : "artist-photos"],
    queryFn: async (): Promise<RoomPhoto[]> => {
      const { data, error } = await supabase.from("entity_images")
        .select("id, entity_id, image_url, caption, position")
        .eq("entity_type", entityType).order("position").order("created_at");
      if (error) throw error;
      return data;
    },
  };
}