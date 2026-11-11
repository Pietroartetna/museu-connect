import { useQuery } from "@tanstack/react-query";
import { ImageOff } from "lucide-react";
import { resolveUrl } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { ImageViewer } from "@/components/ImageViewer";

export function StoredImage({
  reference,
  alt,
  className,
  zoomable = true,
}: {
  reference: string | null;
  alt: string;
  className?: string;
  zoomable?: boolean;
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
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className,
        )}
        aria-label={alt}
      >
        <ImageOff className="size-6 opacity-50" />
      </div>
    );
  }

  return <ImageViewer src={url} alt={alt} className={className} zoomable={zoomable} />;
}
