import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, List } from "lucide-react";
import { PublicMuseumLayout } from "@/components/PublicMuseumLayout";
import { GuideFileView } from "@/components/GuideFileView";
import { filesForLanguage, parseStopKey, type GuideStop } from "@/lib/guide";
import { GuideGate } from "@/components/GuideGate";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/guida/$codice")({
  head: () => ({
    meta: [
      { title: "Tappa audioguida — Casa Museo Nicolosi" },
      { name: "description", content: "Ascolta l'audioguida e consulta la scheda di questa tappa della Casa Museo della Civiltà Contadina di Nicolosi." },
      { property: "og:title", content: "Tappa audioguida — Casa Museo Nicolosi" },
      { property: "og:description", content: "Audioguida in italiano e inglese, foto e volantino della tappa." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TappaPage,
});

const T = {
  it: { audio: "Audioguida", pdf: "Scarica il volantino", photos: "Foto", all: "Tutte le tappe", prev: "Precedente", next: "Successiva", missing: "Tappa non trovata", stop: "Tappa" },
  en: { audio: "Audio guide", pdf: "Download the leaflet", photos: "Photos", all: "All stops", prev: "Previous", next: "Next", missing: "Stop not found", stop: "Stop" },
};

function TappaPage() {
  return <PublicMuseumLayout><GuideGate>{(stops) => <Tappa stops={stops} />}</GuideGate></PublicMuseumLayout>;
}

function Tappa({ stops }: { stops: GuideStop[] }) {
  const { codice } = Route.useParams();
  const [lang, setLang] = useState<"it" | "en">("it");
  const key = parseStopKey(codice);
  const index = key ? stops.findIndex((s) => ("id" in key ? s.id === key.id : s.number === key.number)) : -1;
  const stop = index >= 0 ? stops[index] : null;
  const t = T[lang];
  const prev = index > 0 ? stops[index - 1] : null;
  const next = index >= 0 && index < stops.length - 1 ? stops[index + 1] : null;

  if (!stop) return (
    <>
      <h1 className="text-2xl">{t.missing}</h1>
      <Button asChild variant="link" className="mt-2 px-0"><Link to="/guida"><List className="size-4" />{t.all}</Link></Button>
    </>
  );

  const audio = filesForLanguage(stop.guide_files, "audio", lang);
  const pdfs = filesForLanguage(stop.guide_files, "pdf", lang);
  const images = filesForLanguage(stop.guide_files, "image", lang);

  return (
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between gap-3">
          <Button asChild variant="ghost" size="sm" className="px-0"><Link to="/guida"><List className="size-4" />{t.all}</Link></Button>
          <div role="group" aria-label="Lingua / Language" className="flex rounded-full border p-1">
            {(["it", "en"] as const).map((l) => (
              <Button key={l} size="sm" variant={lang === l ? "default" : "ghost"} className="rounded-full" aria-pressed={lang === l} onClick={() => setLang(l)}>{l === "it" ? "Italiano" : "English"}</Button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-start gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary font-display text-2xl text-primary-foreground" aria-label={`${t.stop} ${stop.number}`}>{stop.number}</span>
          <div className="min-w-0">
            <h1 className="text-2xl leading-tight sm:text-3xl">{stop.title}</h1>
            {stop.subtitle ? <p className="mt-1 text-muted-foreground">{stop.subtitle}</p> : null}
          </div>
        </div>
        {stop.description ? <p className="mt-5 whitespace-pre-line leading-relaxed">{stop.description}</p> : null}

        <div className="mt-6 space-y-3">
          {audio.map((f) => <GuideFileView key={f.id} file={f} fallbackLabel={t.audio} />)}
          {pdfs.map((f) => <GuideFileView key={f.id} file={f} fallbackLabel={t.pdf} />)}
        </div>
        {images.length ? (
          <section className="mt-8">
            <h2 className="text-xl">{t.photos}</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">{images.map((f) => <GuideFileView key={f.id} file={f} fallbackLabel={stop.title} />)}</div>
          </section>
        ) : null}

        <nav className="mt-10 flex justify-between gap-3 border-t pt-5">
          {prev ? <Button asChild variant="outline"><Link to="/guida/$codice" params={{ codice: prev.id }}><ArrowLeft className="size-4" />{prev.number}. {t.prev}</Link></Button> : <span />}
          {next ? <Button asChild><Link to="/guida/$codice" params={{ codice: next.id }}>{t.next} {next.number}<ArrowRight className="size-4" /></Link></Button> : null}
        </nav>
      </div>
  );
}
