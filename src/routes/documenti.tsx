import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText } from "lucide-react";
import { PublicMuseumLayout } from "@/components/PublicMuseumLayout";
import { documentsQuery, groupByCategory, type PublicDocument } from "@/lib/documents";
import { resolveUrl } from "@/lib/storage";

export const Route = createFileRoute("/documenti")({
  head: () => ({
    meta: [
      { title: "Documenti e brochure — Casa Museo Nicolosi" },
      { name: "description", content: "Scarica brochure, volantini e documenti pubblici della Casa Museo della Civiltà Contadina di Nicolosi." },
      { property: "og:title", content: "Documenti e brochure — Casa Museo Nicolosi" },
      { property: "og:description", content: "Brochure, volantini e documenti pubblici da scaricare." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DocumentiPage,
});

function DocLink({ doc }: { doc: PublicDocument }) {
  const { data: url } = useQuery({ queryKey: ["stored-url", doc.file_url], staleTime: 30 * 60 * 1000, queryFn: () => resolveUrl(doc.file_url) });
  return (
    <a href={url ?? undefined} target="_blank" rel="noopener noreferrer" aria-disabled={!url} className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-soft transition-colors hover:border-primary">
      <FileText className="size-8 shrink-0 text-primary" />
      <span className="min-w-0 flex-1"><span className="block font-display text-lg leading-tight">{doc.title}</span>{doc.description ? <span className="block text-sm text-muted-foreground">{doc.description}</span> : null}</span>
      <Download className="size-5 shrink-0 text-muted-foreground" />
    </a>
  );
}

function DocumentiPage() {
  const { data: docs = [], isLoading } = useQuery(documentsQuery);
  const visible = docs.filter((d) => d.published && d.file_url);
  return (
    <PublicMuseumLayout>
      <h1 className="text-3xl sm:text-4xl">Documenti</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">Brochure, volantini e documenti pubblici della Casa Museo, liberamente scaricabili.</p>
      {isLoading ? <p className="mt-8 text-sm text-muted-foreground">Caricamento…</p> : null}
      {!isLoading && visible.length === 0 ? <p className="mt-8 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">Nessun documento disponibile al momento.</p> : null}
      {groupByCategory(visible).map(([cat, list]) => (
        <section key={cat} className="mt-8">
          <h2 className="text-xl">{cat}</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">{list.map((d) => <li key={d.id}><DocLink doc={d} /></li>)}</ul>
        </section>
      ))}
    </PublicMuseumLayout>
  );
}
