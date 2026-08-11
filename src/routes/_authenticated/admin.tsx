import { createFileRoute, Link } from "@tanstack/react-router";
import { useIsAdmin } from "@/lib/auth";
import { CrudSection } from "@/components/admin/CrudSection";
import { RegistrationsSection } from "@/components/admin/RegistrationsSection";
import { GalleryImagesSection } from "@/components/admin/GalleryImagesSection";
import { EntityImagesSection } from "@/components/admin/EntityImagesSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Amministrazione — Casa Museo Nicolosi" },
      {
        name: "description",
        content: "Gestione di stanze, artisti, eventi, iscrizioni e gallerie della Casa Museo.",
      },
      { property: "og:title", content: "Amministrazione — Casa Museo Nicolosi" },
      { property: "og:description", content: "Pannello di gestione della Casa Museo di Nicolosi." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { data: isAdmin, isLoading } = useIsAdmin();

  if (isLoading) return <p className="text-sm text-muted-foreground">Verifica permessi…</p>;

  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <h1 className="text-2xl">Area riservata</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Questa sezione è accessibile solo agli amministratori della Casa Museo.
        </p>
        <Link to="/area" className="mt-4 inline-block text-sm underline">
          Torna all'area soci
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl">Amministrazione</h1>
      <p className="mt-2 text-muted-foreground">
        Crea, aggiorna ed elimina i contenuti della Casa Museo direttamente dall'app.
      </p>

      <Tabs defaultValue="stanze" className="mt-8">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="stanze">Stanze</TabsTrigger>
          <TabsTrigger value="artisti">Artisti</TabsTrigger>
          <TabsTrigger value="eventi">Eventi</TabsTrigger>
          <TabsTrigger value="iscrizioni">Iscrizioni</TabsTrigger>
          <TabsTrigger value="gallerie">Gallerie</TabsTrigger>
          <TabsTrigger value="immagini">Immagini</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
        </TabsList>

        <TabsContent value="stanze" className="mt-6">
          <CrudSection
            table="rooms"
            queryKey="rooms"
            title="Stanze"
            description="Gli ambienti della casa contadina."
            select="id, name, description, image_url, position"
            orderBy="position"
            titleField="name"
            imageField="image_url"
            fields={[
              { name: "name", label: "Nome stanza", type: "text", required: true },
              { name: "position", label: "Ordine", type: "number" },
              { name: "description", label: "Descrizione", type: "textarea" },
              { name: "image_url", label: "Immagine", type: "image" },
            ]}
          />
          <div className="mt-10 border-t pt-8">
            <EntityImagesSection
              entityType="room"
              table="rooms"
              labelField="name"
              title="Galleria delle stanze"
              description="Aggiungi o rimuovi le foto mostrate all'interno di ogni stanza."
            />
          </div>
        </TabsContent>

        <TabsContent value="artisti" className="mt-6">
          <CrudSection
            table="artists"
            queryKey="artists"
            title="Artisti"
            description="Artisti storici e contemporanei."
            select="id, name, era, bio, image_url"
            orderBy="name"
            titleField="name"
            imageField="image_url"
            renderExtra={(row) => String(row['era'] ?? "")}
            fields={[
              { name: "name", label: "Nome", type: "text", required: true },
              {
                name: "era",
                label: "Periodo",
                type: "select",
                required: true,
                options: [
                  { value: "storico", label: "Storico" },
                  { value: "contemporaneo", label: "Contemporaneo" },
                ],
              },
              { name: "bio", label: "Biografia", type: "textarea" },
              { name: "image_url", label: "Immagine", type: "image" },
            ]}
          />
        </TabsContent>

        <TabsContent value="eventi" className="mt-6">
          <CrudSection
            table="events"
            queryKey="events"
            title="Eventi"
            description="Iniziative, visite guidate e laboratori."
            select="id, title, description, image_url, location, starts_at, is_paid, price, capacity"
            orderBy="starts_at"
            ascending={false}
            titleField="title"
            imageField="image_url"
            renderExtra={(row) =>
              row['starts_at']
                ? new Date(String(row['starts_at'])).toLocaleString("it-IT", { dateStyle: "medium" })
                : ""
            }
            fields={[
              { name: "title", label: "Titolo", type: "text", required: true },
              { name: "starts_at", label: "Data e ora", type: "datetime", required: true },
              { name: "location", label: "Luogo", type: "text" },
              { name: "capacity", label: "Posti disponibili", type: "number" },
              { name: "is_paid", label: "Evento a pagamento", type: "checkbox" },
              { name: "price", label: "Prezzo (€)", type: "number" },
              { name: "description", label: "Descrizione", type: "textarea" },
              { name: "image_url", label: "Immagine", type: "image" },
            ]}
          />
        </TabsContent>

        <TabsContent value="iscrizioni" className="mt-6">
          <RegistrationsSection />
        </TabsContent>

        <TabsContent value="gallerie" className="mt-6">
          <CrudSection
            table="galleries"
            queryKey="galleries"
            title="Gallerie"
            description="Raccolte fotografiche del museo."
            select="id, title, description, cover_url"
            orderBy="created_at"
            ascending={false}
            titleField="title"
            imageField="cover_url"
            fields={[
              { name: "title", label: "Titolo", type: "text", required: true },
              { name: "description", label: "Descrizione", type: "textarea" },
              { name: "cover_url", label: "Copertina", type: "image" },
            ]}
          />
        </TabsContent>

        <TabsContent value="immagini" className="mt-6">
          <GalleryImagesSection />
        </TabsContent>

        <TabsContent value="social" className="mt-6">
          <CrudSection
            table="site_links"
            queryKey="site-links"
            title="Link social"
            description="Collegamenti diretti ai profili social del museo."
            select="id, label, url, icon, position"
            orderBy="position"
            titleField="label"
            renderExtra={(row) => String(row['url'] ?? "")}
            fields={[
              { name: "label", label: "Etichetta", type: "text", required: true },
              { name: "url", label: "URL", type: "text", required: true },
              {
                name: "icon",
                label: "Icona",
                type: "select",
                options: [
                  { value: "facebook", label: "Facebook" },
                  { value: "instagram", label: "Instagram" },
                  { value: "youtube", label: "YouTube" },
                  { value: "globe", label: "Sito web" },
                ],
              },
              { name: "position", label: "Ordine", type: "number" },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
