import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const contentFields = [
  ["site.name", "Nome del museo"], ["site.caption", "Intitolazione / didascalia"],
  ["home.eyebrow", "Scritta sopra il banner"], ["home.description", "Testo del banner iniziale"],
  ["home.history", "Presentazione nella pagina iniziale"], ["museo.history", "Storia"],
  ["museo.biography", "Biografia / approfondimento storico"],
  ["contact.address", "Indirizzo"], ["contact.phone", "Telefono"], ["contact.email", "Email"],
  ["contact.hours", "Orari"], ["contact.visits", "Informazioni sulle visite"],
  ["collection.0.title", "Ambienti — titolo"], ["collection.0.text", "Ambienti — descrizione"],
  ["collection.1.title", "Lavoro dei campi — titolo"], ["collection.1.text", "Lavoro dei campi — descrizione"],
  ["collection.2.title", "Casa e tessitura — titolo"], ["collection.2.text", "Casa e tessitura — descrizione"],
  ["collection.3.title", "Religiosità — titolo"], ["collection.3.text", "Religiosità — descrizione"],
] as const;

export function SiteContentSection() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Record<string,string>>({});
  const [files, setFiles] = useState<Record<string,File>>({});
  const [busy, setBusy] = useState(false);
  const { data = {} } = useQuery({ queryKey: ["site-content"], queryFn: async () => {
    const { data, error } = await supabase.from("site_content").select("id,value");
    if (error) throw error;
    return Object.fromEntries(data.map(r => [r.id,r.value]));
  }});
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    try {
      const values = { ...draft };
      for (const [id,file] of Object.entries(files)) values[id] = await uploadFile("museo", `site/${crypto.randomUUID()}`, file);
      if (Object.keys(values).length) {
        const { error } = await supabase.from("site_content").upsert(Object.entries(values).map(([id,value]) => ({id,value})));
        if (error) throw error;
      }
      await qc.invalidateQueries({queryKey:["site-content"]}); setDraft({}); setFiles({});
      toast.success("Contenuti salvati");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Salvataggio non riuscito"); }
    finally { setBusy(false); }
  }
  return <section><h2 className="text-2xl">Contenuti del sito</h2><form onSubmit={save} className="mt-6 grid gap-5 md:grid-cols-2">
    {([["home.banner","Banner pagina iniziale"],["museo.banner","Banner storia"]] as const).map(([id,label]) => <div key={id}><Label htmlFor={id}>{label}</Label><Input id={id} type="file" accept="image/*" onChange={e => {const file=e.target.files?.[0]; if(file) setFiles({...files,[id]:file});}} /></div>)}
    {contentFields.map(([id,label]) => <div key={id} className="space-y-2"><Label htmlFor={id}>{label}</Label><Textarea id={id} maxLength={12000} value={draft[id] ?? data[id] ?? ""} onChange={e => setDraft({...draft,[id]:e.target.value})} /></div>)}
    <div className="md:col-span-2"><Button disabled={busy} type="submit"><Save className="size-4" />{busy ? "Salvataggio…" : "Salva contenuti"}</Button></div>
  </form></section>;
}