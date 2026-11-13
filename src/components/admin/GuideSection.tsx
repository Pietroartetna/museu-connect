import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Download, FileText, Headphones, Image as ImageIcon, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/storage";
import { guideAcceptFor, guideStopsQuery, stopUrl, type GuideFileKind, type GuideLanguage, type GuideStop } from "@/lib/guide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

// Printed labels must open the public site, never the editor preview.
const PUBLIC_SITE = "https://museu-connect.lovable.app";
const sel = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";
const kindIcon = { audio: Headphones, pdf: FileText, image: ImageIcon } as const;
const kindLabel = { audio: "Audio", pdf: "PDF / volantino", image: "Foto" } as const;
const langLabel = { it: "Italiano", en: "English", all: "Tutte le lingue" } as const;

type Draft = { id?: string; number: string; title: string; subtitle: string; description: string; room_id: string; published: boolean };
const empty = (n: number): Draft => ({ number: String(n), title: "", subtitle: "", description: "", room_id: "", published: true });

function QrPreview({ stop }: { stop: GuideStop }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    QRCode.toDataURL(stopUrl(PUBLIC_SITE, stop.id), { width: 1024, margin: 2, errorCorrectionLevel: "M" }).then(setSrc);
  }, [stop.id]);
  if (!src) return null;
  return (
    <div className="flex items-center gap-3">
      <img src={src} alt={`QR code tappa ${stop.number}`} className="size-20 rounded border bg-card" />
      <Button asChild size="sm" variant="outline"><a href={src} download={`qr-tappa-${stop.number}.png`}><Download className="size-4" />Scarica QR</a></Button>
    </div>
  );
}

function FileUploader({ stop, onDone }: { stop: GuideStop; onDone: () => Promise<void> }) {
  const [kind, setKind] = useState<GuideFileKind>("audio");
  const [lang, setLang] = useState<GuideLanguage>("it");
  const [label, setLabel] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    let reference: string | null = null;
    try {
      reference = await uploadFile("museo", `guida/${stop.id}/${crypto.randomUUID()}`, file, { optimize: kind === "image" });
      const { error } = await supabase.from("guide_files").insert({
        stop_id: stop.id, kind, language: lang, label: label.trim() || null, file_url: reference,
        position: stop.guide_files.length,
      });
      if (error) throw error;
      setFile(null); setLabel(""); if (ref.current) ref.current.value = "";
      await onDone();
      toast.success("File aggiunto alla tappa");
    } catch (err) {
      if (reference) await supabase.storage.from("museo").remove([reference.slice("museo/".length)]);
      toast.error(err instanceof Error ? err.message : "Caricamento non riuscito");
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={add} className="grid gap-3 rounded-lg border border-dashed p-3 sm:grid-cols-2 lg:grid-cols-4">
      <div><Label>Tipo</Label><select className={sel} value={kind} onChange={(e) => { setKind(e.target.value as GuideFileKind); setFile(null); if (ref.current) ref.current.value = ""; }}>
        {(Object.keys(kindLabel) as GuideFileKind[]).map((k) => <option key={k} value={k}>{kindLabel[k]}</option>)}</select></div>
      <div><Label>Lingua</Label><select className={sel} value={lang} onChange={(e) => setLang(e.target.value as GuideLanguage)}>
        {(Object.keys(langLabel) as GuideLanguage[]).map((l) => <option key={l} value={l}>{langLabel[l]}</option>)}</select></div>
      <div><Label>Titolo (facoltativo)</Label><Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Es. Racconto dell'opera" /></div>
      <div><Label>File</Label><Input ref={ref} type="file" accept={guideAcceptFor(kind)} onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
      <Button type="submit" disabled={!file || busy} className="sm:col-span-2 lg:col-span-4"><Upload className="size-4" />{busy ? "Caricamento…" : "Carica nel pacchetto"}</Button>
    </form>
  );
}

