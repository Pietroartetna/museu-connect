import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSiteContent() {
  const query = useQuery({ queryKey: ["site-content"], queryFn: async () => {
    const { data, error } = await supabase.from("site_content").select("id,value");
    if (error) throw error;
    return Object.fromEntries(data.map(row => [row.id, row.value]));
  }});
  return (key: string, fallback: string) => query.data?.[key] ?? fallback;
}

export function useMuseumPages() {
  return useQuery({ queryKey: ["museum-pages"], queryFn: async () => {
    const { data, error } = await supabase.from("museum_pages").select("*").order("position");
    if (error) throw error;
    return data;
  }});
}