import { useQuery } from "@tanstack/react-query";
import { ImageOff } from "lucide-react";
import { resolveUrl } from "@/lib/storage";
import { cn } from "@/lib/utils";

export function StoredMedia({
  reference,
  mediaType,
  alt,
  className,
}: {
  reference: string | null;
  mediaType?: string | null;
  alt: string;
  className?: string;
}) {
  const { data: url } = useQuery({
    queryKey: ["stored-url", reference],
    enabled: !!reference,
    staleTime: 30 * 60 * 1000,
    queryFn: () => resolveUrl(reference),
  });

  if (!url) {
    return (
      <div
        className={cn("flex items-center justify-center bg-muted text-muted-foreground", className)}
        aria-label={alt}
      >
        <ImageOff className="size-6 opacity-50" />
      </div>
    );
  }

  if (mediaType === "video") {
    return <video src={url} controls preload="metadata" className={cn("object-cover", className)} />;
  }

  return <img src={url} alt={alt} loading="lazy" className={cn("object-cover", className)} />;
}