export function GuideSection() {
  const qc = useQueryClient();
  const { data: stops = [], isLoading } = useQuery(guideStopsQuery);
  const { data: rooms = [] } = useQuery({ queryKey: ["rooms", "guide-select"], queryFn: async () => (await supabase.from("rooms").select("id, name").order("position")).data ?? [] });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const refresh = () => qc.invalidateQueries({ queryKey: guideStopsQuery.queryKey });
  const nextNumber = Math.max(0, ...stops.map((s) => s.number)) + 1;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    const number = Number(draft.number);
    if (!Number.isInteger(number) || number < 1) { toast.error("Inserisci un numero valido"); return; }
    setBusy(true);
    const row = { number, title: draft.title.trim(), subtitle: draft.subtitle.trim() || null, description: draft.description.trim() || null, room_id: draft.room_id || null, published: draft.published };
    const { error } = draft.id ? await supabase.from("guide_stops").update(row).eq("id", draft.id) : await supabase.from("guide_stops").insert(row);
    setBusy(false);
    if (error) { toast.error(error.code === "23505" ? `Il numero ${number} è già usato da un'altra tappa` : error.message); return; }
    setDraft(null); await refresh(); toast.success("Tappa salvata");
  }

  async function removeStop(stop: GuideStop) {
    if (!window.confirm(`Eliminare la tappa ${stop.number} e tutti i suoi file? Il QR stampato non funzionerà più.`)) return;
    const paths = stop.guide_files.map((f) => f.file_url.slice("museo/".length));
    const { error } = await supabase.from("guide_stops").delete().eq("id", stop.id);
    if (error) { toast.error(error.message); return; }
    if (paths.length) await supabase.storage.from("museo").remove(paths);
    await refresh(); toast.success("Tappa eliminata");
  }

  async function removeFile(id: string, url: string) {
    if (!window.confirm("Eliminare questo file?")) return;
    const { error } = await supabase.from("guide_files").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    await supabase.storage.from("museo").remove([url.slice("museo/".length)]);
    await refresh();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl">Audioguida e QR code</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Ogni tappa ha un QR code permanente: puoi cambiare numero, testi e file quando vuoi senza ristampare la targhetta.</p>
        </div>
        <Button onClick={() => setDraft(empty(nextNumber))}><Plus className="size-4" />Nuova tappa</Button>
      </div>

      {draft ? (
        <form onSubmit={save} className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2">
          <div><Label>Numero</Label><Input type="number" min={1} required value={draft.number} onChange={(e) => setDraft({ ...draft, number: e.target.value })} /></div>
          <div><Label>Stanza</Label><select className={sel} value={draft.room_id} onChange={(e) => setDraft({ ...draft, room_id: e.target.value })}>
            <option value="">— Nessuna —</option>{rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
          <div><Label>Titolo opera / tappa</Label><Input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></div>
          <div><Label>Sottotitolo (autore, materiale…)</Label><Input value={draft.subtitle} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })} /></div>
          <div className="sm:col-span-2"><Label>Descrizione</Label><Textarea rows={4} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div>
          <label className="flex items-center gap-2 text-sm"><Switch checked={draft.published} onCheckedChange={(v) => setDraft({ ...draft, published: v })} />Visibile ai visitatori</label>
          <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setDraft(null)}>Annulla</Button><Button type="submit" disabled={busy}>Salva tappa</Button></div>
        </form>
      ) : null}

      {isLoading ? <p className="text-sm text-muted-foreground">Caricamento…</p> : null}
      {!isLoading && stops.length === 0 ? <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">Nessuna tappa. Crea la prima, ad esempio un'opera della mostra nella prima stanza.</p> : null}

      {stops.map((stop) => (
        <article key={stop.id} className="space-y-4 rounded-xl border bg-card p-4 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary font-display text-lg text-primary-foreground">{stop.number}</span>
              <div>
                <h3 className="text-lg leading-tight">{stop.title}{stop.published ? null : <span className="ml-2 text-xs text-muted-foreground">(nascosta)</span>}</h3>
                {stop.subtitle ? <p className="text-sm text-muted-foreground">{stop.subtitle}</p> : null}
                <p className="text-xs text-muted-foreground">{rooms.find((r) => r.id === stop.room_id)?.name ?? ""}</p>
              </div>
            </div>
            <QrPreview stop={stop} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => setDraft({ id: stop.id, number: String(stop.number), title: stop.title, subtitle: stop.subtitle ?? "", description: stop.description ?? "", room_id: stop.room_id ?? "", published: stop.published })}><Pencil className="size-4" />Modifica</Button>
            <Button size="sm" variant="outline" asChild><a href={`/guida/${stop.id}`} target="_blank" rel="noopener noreferrer">Apri pagina</a></Button>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeStop(stop)}><Trash2 className="size-4" />Elimina</Button>
          </div>
          <ul className="space-y-2">
            {stop.guide_files.map((f) => {
              const Icon = kindIcon[f.kind as GuideFileKind] ?? FileText;
              return (
                <li key={f.id} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2"><Icon className="size-4 shrink-0 text-primary" /><span className="truncate">{f.label || kindLabel[f.kind as GuideFileKind]}</span><span className="text-xs text-muted-foreground">· {langLabel[f.language as GuideLanguage]}</span></span>
                  <Button size="icon" variant="ghost" aria-label="Elimina file" onClick={() => removeFile(f.id, f.file_url)}><Trash2 className="size-4" /></Button>
                </li>
              );
            })}
          </ul>
          <FileUploader stop={stop} onDone={refresh} />
        </article>
      ))}
    </section>
  );
}
