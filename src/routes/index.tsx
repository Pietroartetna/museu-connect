import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, MapPin, Phone, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-casa-museo.jpg";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter, SocialLinks } from "@/components/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Casa Museo Civiltà Contadina di Nicolosi | Area soci" },
      {
        name: "description",
        content:
          "Ricostruzione di un'abitazione rurale etnea di fine Ottocento. Visita le stanze, scopri gli artisti, partecipa agli eventi e associati alla Casa Museo di Nicolosi.",
      },
      { property: "og:title", content: "Casa Museo Civiltà Contadina di Nicolosi" },
      {
        property: "og:description",
        content:
          "Stanze, artisti, eventi e gallerie della Casa Museo della Civiltà Contadina di Nicolosi.",
      },
    ],
  }),
  component: Home,
});

const aree = [
  {
    title: "Le stanze",
    text: "La cucina, la camera da letto, il magazzino degli attrezzi: ogni ambiente racconta la vita rurale ai piedi dell'Etna.",
  },
  {
    title: "Artisti",
    text: "Maestri di ieri e voci contemporanee del territorio, dalla pietra lavica alla ceramica.",
  },
  {
    title: "Eventi",
    text: "Visite guidate, laboratori e serate a tema. I soci si iscrivono direttamente dall'app.",
  },
  {
    title: "Gallerie",
    text: "Raccolte fotografiche degli oggetti, delle feste e della memoria contadina nicolosita.",
  },
];

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader light />

      <section className="relative isolate">
        <img
          src={heroImage}
          alt="Interno della Casa Museo della Civiltà Contadina di Nicolosi"
          width={1600}
          height={1008}
          className="h-[78vh] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-lava via-lava/60 to-lava/20" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-4xl px-6 pb-16 text-lava-foreground">
          <p className="text-sm uppercase tracking-[0.25em] opacity-80">Porta dell'Etna</p>
          <h1 className="mt-3 text-4xl leading-tight md:text-6xl">
            Casa Museo della Civiltà Contadina
          </h1>
          <p className="mt-2 text-sm opacity-80">Intitolato al Dott. Lucio Messina</p>
          <p className="mt-4 max-w-2xl text-base opacity-85 md:text-lg">
            Nel cuore del centro storico di Nicolosi, una fedele ricostruzione dell'abitazione
            rurale etnea tra fine Ottocento e inizio Novecento.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/auth">
                Associati alla Casa Museo <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/museo">Scopri il museo</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pt-14">
        <h2 className="text-3xl">Il Museo</h2>
        <p className="mt-4 text-muted-foreground">
          La Casa Museo della Civiltà Contadina di Nicolosi è una fedele ricostruzione di
          un'abitazione rurale dell'Etna tra la fine dell'Ottocento e i primi del Novecento. Situata
          nel centro storico, in Via Garibaldi 58, custodisce attrezzi agricoli, utensili domestici,
          tessuti, oggetti di religiosità popolare e molto altro, offrendo ai visitatori
          un'immersione autentica nella vita contadina siciliana.
        </p>
        <Button asChild variant="link" className="mt-2 px-0">
          <Link to="/museo">
            Storia e informazioni generali <ArrowRight className="size-4" />
          </Link>
        </Button>
      </section>


      <section className="mx-auto grid max-w-6xl gap-4 px-6 py-12 md:grid-cols-3">
        {[
          { icon: MapPin, label: "Via G. Garibaldi 58, Nicolosi (CT)" },
          { icon: Clock, label: "Martedì – Sabato, 9:30 – 12:30" },
          { icon: Phone, label: "095 910980" },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-soft"
          >
            <Icon className="size-5 text-primary" />
            <span className="text-sm">{label}</span>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-8">
        <h2 className="text-3xl">Le aree della Casa Museo</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Ogni area è consultabile dai soci registrati e viene aggiornata dall'amministrazione
          direttamente dall'app.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {aree.map((area) => (
            <article key={area.title} className="rounded-xl border bg-card p-6 shadow-soft">
              <h3 className="text-xl text-primary">{area.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{area.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-2xl border bg-paper p-8 text-center shadow-soft">
          <h2 className="text-2xl">Diventa socio</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Registrati con nome, cognome, telefono, email e una tua foto: potrai consultare tutte le
            aree e iscriverti agli eventi.
          </p>
          <Button asChild className="mt-5">
            <Link to="/auth">Registrati ora</Link>
          </Button>
          <SocialLinks className="mt-6 flex flex-wrap justify-center gap-2" />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
