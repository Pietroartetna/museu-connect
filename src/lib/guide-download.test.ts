import { test } from "node:test";
import assert from "node:assert/strict";
import { guideCookie, guideDownloadUrl, guideStoragePath } from "./guide-download";

test("audioguide files use the password-protected endpoint, not a direct storage URL", () => {
  assert.equal(guideDownloadUrl("123"), "/api/public/guide-file/123");
  assert.equal(guideStoragePath("museo/guida/tappa/audio.mp3"), "guida/tappa/audio.mp3");
});
test("public museum photos and documents cannot be routed through the protected audioguide", () => {
  assert.equal(guideStoragePath("museo/documenti/brochure.pdf"), null);
  assert.equal(guideStoragePath("museo/stanze/foto.webp"), null);
  assert.equal(guideStoragePath("museo/guida/../documenti/brochure.pdf"), null);
  assert.equal(guideStoragePath("https://example.com/file.mp3"), null);
});
test("visitor session is browser-session-only and unavailable to scripts", () => {
  assert.equal(guideCookie("abc", true), "museum-guide=abc; Path=/api/public/guide-file; HttpOnly; SameSite=Strict; Secure");
});