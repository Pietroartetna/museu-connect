import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileText, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/storage";
import { documentsQuery } from "@/lib/documents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function DocumentsSection() {
  const qc = useQueryClient();
  const { data: docs = [] } = useQuery(documentsQuery);
  const [title, setTitle] = useState(""); const [category, setCategory] = useState("Brochure");
  const [description, setDescription] = useState(""); const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const refresh = () => qc.invalidateQueries({ queryKey: documentsQuery.queryKey });
  const categories = [...new Set(["Brochure", "Volantini", "Documenti", ...docs.map((d) => d.category)])];

  const add = async () => {
    if (!title.trim() || !file) return toast.error("Inserisci titolo e file");
    setBusy(true);
    try {
      const file_url = await uploadFile("museo", `documenti/${Date.now()}`, file, { optimize: false });
      const { error } = await supabase.from("public_documents").insert({ title: title.trim(), category: category.trim() || "Documenti", description: description.trim() || null, file_url, position: docs.length });
      if (error) throw error;
      toast.success("Documento pubblicato"); setTitle(""); setDescription(""); setFile(null); refresh();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Caricamento non riuscito"); }
    finally { setBusy(false); }
  };
  const update = async (id: string, patch: { published?: boolean }) => {
    const { error } = await supabase.from("public_documents").update(patch).eq("id", id);
    if (error) toast.error(error.message); else refresh();
  };
  const remove = async (id: string) => {
    if (!confirm("Eliminare il documento?")) return;
    const { error } = await supabase.from("public_documents").delete().eq("id", id);
    if (error) toast.error(error.message); else refresh();
  };

  return (
    <div>
      <h2 className="text-2xl">Documenti pubblici</h2>
      <p className="text-sm text-muted-foreground">Brochure, volantini e documenti scaricabili da tutti nella pagina Documenti.</p>
      <div className="mt-4 grid gap-3 rounded-xl border bg-card p-5 sm:grid-cols-2">
        <div><Label htmlFor="doc-title">Titolo</Label><Input id="doc-title" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div><Label htmlFor="doc-cat">Categoria (esistente o nuova)</Label><Input id="doc-cat" list="doc-cats" value={category} onChange={(e) => setCategory(e.target.value)} /><datalist id="doc-cats">{categories.map((c) => <option key={c} value={c} />)}</datalist></div>
        <div className="sm:col-span-2"><Label htmlFor="doc-desc">Descrizione (facoltativa)</Label><Input id="doc-desc" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        <div className="sm:col-span-2"><Label htmlFor="doc-file">File (PDF, Word, immagine…)</Label><Input id="doc-file" type="file" accept=".pdf,.doc,.docx,.odt,.xls,.xlsx,.ppt,.pptx,image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
        <Button className="sm:col-span-2" onClick={add} disabled={busy}><Upload className="size-4" />{busy ? "Caricamento…" : "Pubblica documento"}</Button>
      </div>
      <ul className="mt-6 space-y-2">
        {docs.map((d) => (
          <li key={d.id} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
            <FileText className="size-5 text-primary" />
            <div className="min-w-0 flex-1"><p className="font-medium">{d.title}</p><p className="text-xs text-muted-foreground">{d.category}{d.description ? ` · ${d.description}` : ""}</p></div>
            <label className="flex items-center gap-2 text-sm"><Switch checked={d.published} onCheckedChange={(v) => update(d.id, { published: v })} />Visibile</label>
            <Button size="icon" variant="ghost" aria-label="Elimina" onClick={() => remove(d.id)}><Trash2 className="size-4" /></Button>
          </li>
        ))}
        {docs.length === 0 ? <li className="text-sm text-muted-foreground">Nessun documento caricato.</li> : null}
      </ul>
    </div>
  );
}
