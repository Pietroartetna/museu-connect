import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function ImageViewer({ src, alt, className, zoomable = true }: {
  src: string; alt: string; className?: string; zoomable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  if (!zoomable) return <img src={src} alt={alt} loading="lazy" className={cn("object-contain", className)} />;
  return <>
    <Button type="button" variant="ghost" aria-label={`Ingrandisci: ${alt || "fotografia"}`} title="Ingrandisci foto"
      onClick={() => setOpen(true)} className={cn("relative block h-auto overflow-hidden rounded-none bg-muted p-0 hover:bg-muted", className)}>
      <img src={src} alt={alt} loading="lazy" className="h-full w-full object-contain" />
    </Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent aria-describedby={undefined} className="max-h-[94dvh] w-[calc(100%-1rem)] overflow-y-auto p-4 pt-12 sm:max-w-6xl">
        <DialogTitle className="sr-only">{alt || "Fotografia"}</DialogTitle>
        <img src={src} alt={alt} className="max-h-[72dvh] w-full object-contain" />
        {alt ? <p className="whitespace-pre-line break-words text-sm text-muted-foreground">{alt}</p> : null}
      </DialogContent>
    </Dialog>
  </>;
}