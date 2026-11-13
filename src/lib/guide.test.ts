import { test } from "node:test";
import assert from "node:assert/strict";
import { filesForLanguage, generateGuidePassword, normalizeGuidePassword, parseStopKey, stopUrl, type GuideFile } from "./guide";

const f = (id: string, kind: string, language: string, position = 0): GuideFile =>
  ({ id, stop_id: "s", kind, language, label: null, file_url: id, position });

test("il QR punta all'id permanente della tappa, non al numero", () => {
    assert.equal(stopUrl("https://museo.it/", "abc"), "https://museo.it/guida/abc");
  });
test("accetta sia il numero digitato sia l'id del QR", () => {
    assert.deepEqual(parseStopKey("12"), { number: 12 });
    assert.deepEqual(parseStopKey("0B0E1C2D-1111-2222-3333-444455556666"), { id: "0b0e1c2d-1111-2222-3333-444455556666" });
    assert.equal(parseStopKey("ciao"), null);
  });
test("in inglese mostra l'audio inglese e non quello italiano", () => {
    const files = [f("it", "audio", "it"), f("en", "audio", "en"), f("both", "audio", "all")];
    assert.deepEqual(filesForLanguage(files, "audio", "en").map((x) => x.id), ["en", "both"]);
  });

test("la password generata ha 6 caratteri leggibili senza 0, O, 1, I", () => {
    const p = generateGuidePassword();
    assert.equal(p.length, 6);
    assert.match(p, /^[A-HJ-NP-Z2-9]+$/);
  });
test("la password digitata dal visitatore ignora spazi e minuscole", () => {
    assert.equal(normalizeGuidePassword("  ab3k "), "AB3K");
  });
