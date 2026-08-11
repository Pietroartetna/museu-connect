import { Link } from "@tanstack/react-router";
import { Facebook, Globe, Instagram, Youtube } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const icons: Record<string, typeof Facebook> = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  globe: Globe,
};

export function SocialLinks({ className }: { className?: string }) {
  const { data } = useQuery({
    queryKey: ["site-links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_links")
        .select("id, label, url, icon")
        .order("position");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className={className}>
      {(data ?? []).map((link) => {
        const Icon = icons[link.icon ?? "globe"] ?? Globe;
        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-full border border-border/40 px-3 py-1.5 text-sm transition-colors hover:border-primary hover:text-primary"
          >
            <Icon className="size-4" />
            {link.label}
          </a>
        );
      })}
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="surface-lava mt-24">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 md:grid-cols-3">
        <div>
          <h3 className="font-display text-lg">Casa Museo della Civiltà Contadina</h3>
          <p className="mt-2 text-sm opacity-75">
            Via G. Garibaldi 58, 95052 Nicolosi (CT)
          </p>
          <p className="text-sm opacity-75">Tel. 095 910980</p>
        </div>
        <div>
          <h3 className="font-display text-lg">Orari</h3>
          <p className="mt-2 text-sm opacity-75">Da martedì a sabato, 9:30 – 12:30</p>
          <p className="text-sm opacity-75">Ingresso libero — visite guidate su richiesta</p>
        </div>
        <div>
          <h3 className="font-display text-lg">Seguici</h3>
          <SocialLinks className="mt-3 flex flex-wrap gap-2" />
          <Link to="/museo" className="mt-4 block text-sm underline opacity-80">
            Il Museo — storia e info
          </Link>
          <Link to="/auth" className="mt-1 inline-block text-sm underline opacity-80">
            Area soci
          </Link>

        </div>
      </div>
      <div className="border-t border-white/10 px-6 py-4 text-center text-xs opacity-60">
        © {new Date().getFullYear()} Casa Museo della Civiltà Contadina — Nicolosi
      </div>
    </footer>
  );
}
