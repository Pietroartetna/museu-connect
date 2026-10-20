import { supabase } from "@/integrations/supabase/client";

export const ROOM_ENTITY_TYPE = "room";

export type RoomPhoto = {
  id: string;
  entity_id: string;
  image_url: string;
  caption: string | null;
  position: number;
};

export function photosForRoom(photos: RoomPhoto[], roomId: string): RoomPhoto[] {
  return photos.filter((photo) => photo.entity_id === roomId);
}

export const roomPhotosQuery = {
  queryKey: ["room-photos"],
  queryFn: async (): Promise<RoomPhoto[]> => {
    const { data, error } = await supabase.from("entity_images")
      .select("id, entity_id, image_url, caption, position")
      .eq("entity_type", ROOM_ENTITY_TYPE)
      .order("position").order("created_at");
    if (error) throw error;
    return data;
  },
};