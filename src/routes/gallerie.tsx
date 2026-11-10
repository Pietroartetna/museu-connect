import { GalleryTree } from "@/components/GalleryTree";
import { PublicMuseumLayout } from "@/components/PublicMuseumLayout";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StoredImage } from "@/components/StoredImage";
import { StoredMedia } from "@/components/StoredMedia";

export const Route = createFileRoute("/gallerie")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Gallerie — Casa Museo Nicolosi" },
      {
        name: "description",
        content: "Raccolte fotografiche della Casa Museo della Civiltà Contadina di Nicolosi.",
      },
      { property: "og:title", content: "Gallerie — Casa Museo Nicolosi" },
      { property: "og:description", content: "Fotografie degli oggetti e della memoria contadina." },
    ],
  }),
  component: GalleriePage,
});

function GalleriePage() {
 return <PublicMuseumLayout><h1 className="text-3xl">Gallerie</h1><GalleryTree /></PublicMuseumLayout>;
}
