import { test } from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

test("gallery cover photos are readable without signing in", async () => {
  const url = process.env['VITE_SUPABASE_URL'];
  const key = process.env['VITE_SUPABASE_PUBLISHABLE_KEY'];
  assert.ok(url && key, "Cloud configuration is required for this integration test");
  const visitor = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await visitor.from("galleries").select("cover_url");
  assert.equal(error, null);
  const covers = (data ?? []).flatMap((row) =>
    row.cover_url?.startsWith("museo/") ? [row.cover_url.slice(6)] : [],
  );
  assert.ok(covers.length > 0, "At least one uploaded cover must be tested");
  for (const path of covers) {
    const result = await visitor.storage.from("museo").createSignedUrl(path, 60);
    assert.equal(result.error, null, "Visitors must be able to read gallery covers");
    assert.ok(result.data?.signedUrl);
    const response = await fetch(result.data.signedUrl);
    assert.equal(response.status, 200);
    assert.ok(response.headers.get("content-type")?.startsWith("image/"));
  }
});