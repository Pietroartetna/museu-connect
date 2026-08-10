import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Area soci — Casa Museo Civiltà Contadina Nicolosi" },
      {
        name: "description",
        content:
          "Accedi o registrati come socio della Casa Museo della Civiltà Contadina di Nicolosi.",
      },
      { property: "og:title", content: "Area soci — Casa Museo Nicolosi" },
      {
        property: "og:description",
        content: "Accesso riservato ai soci della Casa Museo della Civiltà Contadina di Nicolosi.",
      },
    ],
  }),
  component: AuthPage,
});

const signupSchema = z.object({
  first_name: z.string().trim().min(1, "Inserisci il nome").max(60),
  last_name: z.string().trim().min(1, "Inserisci il cognome").max(60),
  phone: z.string().trim().min(6, "Inserisci un numero valido").max(30),
  email: z.string().trim().email("Email non valida").max(255),
  password: z.string().min(8, "La password deve avere almeno 8 caratteri").max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/area", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/area", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = signupSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Dati non validi");
      return;
    }
    setLoading(true);
    const { first_name, last_name, phone, email, password } = parsed.data;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { first_name, last_name, phone },
      },
    });
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }

    if (data.session && avatar) {
      const ext = avatar.name.split(".").pop() ?? "jpg";
      const path = `avatars/${data.session.user.id}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("museo").upload(path, avatar, {
        upsert: true,
        contentType: avatar.type,
      });
      if (!upErr) {
        await supabase
          .from("profiles")
          .update({ avatar_url: `museo/${path}` })
          .eq("id", data.session.user.id);
      }
    }

    setLoading(false);
    if (data.session) {
      toast.success("Benvenuto nella Casa Museo!");
      navigate({ to: "/area" });
    } else {
      toast.success("Controlla la tua email per confermare la registrazione.");
    }
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    });
    setLoading(false);
    if (error) {
      toast.error("Credenziali non valide");
      return;
    }
    navigate({ to: "/area" });
  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Accesso con Google non riuscito");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/area" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 block text-center text-sm text-muted-foreground underline">
          ← Torna al sito
        </Link>
        <div className="rounded-2xl border bg-card p-7 shadow-lift">
          <h1 className="text-center text-2xl">Area soci</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Casa Museo della Civiltà Contadina — Nicolosi
          </p>

          <Tabs defaultValue="registrati" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="registrati">Registrati</TabsTrigger>
              <TabsTrigger value="accedi">Accedi</TabsTrigger>
            </TabsList>

            <TabsContent value="registrati">
              <form onSubmit={handleSignup} className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="first_name">Nome</Label>
                    <Input id="first_name" name="first_name" required maxLength={60} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="last_name">Cognome</Label>
                    <Input id="last_name" name="last_name" required maxLength={60} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Telefono</Label>
                  <Input id="phone" name="phone" type="tel" required maxLength={30} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" name="email" type="email" required maxLength={255} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="avatar">Foto (facoltativa)</Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatar(e.target.files?.[0] ?? null)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  Diventa socio
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="accedi">
              <form onSubmit={handleLogin} className="mt-4 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" name="email" type="email" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  Accedi
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> oppure <span className="h-px flex-1 bg-border" />
          </div>
          <Button variant="outline" className="w-full" onClick={handleGoogle}>
            Continua con Google
          </Button>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Il primo account registrato diventa automaticamente amministratore.
          </p>
        </div>
      </div>
    </div>
  );
}
