import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, MapPin, Phone } from "lucide-react";
import heroImage from "@/assets/hero-casa-museo.jpg";
import { MuseumNav } from "@/components/MuseumNav";
import { useSiteContent } from "@/lib/site-content";
import { StoredImage } from "@/components/StoredImage";
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
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MuseoPage,
});

type Collezione = {
  title: string;
  text: string;
  link?: { to: "/stanze"; label: string };
};

const collezioni: Collezione[] = [
  {
    title: "Gli ambienti",
    text: "Una cucina in muratura, due camere da letto e i resti di un antico palmento dove avveniva la vinificazione mediante pigiatura.",
    link: { to: "/stanze", label: "Visita le stanze" },
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
  const text=useSiteContent();
  return (
    <div className="min-h-screen bg-background">
      <MuseumNav />

      <section className="relative isolate flex min-h-[min(52svh,560px)] items-end overflow-hidden">
        {text("museo.banner", "") ? <StoredImage reference={text("museo.banner", "")} alt={text("site.caption", "Casa Museo")} className="absolute inset-0 h-full w-full object-cover object-center" /> : <img
          src={heroImage}
          alt="Ambienti della Casa Museo della Civiltà Contadina di Nicolosi"
          width={1600}
          height={1008}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-lava via-lava/60 to-lava/20" />
        <div className="relative z-10 mx-auto w-full max-w-4xl px-5 pb-8 pt-20 text-lava-foreground sm:px-6 sm:pb-12 sm:pt-24">
          <p className="text-sm uppercase tracking-[0.25em] opacity-80">Il Museo</p>
          <h1 className="mt-3 text-3xl leading-tight break-words [overflow-wrap:anywhere] sm:text-4xl lg:text-5xl">
            {text("site.name","Casa Museo della Civiltà Contadina")}
          </h1>
          <p className="mt-3 text-base opacity-85">{text("site.caption","Intitolato al Dott. Lucio Messina")}</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-12">
        <h2 className="text-3xl">La storia</h2>
        <p className="mt-4 text-muted-foreground">
          {text("museo.history", "La Casa Museo della Civiltà Contadina di Nicolosi è una fedele ricostruzione di un'abitazione rurale dell'Etna tra la fine dell'Ottocento e i primi del Novecento. Situata nel centro storico di Nicolosi, in Via Garibaldi 58, custodisce attrezzi agricoli, utensili domestici, tessuti, oggetti di religiosità popolare e molto altro, offrendo ai visitatori un'immersione autentica nella vita contadina siciliana.")}
        </p>
        <p className="mt-4 text-muted-foreground">
          {text("museo.biography", "Il museo è intitolato alla memoria del Dott. Lucio Messina, già vice-prefetto di Catania. Gli ambienti restituiscono i gesti quotidiani di una comunità che viveva di agricoltura e pastorizia: la panificazione, la vendemmia, la tessitura, la cura della casa e degli animali.")}
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-6">
        <h2 className="text-3xl">Le collezioni</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {collezioni.map((item,index) => (
            <article key={item.title} className="rounded-xl border bg-card p-6 shadow-soft">
              <h3 className="text-xl text-primary">{text(`collection.${index}.title`,item.title)}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{text(`collection.${index}.text`,item.text)}</p>
              {item.link && (
                <Link
                  to={item.link.to}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  {item.link.label}
                  <ArrowRight className="size-4" />
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-3xl">Informazioni generali</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { icon: MapPin, label: text("contact.address","Via G. Garibaldi 58, 95052 Nicolosi (CT)") },
            { icon: Clock, label: text("contact.hours","Da martedì a sabato, 9:30 – 12:30") },
            { icon: Phone, label: text("contact.phone","Tel. 095 910980") },
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
          {text("contact.visits","Ingresso libero. Visite guidate su richiesta, anche per scolaresche e gruppi.")}
        </p>
      </section>

      <SiteFooter />
    </div>
  );
}
