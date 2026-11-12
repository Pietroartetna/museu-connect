import { useQuery } from "@tanstack/react-query";
import { FileText, Headphones, Loader2 } from "lucide-react";
import { resolveUrl } from "@/lib/storage";
import { ImageViewer } from "@/components/ImageViewer";
import { Button } from "@/components/ui/button";
import type { GuideFile } from "@/lib/guide";

function useUrl(reference: string) {
  return useQuery({ queryKey: ["stored-url", reference], staleTime: 30 * 60 * 1000, queryFn: () => resolveUrl(reference) }).data;
}

export function GuideFileView({ file, fallbackLabel }: { file: GuideFile; fallbackLabel: string }) {
  const url = useUrl(file.file_url);
  const label = file.label || fallbackLabel;
  if (!url) return <div className="flex items-center gap-2 rounded-lg border p-4 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />{label}</div>;
  if (file.kind === "audio") {
    return (
      <div className="rounded-xl border bg-card p-4 shadow-soft">
        <p className="mb-3 flex items-center gap-2 font-display text-lg"><Headphones className="size-5 text-primary" />{label}</p>
        <audio src={url} controls preload="metadata" className="w-full" />
      </div>
    );
  }
  if (file.kind === "pdf") {
    return (
      <Button asChild variant="outline" size="lg" className="h-auto w-full justify-start whitespace-normal py-3">
        <a href={url} target="_blank" rel="noopener noreferrer"><FileText className="size-5 shrink-0 text-primary" />{label}</a>
      </Button>
    );
  }
  return (
    <figure>
      <ImageViewer src={url} alt={label} className="aspect-[4/3] w-full rounded-lg bg-muted object-contain" />
      {file.label ? <figcaption className="mt-2 text-sm text-muted-foreground">{file.label}</figcaption> : null}
    </figure>
  );
}
