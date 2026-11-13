import { useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
import { normalizeGuidePassword, publicGuideQuery, type GuideStop } from "@/lib/guide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const KEY = "guide-password";

/** Asks for the audioguide password (stored for this browser session) and renders the stops once unlocked. */
export function GuideGate({ children }: { children: (stops: GuideStop[]) => ReactNode }) {
  const [password, setPassword] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  useEffect(() => { setPassword(sessionStorage.getItem(KEY) ?? ""); }, []);
  const q = useQuery({ ...publicGuideQuery(password ?? ""), enabled: password !== null });
  useEffect(() => { if (q.data?.ok && password) sessionStorage.setItem(KEY, password); }, [q.data, password]);

  if (password === null || q.isLoading) return <p className="text-sm text-muted-foreground">Caricamento…</p>;
  if (q.data?.ok) return <>{children(q.data.stops)}</>;
  return (
    <div className="mx-auto max-w-sm rounded-xl border bg-card p-6 text-center shadow-soft">
      <KeyRound className="mx-auto size-8 text-primary" />
      <h1 className="mt-3 text-2xl">Audioguida</h1>
      <p className="mt-2 text-sm text-muted-foreground">Inserisci la password che trovi all'ingresso del museo. <span className="italic">Enter the password shown at the museum entrance.</span></p>
      <form className="mt-5 flex gap-2" onSubmit={(e) => { e.preventDefault(); setPassword(normalizeGuidePassword(typed)); }}>
        <Input aria-label="Password" autoCapitalize="characters" value={typed} onChange={(e) => setTyped(e.target.value)} className="h-12 text-center text-lg tracking-widest" />
        <Button type="submit" size="lg" className="h-12">Entra</Button>
      </form>
      {password ? <p role="alert" className="mt-3 text-sm text-destructive">Password non corretta · Wrong password</p> : null}
    </div>
  );
}
