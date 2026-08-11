import { createFileRoute } from "@tanstack/react-router";
import { Clock, MapPin, Phone } from "lucide-react";
import heroImage from "@/assets/hero-casa-museo.jpg";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/museo")({
  head: () => ({
    meta: [
      { title: "Il Museo — Casa Museo Civiltà Contadina di Nicolosi" },
      {
        name: "description",
        content:
          "Storia e informazioni generali della Casa Museo della Civiltà Contadina di Nicolosi, intitolata al Dott. Lucio Messina: ambienti, collezioni, orari e contatti.",
      },
      { property: "og:title", content: "Il Museo — Casa Museo Civiltà Contadina di Nicolosi" },
      {
        property: "og:description",
        content:
          "Una fedele ricostruzione dell'abitazione rurale etnea tra fine Ottocento e primi del Novecento, in Via Garibaldi 58 a Nicolosi.",
      },
      { property: "og:type", content: "article" },
    ],
  }),
  component: MuseoPage,
});

const collezioni = [
  {
    title: "Gli ambienti",
    text: "Una cucina in muratura, due camere da letto e i resti di un antico palmento dove avveniva la vinificazione mediante pigiatura.",
  },
  {
    title: "Il lavoro dei campi",
    text: "Attrezzi agricoli e arnesi delle botteghe artigiane, testimonianza della civiltà contadina e pastorale alle pendici dell'Etna.",
  },
  {
    title: "La casa e la tessitura",
    text: "Utensili domestici e per la panificazione, contenitori per la conservazione delle materie prime e un antico telaio in legno.",
  },
  {
    title: "Religiosità popolare",
    text: "Oggetti devozionali, tessuti e immagini sacre che raccontano la fede quotidiana delle famiglie nicolosite.",
  },
];

function MuseoPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader light />

      <section className="relative isolate">
        <img
          src={heroImage}
          alt="Ambienti della Casa Museo della Civiltà Contadina di Nicolosi"
          width={1600}
          height={1008}
          className="h-[52vh] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-lava via-lava/60 to-lava/20" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-4xl px-6 pb-12 text-lava-foreground">
          <p className="text-sm uppercase tracking-[0.25em] opacity-80">Il Museo</p>
          <h1 className="mt-3 text-4xl leading-tight md:text-5xl">
            Casa Museo della Civiltà Contadina
          </h1>
          <p className="mt-3 text-base opacity-85">Intitolato al Dott. Lucio Messina</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-12">
        <h2 className="text-3xl">La storia</h2>
        <p className="mt-4 text-muted-foreground">
          La Casa Museo della Civiltà Contadina di Nicolosi è una fedele ricostruzione di
          un'abitazione rurale dell'Etna tra la fine dell'Ottocento e i primi del Novecento. Situata
          nel centro storico di Nicolosi, in Via Garibaldi 58, custodisce attrezzi agricoli,
          utensili domestici, tessuti, oggetti di religiosità popolare e molto altro, offrendo ai
          visitatori un'immersione autentica nella vita contadina siciliana.
        </p>
        <p className="mt-4 text-muted-foreground">
          Il museo è intitolato alla memoria del Dott. Lucio Messina, già vice-prefetto di Catania.
          Gli ambienti restituiscono i gesti quotidiani di una comunità che viveva di agricoltura e
          pastorizia: la panificazione, la vendemmia, la tessitura, la cura della casa e degli
          animali.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-6">
        <h2 className="text-3xl">Le collezioni</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {collezioni.map((item) => (
            <article key={item.title} className="rounded-xl border bg-card p-6 shadow-soft">
              <h3 className="text-xl text-primary">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-3xl">Informazioni generali</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { icon: MapPin, label: "Via G. Garibaldi 58, 95052 Nicolosi (CT)" },
            { icon: Clock, label: "Da martedì a sabato, 9:30 – 12:30" },
            { icon: Phone, label: "Tel. 095 910980" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-soft"
            >
              <Icon className="size-5 text-primary" />
              <span className="text-sm">{label}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Ingresso libero. Visite guidate su richiesta, anche per scolaresche e gruppi.
        </p>
      </section>

      <SiteFooter />
    </div>
  );
}
