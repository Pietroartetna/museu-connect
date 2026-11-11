import { Images } from "lucide-react";
import { StoredImage } from "@/components/StoredImage";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { RoomPhoto } from "@/lib/room-gallery";

export function RoomGallery({ name, photos, entityType = "room" }: { name: string; photos: RoomPhoto[]; entityType?: "room" | "artist" }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="mt-4 w-full">
          <Images className="size-4" /> {entityType === "artist" ? "Galleria dell’artista" : "Galleria della stanza"} ({photos.length})
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined} className="max-h-[85dvh] w-[calc(100%-1rem)] overflow-y-auto sm:max-w-4xl">
        <DialogHeader><DialogTitle>{name} — Galleria</DialogTitle></DialogHeader>
        {photos.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Nessuna foto pubblicata in questa galleria.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {photos.map((photo) => (
              <figure key={photo.id} className="min-w-0">
                <StoredImage reference={photo.image_url} alt={photo.caption || name} className="aspect-[4/3] w-full rounded-lg object-contain bg-muted" />
                {photo.caption ? <figcaption className="mt-3 whitespace-pre-line break-words text-sm">{photo.caption}</figcaption> : null}
              </figure>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}