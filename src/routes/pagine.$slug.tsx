import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PublicMuseumLayout } from "@/components/PublicMuseumLayout";
import { StoredImage } from "@/components/StoredImage";
import { entityPhotosQuery } from "@/lib/entity-gallery";
import { GalleryTree } from "@/components/GalleryTree";
import { RoomGallery } from "@/components/RoomGallery";
import { roomPhotosQuery, photosForRoom } from "@/lib/room-gallery";

export const Route=createFileRoute("/pagine/$slug")({
  loader:async({params})=>{const {data,error}=await supabase.from("museum_pages").select("*").eq("slug",params.slug).eq("published",true).maybeSingle(); if(error) throw error; if(!data) throw notFound(); return data;},
  head:({loaderData})=>({meta:[{title:`${loaderData?.title ?? "Pagina"} — Casa Museo Nicolosi`},{name:"description",content:loaderData?.description ?? "Contenuti della Casa Museo Nicolosi"},{property:"og:title",content:`${loaderData?.title ?? "Pagina"} — Casa Museo Nicolosi`},{property:"og:description",content:loaderData?.description ?? "Contenuti della Casa Museo Nicolosi"},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),
  component:Page,
});
function Page(){
 const page=Route.useLoaderData();
 const {data:photos=[]}=useQuery(roomPhotosQuery);
 const {data:artistPhotos=[]}=useQuery(entityPhotosQuery("artist"));
 const {data:rooms=[]}=useQuery({queryKey:["rooms","page",page.id],queryFn:async()=>{const {data,error}=await supabase.from("rooms").select("*").eq("page_id",page.id).order("position");if(error)throw error;return data;}});
 const {data:artists=[]}=useQuery({queryKey:["artists","page",page.id],queryFn:async()=>{const {data,error}=await supabase.from("artists").select("*").eq("page_id",page.id).order("name");if(error)throw error;return data;}});
 return <PublicMuseumLayout>{page.banner_url ? <StoredImage reference={page.banner_url} alt={page.caption ?? page.title} className="h-72 w-full"/>:null}<h1 className="mt-6 text-4xl">{page.title}</h1><p className="mt-2 text-muted-foreground">{page.caption}</p><p className="mt-5 whitespace-pre-line">{page.description}</p><p className="mt-5 whitespace-pre-line">{page.biography}</p><GalleryTree pageId={page.id}/>{rooms.map(r=><section key={r.id} className="mt-8 border-t pt-6"><h2 className="text-2xl">{r.name}</h2><p className="my-3 whitespace-pre-line">{r.description}</p><RoomGallery name={r.name} photos={photosForRoom(photos,r.id)}/></section>)}{artists.map(a=><article key={a.id} className="mt-8 border-t pt-6"><StoredImage reference={a.image_url} alt={a.name} className="h-56 w-full"/><h2 className="mt-3 text-2xl">{a.name}</h2><p className="mt-3 whitespace-pre-line">{a.bio}</p><RoomGallery name={a.name} photos={photosForRoom(artistPhotos,a.id)} entityType="artist"/></article>)}</PublicMuseumLayout>;
}