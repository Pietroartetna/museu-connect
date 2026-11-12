import { describe, expect, it } from "vitest";
import { filesForLanguage, parseStopKey, stopUrl, type GuideFile } from "./guide";

const f = (id: string, kind: string, language: string, position = 0): GuideFile =>
  ({ id, stop_id: "s", kind, language, label: null, file_url: id, position });

describe("audioguida", () => {
  it("il QR punta all'id permanente della tappa, non al numero", () => {
    expect(stopUrl("https://museo.it/", "abc")).toBe("https://museo.it/guida/abc");
  });
  it("accetta sia il numero digitato sia l'id del QR", () => {
    expect(parseStopKey("12")).toEqual({ number: 12 });
    expect(parseStopKey("0B0E1C2D-1111-2222-3333-444455556666")).toEqual({ id: "0b0e1c2d-1111-2222-3333-444455556666" });
    expect(parseStopKey("ciao")).toBeNull();
  });
  it("in inglese mostra l'audio inglese e non quello italiano", () => {
    const files = [f("it", "audio", "it"), f("en", "audio", "en"), f("both", "audio", "all")];
    expect(filesForLanguage(files, "audio", "en").map((x) => x.id)).toEqual(["en", "both"]);
  });
});
