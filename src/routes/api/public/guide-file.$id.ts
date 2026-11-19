import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { guideStoragePath } from "@/lib/guide-download";

export const Route = createFileRoute("/api/public/guide-file/$id")({
  server: { handlers: {
    GET: async ({ request, params }) => {
      const headers = new Headers({ "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer" });
      const fail = (status: number) => {
        if (status !== 401) return new Response("File non disponibile", { status, headers });
        headers.set("Content-Type", "text/html; charset=utf-8");
        return new Response('<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>File protetto — Casa Museo Nicolosi</title><h1>File dell’audioguida protetto</h1><p>Inserisci la password nell’<a href="/guida">Audioguida</a> per aprire il file.</p></html>', { status, headers });
      };
      if (!z.string().uuid().safeParse(params.id).success) return fail(404);
      const token = request.headers.get("cookie")?.split(";").map((c) => c.trim()).find((c) => c.startsWith("museum-guide="))?.slice("museum-guide=".length);
      if (!token || !/^[a-f0-9]{64}$/.test(token)) return fail(401);
      const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
      const base = process.env['SUPABASE_URL'];
      if (!key || !base) return fail(503);
      const client = createClient<Database>(base, key, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        } },
      });
      // Validate the current password and publication before loading privileged storage access.
      const { data: reference, error } = await client.rpc("guide_file_access", { _token: token, _file_id: params.id });
      if (error) return fail(503);
      if (!reference) return fail(401);
      const path = guideStoragePath(reference);
      if (!path) return fail(404);
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: signed, error: storageError } = await supabaseAdmin.storage.from("museo").createSignedUrl(path, 30);
      if (storageError || !signed) return fail(404);
      const range = request.headers.get("range");
      if (range && !/^bytes=\d*-\d*$/.test(range)) return fail(416);
      // Proxy the bytes: never send visitors a reusable password-free storage URL.
      const upstream = await fetch(signed.signedUrl, { headers: range ? { Range: range } : {} });
      if (![200, 206, 416].includes(upstream.status)) return fail(404);
      for (const name of ["content-type", "content-length", "content-range", "accept-ranges"]) {
        const value = upstream.headers.get(name);
        if (value) headers.set(name, value);
      }
      return new Response(upstream.body, { status: upstream.status, headers });
    },
  } },
});