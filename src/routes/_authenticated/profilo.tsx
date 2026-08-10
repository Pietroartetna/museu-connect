import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin, useProfile, useSession } from "@/lib/auth";
import { uploadFile } from "@/lib/storage";
import { StoredImage } from "@/components/StoredImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/profilo")({
  head: () => ({
    meta: [
      { title: "Il mio profilo — Casa Museo Nicolosi" },
      { name: "description", content: "Gestisci i tuoi dati di socio della Casa Museo di Nicolosi." },
      { property: "og:title", content: "Il mio profilo — Casa Museo Nicolosi" },
      { property: "og:description", content: "Dati personali del socio della Casa Museo." },
    ],
  }),
  component: ProfiloPage,
});

function ProfiloPage() {
  const { data: session } = useSession();
  const { data: profile } = useProfile();
  const { data: isAdmin } = useIsAdmin();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ first_name: "", last_name: "", phone: "" });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name ?? "",
        last_name: profile.last_name ?? "",
        phone: profile.phone ?? "",
      });
    }
  }, [profile]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    setSaving(true);
    try {
      let avatar_url = profile?.avatar_url ?? null;
      if (file) avatar_url = await uploadFile("museo", `avatars/${session.user.id}`, file);
      const { error } = await supabase
        .from("profiles")
        .update({ ...form, avatar_url })
        .eq("id", session.user.id);
      if (error) throw error;
      toast.success("Profilo aggiornato");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setFile(null);
    } catch {
      toast.error("Errore durante il salvataggio");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-3xl">Il mio profilo</h1>
      <p className="mt-2 text-muted-foreground">
        {isAdmin ? "Sei amministratore della Casa Museo." : "Sei socio della Casa Museo."}
      </p>

      <form onSubmit={save} className="mt-8 space-y-4 rounded-xl border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-4">
          <StoredImage
            reference={profile?.avatar_url ?? null}
            alt="Foto profilo"
            className="size-20 rounded-full"
          />
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="foto">Cambia foto</Label>
            <Input
              id="foto"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            value={form.first_name}
            maxLength={60}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cognome">Cognome</Label>
          <Input
            id="cognome"
            value={form.last_name}
            maxLength={60}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tel">Telefono</Label>
          <Input
            id="tel"
            value={form.phone}
            maxLength={30}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={profile?.email ?? session?.user.email ?? ""} disabled />
        </div>
        <Button type="submit" disabled={saving}>
          Salva modifiche
        </Button>
      </form>
    </div>
  );
}
