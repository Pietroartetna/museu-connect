import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { StoredImage } from "@/components/StoredImage";

type Registration = {
  id: string;
  status: string;
  note: string | null;
  payment_proof_url: string | null;
  created_at: string;
  events: { title: string; starts_at: string; is_paid: boolean } | null;
  profiles: { first_name: string; last_name: string; phone: string | null; email: string | null } | null;
};

export function RegistrationsSection() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["admin-registrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_registrations")
        .select(
          "id, status, note, payment_proof_url, created_at, events(title, starts_at, is_paid), profiles(first_name, last_name, phone, email)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Registration[];
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("event_registrations").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Iscrizione aggiornata");
      queryClient.invalidateQueries({ queryKey: ["admin-registrations"] });
    },
    onError: () => toast.error("Aggiornamento non riuscito"),
  });

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl">Iscrizioni agli eventi</h2>
        <p className="text-sm text-muted-foreground">
          Approva o rifiuta le richieste dei soci, verificando la ricevuta di pagamento.
        </p>
      </div>

      <div className="space-y-3">
        {(data ?? []).map((reg) => (
          <div key={reg.id} className="rounded-lg border bg-card p-4 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {reg.profiles?.first_name} {reg.profiles?.last_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {reg.events?.title} —{" "}
                  {reg.events?.starts_at
                    ? new Date(reg.events.starts_at).toLocaleString("it-IT", { dateStyle: "medium" })
                    : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {reg.profiles?.email} · {reg.profiles?.phone}
                </p>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs">{reg.status}</span>
            </div>

            {reg.payment_proof_url ? (
              <div className="mt-3">
                <p className="text-xs text-muted-foreground">Ricevuta allegata</p>
                <StoredImage
                  reference={reg.payment_proof_url}
                  alt="Ricevuta di pagamento"
                  className="mt-1 h-32 w-48 rounded-md"
                />
              </div>
            ) : reg.events?.is_paid ? (
              <p className="mt-3 text-xs text-destructive">Nessuna ricevuta allegata</p>
            ) : null}

            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                disabled={reg.status === "approvata"}
                onClick={() => setStatus.mutate({ id: reg.id, status: "approvata" })}
              >
                Approva
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={reg.status === "rifiutata"}
                onClick={() => setStatus.mutate({ id: reg.id, status: "rifiutata" })}
              >
                Rifiuta
              </Button>
            </div>
          </div>
        ))}
        {(data?.length ?? 0) === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Nessuna iscrizione ricevuta.
          </p>
        ) : null}
      </div>
    </section>
  );
}
