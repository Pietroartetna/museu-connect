import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Save, Trash2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/storage";
import { photosForRoom, ROOM_ENTITY_TYPE, roomPhotosQuery, type RoomPhoto } from "@/lib/room-gallery";
import { StoredImage } from "@/components/StoredImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function RoomImagesSection() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [roomId, setRoomId] = useState("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const { data: rooms, error: roomsError } = useQuery({
    queryKey: ["rooms", "gallery-selector"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rooms").select("id, name").order("position");
      if (error) throw error;
      return data;
    },
  });
  const { data: photos = [], isLoading, error } = useQuery(roomPhotosQuery);
  const selectedPhotos = photosForRoom(photos, roomId);

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["room-photos"] });
  }

  async function add(event: React.FormEvent) {
    event.preventDefault();
    if (!roomId || !file) return;
    const targetRoom = roomId;
    setBusy(true);
    let reference: string | null = null;
    try {
      reference = await uploadFile("museo", `stanze/${targetRoom}/${crypto.randomUUID()}`, file);
      const { error } = await supabase.from("entity_images").insert({
        entity_type: ROOM_ENTITY_TYPE, entity_id: targetRoom,
        image_url: reference, caption: caption.trim() || null,
        position: Math.max(-1, ...selectedPhotos.map((photo) => photo.position)) + 1,
      });
      if (error) throw error;
      setCaption(""); setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      await refresh();
      toast.success("Foto aggiunta alla stanza");
    } catch (error) {
      if (reference) await supabase.storage.from("museo").remove([reference.slice("museo/".length)]);
      toast.error(error instanceof Error ? error.message : "Impossibile caricare la foto");
    } finally { setBusy(false); }
  }

  async function save(photo: RoomPhoto) {
    setBusy(true);
    try {
      const { error } = await supabase.from("entity_images").update({ caption: draft.trim() || null })
        .eq("id", photo.id).eq("entity_type", ROOM_ENTITY_TYPE).eq("entity_id", roomId);
      if (error) throw error;
      await refresh(); setEditing(null);
      toast.success("Descrizione aggiornata");
    } catch { toast.error("Impossibile aggiornare la descrizione"); }
    finally { setBusy(false); }
  }

  async function remove(photo: RoomPhoto) {
    if (!window.confirm("Eliminare questa foto dalla galleria della stanza?")) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("entity_images").delete()
        .eq("id", photo.id).eq("entity_type", ROOM_ENTITY_TYPE).eq("entity_id", roomId);
      if (error) throw error;
      await refresh();
      toast.success("Foto eliminata dalla galleria");
    } catch { toast.error("Impossibile eliminare la foto"); }
    finally { setBusy(false); }
  }

  return (
    <section className="mt-10 space-y-5 border-t pt-8">
      <h2 className="text-2xl">Gallerie delle stanze</h2>
      {roomsError || error ? <p role="alert" className="text-sm text-destructive">Impossibile caricare le gallerie delle stanze.</p> : null}
      <div className="max-w-md space-y-2">
        <Label htmlFor="room-gallery-select">Stanza</Label>
        <select id="room-gallery-select" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={roomId} disabled={busy} onChange={(event) => {
            setRoomId(event.target.value); setEditing(null); setCaption(""); setFile(null);
            if (inputRef.current) inputRef.current.value = "";
          }}>
          <option value="">Seleziona una stanza…</option>
          {(rooms ?? []).map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
        </select>
      </div>
      {roomId ? <>
        <form onSubmit={add} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="room-gallery-photo">Foto</Label>
            <Input ref={inputRef} id="room-gallery-photo" type="file" accept="image/*" required disabled={busy}
              onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="room-gallery-description">Descrizione della foto</Label>
            <Textarea id="room-gallery-description" value={caption} disabled={busy} onChange={(event) => setCaption(event.target.value)} />
          </div>
          <div className="md:col-span-2"><Button type="submit" disabled={busy || !file}><Upload className="size-4" />{busy ? "Salvataggio…" : "Carica foto nella stanza"}</Button></div>
        </form>
        {isLoading ? <p className="text-sm text-muted-foreground">Caricamento…</p> : selectedPhotos.length === 0 ? <p className="text-sm text-muted-foreground">Nessuna foto in questa stanza.</p> : null}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {selectedPhotos.map((photo) => <article key={photo.id} className="overflow-hidden rounded-lg border bg-card">
            <StoredImage reference={photo.image_url} alt={photo.caption || "Foto della stanza"} className="aspect-[4/3] w-full" />
            <div className="space-y-3 p-4">
              {editing === photo.id ? <>
                <Label htmlFor={`caption-${photo.id}`}>Descrizione</Label>
                <Textarea id={`caption-${photo.id}`} value={draft} disabled={busy} onChange={(event) => setDraft(event.target.value)} />
                <div className="flex gap-2">
                  <Button size="sm" disabled={busy} onClick={() => save(photo)}><Save className="size-4" />Salva</Button>
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => setEditing(null)}><X className="size-4" />Annulla</Button>
                </div>
              </> : <>
                <p className="whitespace-pre-line break-words text-sm text-muted-foreground">{photo.caption || "Senza descrizione"}</p>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" title="Modifica descrizione" aria-label="Modifica descrizione" disabled={busy} onClick={() => { setEditing(photo.id); setDraft(photo.caption || ""); }}><Pencil className="size-4" /></Button>
                  <Button size="icon" variant="outline" title="Elimina foto" aria-label="Elimina foto" disabled={busy} onClick={() => remove(photo)}><Trash2 className="size-4 text-destructive" /></Button>
                </div>
              </>}
            </div>
          </article>)}
        </div>
      </> : null}
    </section>
  );
}