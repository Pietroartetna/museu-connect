import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { StoredImage } from "./StoredImage";
import { StoredMedia } from "./StoredMedia";

export function GalleryTree({pageId}: {pageId?: string}) {
  const [selected,setSelected] = useState<string|null>(null);
  const {data:galleries=[]} = useQuery({queryKey:["galleries","tree"],queryFn:async()=>{
    const {data,error}=await supabase.from("galleries").select("*").order("title"); if(error) throw error; return data;
  }});
  const {data:media=[]}=useQuery({queryKey:["gallery-images",selected],enabled:Boolean(selected),queryFn:async()=>{
    if(!selected) return []; const {data,error}=await supabase.from("gallery_images").select("*").eq("gallery_id",selected).order("position"); if(error) throw error; return data;
  }});
  const visible=galleries.filter(g=>!pageId || g.page_id===pageId);
  const children=visible.filter(g=>g.parent_id===selected || (!selected && !visible.some(p=>p.id===g.parent_id)));
  const current=visible.find(g=>g.id===selected);
  return <section className="mt-8 space-y-5">
    {current ? <div className="flex items-center gap-4"><Button variant="outline" onClick={()=>setSelected(current.parent_id)}>Indietro</Button><h2 className="text-2xl">{current.title}</h2></div> : null}
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{children.map(g=><Button key={g.id} variant="outline" className="h-auto flex-col items-stretch overflow-hidden p-0 text-left whitespace-normal" onClick={()=>setSelected(g.id)}><StoredImage reference={g.cover_url} alt={g.title} className="h-44 w-full"/><span className="p-4"><span className="block font-display text-xl">{g.title}</span><span className="block text-sm text-muted-foreground">{g.description}</span></span></Button>)}</div>
    {selected ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{media.map(m=><figure key={m.id}><StoredMedia reference={m.image_url} mediaType={m.media_type} alt={m.caption ?? ""} className="h-56 w-full rounded-lg"/><figcaption className="mt-2 whitespace-pre-line text-sm">{m.caption}</figcaption></figure>)}</div> : null}
    {!children.length && !media.length ? <p className="text-muted-foreground">Nessun contenuto disponibile.</p> : null}
  </section>;
}