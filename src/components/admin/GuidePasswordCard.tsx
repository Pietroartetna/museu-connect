import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { KeyRound, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateGuidePassword, normalizeGuidePassword } from "@/lib/guide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function GuidePasswordCard() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["guide-access"], queryFn: async () => {
    const { data, error } = await supabase.from("guide_access").select("password, updated_at").maybeSingle();
    if (error) throw error; return data;
  } });
  const [value, setValue] = useState("");
  useEffect(() => { setValue(data?.password ?? ""); }, [data]);
  const save = async (pw: string) => {
    const password = normalizeGuidePassword(pw) || null;
    const { error } = await supabase.from("guide_access").upsert({ id: true, password, updated_at: new Date().toISOString() });
    if (error) return toast.error(error.message);
    toast.success(password ? `Password salvata: ${password}` : "Audioguida aperta a tutti");
    qc.invalidateQueries({ queryKey: ["guide-access"] });
  };
  return (
    <div className="mb-8 rounded-xl border bg-card p-5 shadow-soft">
      <h3 className="flex items-center gap-2 text-xl"><KeyRound className="size-5 text-primary" />Password audioguida</h3>
      <p className="mt-1 text-sm text-muted-foreground">I visitatori devono inserirla per ascoltare le tappe. Lascia vuoto per aprire l'audioguida a tutti. Chi ha già inserito la vecchia password dovrà digitare quella nuova.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Input aria-label="Password audioguida" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Nessuna password" className="max-w-xs font-mono text-lg tracking-widest" />
        <Button variant="outline" onClick={() => { const p = generateGuidePassword(); setValue(p); void save(p); }}><RefreshCw className="size-4" />Genera nuova</Button>
        <Button onClick={() => save(value)}>Salva</Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{data?.password ? `Attiva: ${data.password}` : "Nessuna password attiva"}{data?.updated_at ? ` · aggiornata il ${new Date(data.updated_at).toLocaleString("it-IT")}` : ""}</p>
    </div>
  );
}
