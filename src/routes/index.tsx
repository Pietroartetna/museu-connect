import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, MapPin, Phone, Mail, ArrowRight, DoorOpen, Palette, CalendarDays, Images } from "lucide-react";
import heroImage from "@/assets/hero-casa-museo.jpg";
import { Button } from "@/components/ui/button";
import { MuseumNav } from "@/components/MuseumNav";
import { useSiteContent } from "@/lib/site-content";
import { StoredImage } from "@/components/StoredImage";
import { SiteFooter, SocialLinks } from "@/components/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Casa Museo Civiltà Contadina di Nicolosi | Visita il museo" },
      {
        name: "description",
        content:
          "Ricostruzione di un'abitazione rurale etnea di fine Ottocento. Visita le stanze, scopri gli artisti, scopri gli eventi alla Casa Museo di Nicolosi.",
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
    to: "/stanze",
    icon: DoorOpen,
    title: "Le stanze",
    text: "La cucina, la camera da letto, il magazzino degli attrezzi: ogni ambiente racconta la vita rurale ai piedi dell'Etna.",
  },
  {
    to: "/artisti",
    icon: Palette,
    title: "Artisti",
    text: "Maestri di ieri e voci contemporanee del territorio, dalla pietra lavica alla ceramica.",
  },
  {
    to: "/eventi",
    icon: CalendarDays,
    title: "Eventi",
    text: "Visite guidate, laboratori e serate a tema della Casa Museo.",
  },
  {
    to: "/gallerie",
    icon: Images,
    title: "Gallerie",
    text: "Raccolte fotografiche degli oggetti, delle feste e della memoria contadina nicolosita.",
  },
 ] as const;

function Home() {
  const text=useSiteContent();
  const address = text("contact.address", "Via G. Garibaldi 58, 95052 Nicolosi (CT)");
  const phone = text("contact.phone", "095 910980");
  const email = text("contact.email", "casamuseonicolosi@gmail.com");
  return (
    <div className="min-h-screen bg-background">
      <MuseumNav />

      <section className="relative isolate flex min-h-[min(78svh,760px)] items-end overflow-hidden">
        {text("home.banner", "") ? <StoredImage reference={text("home.banner", "")} alt={text("site.caption", "Casa Museo")} className="absolute inset-0 h-full w-full object-cover object-center" /> : <img
          src={heroImage}
          alt="Interno della Casa Museo della Civiltà Contadina di Nicolosi"
          width={1600}
          height={1008}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-lava via-lava/60 to-lava/20" />
        <div className="relative z-10 mx-auto w-full max-w-4xl px-5 pb-8 pt-20 text-lava-foreground sm:px-6 sm:pb-12 sm:pt-24 lg:pb-16">
          <p className="text-sm uppercase tracking-[0.25em] opacity-80">{text("home.eyebrow","Porta dell'Etna")}</p>
          <h1 className="mt-3 text-3xl leading-tight break-words [overflow-wrap:anywhere] sm:text-4xl lg:text-6xl">
            {text("site.name","Casa Museo della Civiltà Contadina")}
          </h1>
          <p className="mt-2 text-sm opacity-80">{text("site.caption","Intitolato al Dott. Lucio Messina")}</p>
          <p className="mt-4 max-w-2xl text-base opacity-85 md:text-lg">
{text("home.description", "Nel cuore del centro storico di Nicolosi, una fedele ricostruzione dell’abitazione rurale etnea tra fine Ottocento e inizio Novecento.")}
          </p>
          <div className="mt-6 flex flex-wrap gap-3 [&>a]:h-auto [&>a]:min-h-11 [&>a]:max-w-full [&>a]:whitespace-normal [&>a]:py-3">
            <Button asChild size="lg">
              <Link to="/stanze">
                Visita le stanze <ArrowRight className="size-4" />
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
          {text("home.history", "La Casa Museo della Civiltà Contadina di Nicolosi è una fedele ricostruzione di un'abitazione rurale dell'Etna tra la fine dell'Ottocento e i primi del Novecento. Situata nel centro storico, in Via Garibaldi 58, custodisce attrezzi agricoli, utensili domestici, tessuti, oggetti di religiosità popolare e molto altro, offrendo ai visitatori un'immersione autentica nella vita contadina siciliana.")}
        </p>
        <Button asChild variant="link" className="mt-2 px-0">
          <Link to="/museo">
            Storia e informazioni generali <ArrowRight className="size-4" />
          </Link>
        </Button>
      </section>


      <section className="mx-auto max-w-6xl px-6 pb-8 pt-12">
        <h2 className="text-3xl">Le aree della Casa Museo</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {aree.map((area) => (
            <article key={area.title} className="rounded-xl border bg-card p-6 shadow-soft">
              <h3 className="text-xl text-primary">
                <Button asChild variant="link" className="h-auto justify-start whitespace-normal p-0 font-display text-xl">
                  <Link to={area.to}><area.icon className="size-5 shrink-0" aria-hidden="true" />{area.title}</Link>
                </Button>
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{area.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="visit-info" className="mt-10 border-y border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
          <h2 id="visit-info" className="text-3xl">Indirizzo, orari e contatti</h2>
          <div className="mt-8 grid gap-8 lg:grid-cols-3 lg:gap-10">
            <div className="min-w-0">
              <h3 className="flex items-center gap-3 text-xl"><MapPin className="size-5 shrink-0 text-primary" aria-hidden="true" />Dove siamo</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{address}</p>
              <Button asChild variant="link" className="mt-2 h-auto whitespace-normal px-0 text-left">
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer">Indicazioni su Google Maps <ArrowRight className="size-4 shrink-0" /></a>
              </Button>
            </div>
            <div className="min-w-0">
              <h3 className="flex items-center gap-3 text-xl"><Clock className="size-5 shrink-0 text-primary" aria-hidden="true" />Orari di apertura</h3>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{text("contact.hours", "Da martedì a sabato, 9:30 – 12:30")}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text("contact.visits", "Ingresso libero — visite guidate su richiesta")}</p>
            </div>
            <div className="min-w-0">
              <h3 className="flex items-center gap-3 text-xl"><Mail className="size-5 shrink-0 text-primary" aria-hidden="true" />Contatti</h3>
              <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="mt-3 flex items-center gap-3 text-sm hover:text-primary"><Phone className="size-4 shrink-0" aria-hidden="true" />{phone}</a>
              <a href={`mailto:${email}`} className="mt-3 flex items-start gap-3 text-sm hover:text-primary"><Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><span className="min-w-0 break-words [overflow-wrap:anywhere]">{email}</span></a>
              <Button asChild variant="link" className="mt-2 h-auto px-0"><Link to="/contatti">Scrivi al museo <ArrowRight className="size-4" /></Link></Button>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-6">
            <h3 className="text-lg">Seguici</h3>
            <SocialLinks className="mt-3 flex flex-wrap gap-2" />
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
