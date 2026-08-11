import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarDays, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { uploadFile } from "@/lib/storage";
import { StoredImage } from "@/components/StoredImage";
import { EntityGallery } from "@/components/EntityGallery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/eventi")({
  head: () => ({
    meta: [
      { title: "Eventi — Casa Museo Nicolosi" },
      {
        name: "description",
        content: "Visite guidate, laboratori e iniziative della Casa Museo di Nicolosi.",
      },
      { property: "og:title", content: "Eventi — Casa Museo Nicolosi" },
      { property: "og:description", content: "Iscriviti agli eventi della Casa Museo di Nicolosi." },
    ],
  }),
  component: EventiPage,
});

const statusLabel: Record<string, string> = {
  in_attesa: "In attesa di approvazione",
  approvata: "Iscrizione confermata",
  rifiutata: "Iscrizione non accettata",
};

function EventiPage() {
  const { data: session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  const [proofs, setProofs] = useState<Record<string, File | null>>({});

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

  const { data: registrations } = useQuery({
    queryKey: ["my-registrations", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("id, event_id, status")
        .eq("user_id", userId!);
      if (error) throw error;
      return data;
    },
  });

  const register = useMutation({
    mutationFn: async (eventId: string) => {
      const file = proofs[eventId] ?? null;
      let payment_proof_url: string | null = null;
      if (file) {
        payment_proof_url = await uploadFile("pagamenti", `${userId}/${eventId}`, file);
      }
      const { error } = await supabase.from("event_registrations").insert({
        event_id: eventId,
        user_id: userId!,
        payment_proof_url,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Iscrizione inviata: attendi l'approvazione.");
      queryClient.invalidateQueries({ queryKey: ["my-registrations"] });
    },
    onError: () => toast.error("Non è stato possibile inviare l'iscrizione."),
  });

  return (
    <div>
      <h1 className="text-3xl">Eventi</h1>
      <p className="mt-2 text-muted-foreground">
        Iscriviti alle iniziative della Casa Museo. Per gli eventi a pagamento allega la ricevuta.
      </p>

      {(events?.length ?? 0) === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Nessun evento in programma al momento.
        </p>
      ) : null}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {(events ?? []).map((event) => {
          const reg = registrations?.find((r) => r.event_id === event.id);
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
                  <p className="text-sm text-olive">Ingresso libero per i soci</p>
                )}

                {reg ? (
                  <p className="rounded-md bg-muted px-3 py-2 text-sm">
                    {statusLabel[reg.status] ?? reg.status}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {event.is_paid ? (
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">
                          Ricevuta di pagamento
                        </label>
                        <Input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) =>
                            setProofs((p) => ({ ...p, [event.id]: e.target.files?.[0] ?? null }))
                          }
                        />
                      </div>
                    ) : null}
                    <Button
                      className="w-full"
                      disabled={register.isPending}
                      onClick={() => register.mutate(event.id)}
                    >
                      Iscriviti
                    </Button>
                  </div>
                )}

                <EntityGallery entityType="event" entityId={event.id} />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
