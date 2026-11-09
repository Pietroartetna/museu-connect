import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { contactMessageSchema, buildContactMessage } from "./contact";

export const submitContact = createServerFn({method:"POST"})
  .inputValidator((input: unknown) => contactMessageSchema.parse(input))
  .handler(async ({data}) => {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    const url = process.env["SUPABASE_URL"];
    if (!key || !url) throw new Error("Servizio contatti non disponibile");
    const client = createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>{
      const h = new Headers(init?.headers);
      if(key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
      h.set("apikey",key); return fetch(input,{...init,headers:h});
    }}});
    const {error} = await client.from("contact_submissions").insert(buildContactMessage(data));
    if(error) throw new Error("Impossibile consegnare il messaggio. Riprova.");
    return {saved:true};
  });