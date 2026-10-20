import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { canAccessAdministration } from "@/lib/access";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Accesso amministratore — Casa Museo Nicolosi" },
    { name: "description", content: "Accesso riservato agli amministratori della Casa Museo di Nicolosi." },
    { property: "og:title", content: "Accesso amministratore — Casa Museo Nicolosi" },
    { property: "og:description", content: "Accesso al pannello di amministrazione della Casa Museo." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [denied, setDenied] = useState(false);

  async function openAdministration() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data: roles, error } = await supabase.from("user_roles").select("role").eq("user_id", userData.user.id);
    if (error) { toast.error("Impossibile verificare l’accesso. Riprova."); return; }
    if (!canAccessAdministration((roles ?? []).map((row) => row.role))) {
      setDenied(true);
      return;
    }
    await navigate({ to: "/admin", replace: true });
  }

  useEffect(() => { void openAdministration(); }, []);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setDenied(false);
    try {
      const form = new FormData(e.currentTarget);
      const { error } = await supabase.auth.signInWithPassword({
        email: String(form.get("email") ?? ""), password: String(form.get("password") ?? ""),
      });
      if (error) { toast.error("Credenziali non valide"); return; }
      await openAdministration();
    } catch { toast.error("Accesso non riuscito. Riprova."); }
    finally { setLoading(false); }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth` });
      if (result.error) { toast.error("Accesso con Google non riuscito"); return; }
      if (!result.redirected) await openAdministration();
    } finally { setLoading(false); }
  }

  async function switchAccount() {
    await supabase.auth.signOut();
    setDenied(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 block text-center text-sm text-muted-foreground underline">← Torna al museo</Link>
        <div className="rounded-lg border bg-card p-7 shadow-lift">
          <h1 className="text-center text-2xl">Accesso amministratore</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">Casa Museo della Civiltà Contadina — Nicolosi</p>
          {denied ? (
            <div className="mt-6 space-y-4" role="alert">
              <p className="text-sm text-muted-foreground">Questo account non è abilitato all’amministrazione.</p>
              <Button variant="outline" className="w-full" onClick={switchAccount}>Usa un altro account</Button>
            </div>
          ) : (
            <>
              <form onSubmit={handleLogin} className="mt-6 space-y-4">
                <div className="space-y-1.5"><Label htmlFor="login-email">Email</Label><Input id="login-email" name="email" type="email" autoComplete="username" required /></div>
                <div className="space-y-1.5"><Label htmlFor="login-password">Password</Label><Input id="login-password" name="password" type="password" autoComplete="current-password" required /></div>
                <Button type="submit" className="w-full" disabled={loading}>Accedi</Button>
              </form>
              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />oppure<span className="h-px flex-1 bg-border" /></div>
              <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={loading}>Continua con Google</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
