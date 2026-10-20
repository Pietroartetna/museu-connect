import { PublicMuseumLayout } from "@/components/PublicMuseumLayout";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StoredImage } from "@/components/StoredImage";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/eventi")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Eventi — Casa Museo Nicolosi" },
      {
        name: "description",
        content: "Visite guidate, laboratori e iniziative della Casa Museo di Nicolosi.",
      },
      { property: "og:title", content: "Eventi — Casa Museo Nicolosi" },
      { property: "og:description", content: "Scopri gli eventi della Casa Museo di Nicolosi." },
    ],
  }),
  component: EventiPage,
});

function EventiPage() {
  const { data: events } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, description, image_url, location, starts_at, is_paid, price, capacity")
        .order("starts_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  return (
    <PublicMuseumLayout>
      <h1 className="text-3xl">Eventi</h1>
      <p className="mt-2 text-muted-foreground">
        Visite guidate, laboratori e iniziative della Casa Museo.
      </p>

      {(events?.length ?? 0) === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Nessun evento in programma al momento.
        </p>
      ) : null}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {(events ?? []).map((event) => {
          return (
            <article key={event.id} className="overflow-hidden rounded-xl border bg-card shadow-soft">
              <StoredImage reference={event.image_url} alt={event.title} className="h-48 w-full" />
              <div className="space-y-3 p-5">
                <h2 className="text-xl text-primary">{event.title}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-4" />
                    {new Date(event.starts_at).toLocaleString("it-IT", {
                      dateStyle: "long",
                      timeStyle: "short",
                    })}
                  </span>
                  {event.location ? (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-4" />
                      {event.location}
                    </span>
                  ) : null}
                </div>
                <p className="whitespace-pre-line text-sm text-muted-foreground">
                  {event.description}
                </p>
                {event.is_paid ? (
                  <p className="text-sm font-medium text-accent">
                    Evento a pagamento{event.price ? ` — € ${Number(event.price).toFixed(2)}` : ""}
                  </p>
                ) : (
                  <p className="text-sm text-olive">Evento gratuito</p>
                )}

                <Button asChild variant="outline" className="w-full">
                  <a href="tel:095910980">Contatta il museo per partecipare</a>
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </PublicMuseumLayout>
  );
}
