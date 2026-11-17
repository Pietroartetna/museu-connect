import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";
import type { Database } from "@/integrations/supabase/types";
import { guideCookie } from "./guide-download";
import type { GuideStop } from "./guide";

export const openGuide = createServerFn({ method: "POST" })
  .inputValidator(z.object({ password: z.string().max(256) }))
  .handler(async ({ data }) => {
    const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
    const url = process.env['SUPABASE_URL'];
    if (!key || !url) throw new Error("Servizio audioguida non disponibile");
    const client = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      } },
    });
    setResponseHeader("Cache-Control", "private, no-store");
    const { data: result, error } = await client.rpc("guide_open", { _password: data.password });
    if (error) throw new Error("Accesso audioguida non disponibile");
    const parsed = z.object({ ok: z.boolean(), stops: z.array(z.unknown()), token: z.string().regex(/^[a-f0-9]{64}$/).optional() }).parse(result);
    if (parsed.ok && parsed.token) {
      setResponseHeader("Set-Cookie", guideCookie(parsed.token, new URL(getRequest().url).protocol === "https:"));
    } else {
      setResponseHeader("Set-Cookie", `${guideCookie("", new URL(getRequest().url).protocol === "https:")}; Max-Age=0`);
    }
    return { ok: parsed.ok, stops: parsed.stops as GuideStop[] };
  });