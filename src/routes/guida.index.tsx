import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Headphones, QrCode } from "lucide-react";
import { PublicMuseumLayout } from "@/components/PublicMuseumLayout";
import { guideStopsQuery } from "@/lib/guide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/guida/")({
  head: () => ({
    meta: [
      { title: "Audioguida — Casa Museo Nicolosi" },
      { name: "description", content: "Visita guidata della Casa Museo di Nicolosi: inquadra il QR code o digita il numero della tappa per ascoltare l'audioguida in italiano e inglese." },
      { property: "og:title", content: "Audioguida — Casa Museo Nicolosi" },
      { property: "og:description", content: "Audioguida, schede e volantini per ogni tappa della visita." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GuidaPage,
});

function GuidaPage() {
  const { data: stops = [], isLoading } = useQuery(guideStopsQuery);
  const [num, setNum] = useState("");
  const navigate = useNavigate();
  return (
    <PublicMuseumLayout>
      <p className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-primary"><Headphones className="size-4" />Visita guidata · Guided tour</p>
      <h1 className="mt-2 text-3xl sm:text-4xl">Audioguida</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">Inquadra il QR code accanto all'opera o digita il numero della tappa. <span className="italic">Scan the QR code or type the stop number.</span></p>

      <form className="mt-6 flex max-w-sm gap-2" onSubmit={(e) => { e.preventDefault(); if (/^\d+$/.test(num)) navigate({ to: "/guida/$codice", params: { codice: num } }); }}>
        <Input inputMode="numeric" pattern="[0-9]*" aria-label="Numero tappa" placeholder="N. tappa" value={num} onChange={(e) => setNum(e.target.value.replace(/\D/g, ""))} className="h-12 text-lg" />
        <Button type="submit" size="lg" className="h-12">Vai</Button>
      </form>

      {isLoading ? <p className="mt-8 text-sm text-muted-foreground">Caricamento…</p> : null}
      {!isLoading && stops.length === 0 ? <p className="mt-8 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground"><QrCode className="mx-auto mb-2 size-6" />Le tappe dell'audioguida saranno disponibili a breve.</p> : null}
      <ol className="mt-8 grid gap-3 sm:grid-cols-2">
        {stops.map((s) => (
          <li key={s.id}>
            <Link to="/guida/$codice" params={{ codice: s.id }} className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-soft transition-colors hover:border-primary">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary font-display text-xl text-primary-foreground">{s.number}</span>
              <span className="min-w-0"><span className="block font-display text-lg leading-tight">{s.title}</span>{s.subtitle ? <span className="block text-sm text-muted-foreground">{s.subtitle}</span> : null}</span>
            </Link>
          </li>
        ))}
      </ol>
    </PublicMuseumLayout>
  );
}
