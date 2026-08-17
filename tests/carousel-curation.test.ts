import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  summarizeCarouselManifest,
  validateCarouselManifest,
  type CarouselCurationItem,
  type CarouselCurationManifest,
} from "../scripts/carousel-curation";

const categories = [
  ...Array<"venue">(8).fill("venue"),
  ...Array<"drink">(14).fill("drink"),
  ...Array<"people">(18).fill("people"),
];

function makeManifest(): CarouselCurationManifest {
  return {
    items: categories.map((category, index) => ({
      file: `existing-${String(index + 1).padStart(2, "0")}.jpg`,
      category,
      sourceType: "existing",
      sourceUrl: `legacy://existing-${String(index + 1).padStart(2, "0")}.jpg`,
      credit: "No Bar Đà Lạt",
      rightsStatus: "owner",
    })),
  };
}

async function createMediaFixture(manifest: CarouselCurationManifest) {
  const mediaDir = await mkdtemp(path.join(os.tmpdir(), "nobar-carousel-"));
  await Promise.all(
    manifest.items.map(({ file }) =>
      writeFile(path.join(mediaDir, file), "fixture"),
    ),
  );
  return mediaDir;
}

test("summarizes incomplete manifests without treating them as valid", () => {
  const manifest = makeManifest();
  manifest.items = manifest.items.slice(0, 22);

  assert.deepEqual(summarizeCarouselManifest(manifest), {
    venue: 8,
    drink: 14,
    people: 0,
  });
});

test("accepts exactly 8 venue, 14 drink, and 18 people items", async () => {
  const manifest = makeManifest();
  const mediaDir = await createMediaFixture(manifest);

  assert.deepEqual(await validateCarouselManifest(manifest, mediaDir), {
    venue: 8,
    drink: 14,
    people: 18,
  });
});

test("rejects a duplicate media filename", async () => {
  const manifest = makeManifest();
  manifest.items[39].file = manifest.items[0].file;
  const mediaDir = await createMediaFixture(manifest);

  await assert.rejects(
    validateCarouselManifest(manifest, mediaDir),
    /duplicate carousel file/i,
  );
});

for (const field of ["sourceUrl", "credit"] as const) {
  test(`rejects a missing ${field}`, async () => {
    const manifest = makeManifest();
    manifest.items[0][field] = "";
    const mediaDir = await createMediaFixture(manifest);

    await assert.rejects(
      validateCarouselManifest(manifest, mediaDir),
      new RegExp(`${field}.*required`, "i"),
    );
  });
}

test("rejects an unsupported rights status", async () => {
  const manifest = makeManifest();
  manifest.items[0].rightsStatus =
    "unknown" as CarouselCurationItem["rightsStatus"];
  const mediaDir = await createMediaFixture(manifest);

  await assert.rejects(
    validateCarouselManifest(manifest, mediaDir),
    /rights status.*unsupported/i,
  );
});

test("rejects a manifest with fewer than 40 items", async () => {
  const manifest = makeManifest();
  manifest.items.pop();
  const mediaDir = await createMediaFixture(manifest);

  await assert.rejects(
    validateCarouselManifest(manifest, mediaDir),
    /40 items/i,
  );
});

test("rejects a missing media file", async () => {
  const manifest = makeManifest();
  const mediaDir = await createMediaFixture(manifest);
  manifest.items[0].file = "missing.jpg";

  await assert.rejects(
    validateCarouselManifest(manifest, mediaDir),
    /media file.*missing/i,
  );
});
