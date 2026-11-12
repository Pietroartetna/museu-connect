import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type GuideFileKind = "audio" | "pdf" | "image";
export type GuideLanguage = "it" | "en" | "all";

export type GuideFile = {
  id: string; stop_id: string; kind: string; language: string;
  label: string | null; file_url: string; position: number;
};
export type GuideStop = {
  id: string; number: number; title: string; subtitle: string | null;
  description: string | null; room_id: string | null; published: boolean;
  guide_files: GuideFile[];
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** QR codes point to the stop's permanent id, so renumbering never breaks printed labels. */
export function parseStopKey(key: string): { id: string } | { number: number } | null {
  const k = key.trim();
  if (UUID.test(k)) return { id: k.toLowerCase() };
  if (/^\d{1,5}$/.test(k)) return { number: Number(k) };
  return null;
}

export function stopUrl(origin: string, stopId: string) {
  return `${origin.replace(/\/$/, "")}/guida/${stopId}`;
}

/** Files for a language: exact language first, then files valid for every language. */
export function filesForLanguage(files: GuideFile[], kind: GuideFileKind, lang: "it" | "en") {
  return files
    .filter((f) => f.kind === kind && (f.language === lang || f.language === "all"))
    .sort((a, b) => (a.language === b.language ? a.position - b.position : a.language === lang ? -1 : 1));
}

export function guideAcceptFor(kind: GuideFileKind) {
  if (kind === "audio") return "audio/*,.mp3,.m4a,.aac,.wav,.ogg";
  if (kind === "pdf") return "application/pdf,.pdf";
  return "image/*";
}

const SELECT = "id, number, title, subtitle, description, room_id, published, guide_files(id, stop_id, kind, language, label, file_url, position)";

export const guideStopsQuery = queryOptions({
  queryKey: ["guide-stops"],
  queryFn: async () => {
    const { data, error } = await supabase.from("guide_stops").select(SELECT).order("number");
    if (error) throw error;
    return (data ?? []) as GuideStop[];
  },
});
