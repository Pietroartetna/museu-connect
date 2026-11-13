import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PublicDocument = { id: string; title: string; description: string | null; category: string; file_url: string | null; position: number; published: boolean };

export const documentsQuery = queryOptions({
  queryKey: ["public-documents"],
  queryFn: async () => {
    const { data, error } = await supabase.from("public_documents").select("*").order("category").order("position");
    if (error) throw error;
    return (data ?? []) as PublicDocument[];
  },
});

export function groupByCategory(docs: PublicDocument[]) {
  const map = new Map<string, PublicDocument[]>();
  for (const d of docs) map.set(d.category, [...(map.get(d.category) ?? []), d]);
  return [...map.entries()];
}
