import { useQuery } from "@tanstack/react-query";
import { VideoOff } from "lucide-react";
import { resolveUrl } from "@/lib/storage";
import { cn } from "@/lib/utils";

export function StoredVideo({
  reference,
  className,
}: {
  reference: string | null;
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
      >
        <VideoOff className="size-6 opacity-50" />
      </div>
    );
  }

  return <video src={url} controls preload="metadata" className={cn("bg-black object-cover", className)} />;
}
