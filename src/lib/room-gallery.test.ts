import { test } from "node:test";
import assert from "node:assert/strict";
import { photosForRoom, type RoomPhoto } from "./room-gallery";

test("each room gallery includes only its own photos and descriptions", () => {
  const photos: RoomPhoto[] = [
    { id: "1", entity_id: "cucina", image_url: "museo/1.webp", caption: "Il forno", position: 0 },
    { id: "2", entity_id: "camera", image_url: "museo/2.webp", caption: "Il letto", position: 0 },
  ];
  assert.deepEqual(photosForRoom(photos, "cucina"), [photos[0]]);
  assert.deepEqual(photosForRoom(photos, "camera"), [photos[1]]);
  assert.deepEqual(photosForRoom(photos, "magazzino"), []);
});
test("each artist gallery includes only that artist’s photos and captions", () => {
  const photos: RoomPhoto[] = [
    { id: "a1", entity_id: "artist-one", image_url: "museo/artisti/one.webp", caption: "Opera in ceramica", position: 0 },
    { id: "a2", entity_id: "artist-two", image_url: "museo/artisti/two.webp", caption: "Scultura", position: 0 },
  ];
  assert.deepEqual(photosForRoom(photos, "artist-one"), [photos[0]]);
  assert.deepEqual(photosForRoom(photos, "artist-two"), [photos[1]]);
  assert.deepEqual(photosForRoom(photos, "unknown"), []);
});