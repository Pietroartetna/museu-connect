import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { PublicMuseumLayout } from "@/components/PublicMuseumLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { contactMessageSchema, MUSEO_EMAIL } from "@/lib/contact";
import { submitContact } from "@/lib/contact.functions";
import { useSiteContent } from "@/lib/site-content";

export const Route=createFileRoute("/contatti")({head:()=>({meta:[{title:"Contatti — Casa Museo Nicolosi"},{name:"description",content:"Indirizzo, email, telefono e messaggi alla Casa Museo della Civiltà Contadina di Nicolosi."},{property:"og:title",content:"Contatti — Casa Museo Nicolosi"},{property:"og:description",content:"Contatta il museo e trova le indicazioni per la visita."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),component:Contacts});
function Contacts(){
 const text=useSiteContent(); const send=useServerFn(submitContact);
 const [busy,setBusy]=useState(false);const [status,setStatus]=useState("");const [map,setMap]=useState(false);
 const address=text("contact.address","Via G. Garibaldi 58, 95052 Nicolosi (CT)");const email=text("contact.email",MUSEO_EMAIL);const phone=text("contact.phone","095 910980");
 useEffect(()=>{setMap(window.location.hostname.endsWith(".lovable.app"));},[]);
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();const form=e.currentTarget;const parsed=contactMessageSchema.safeParse(Object.fromEntries(new FormData(form)));if(!parsed.success){setStatus(parsed.error.issues[0]?.message ?? "Controlla i campi");return;}setBusy(true);setStatus("");try{await send({data:parsed.data});form.reset();setStatus("Messaggio ricevuto dal museo.");}catch(e){setStatus(e instanceof Error?e.message:"Invio non riuscito");}finally{setBusy(false);}}
 return <PublicMuseumLayout><h1 className="text-4xl">Contatti</h1><div className="mt-8 grid gap-12 md:grid-cols-2"><section className="space-y-5"><h2 className="text-2xl">Casa Museo della Civiltà Contadina</h2><p className="flex gap-3"><MapPin className="size-5 shrink-0"/>{address}</p><a className="flex gap-3 break-all" href={`mailto:${email}`}><Mail className="size-5 shrink-0"/>{email}</a><a className="flex gap-3" href={`tel:${phone.replace(/[^+\d]/g,"")}`}><Phone className="size-5"/>{phone}</a><p>{text("contact.hours","Da martedì a sabato, 9:30 – 12:30")}</p><Button asChild variant="outline"><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer">Indicazioni su Google Maps</a></Button>{map ? <iframe title="Mappa della Casa Museo Nicolosi" className="h-80 w-full border-0" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env['VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY']}&q=${encodeURIComponent(address)}`} />:null}</section><section><h2 className="text-2xl">Scrivi al museo</h2><form onSubmit={submit} className="mt-5 space-y-4">{([["name","Nome",80],["email","Email",160],["phone","Telefono (facoltativo)",30],["subject","Oggetto (facoltativo)",120]] as const).map(([id,label,max])=><div key={id} className="space-y-2"><Label htmlFor={`contact-${id}`}>{label}</Label><Input id={`contact-${id}`} name={id} type={id==="email"?"email":"text"} required={id==="name"||id==="email"} maxLength={max}/></div>)}<Label htmlFor="contact-message">Messaggio</Label><Textarea id="contact-message" name="message" required minLength={10} maxLength={4000} rows={6}/><Button type="submit" disabled={busy}><Send className="size-4"/>{busy?"Invio…":"Invia messaggio"}</Button><p role="status">{status}</p></form></section></div></PublicMuseumLayout>;
}