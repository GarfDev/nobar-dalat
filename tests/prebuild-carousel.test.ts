import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";
import sharp from "sharp";
import type { CarouselCurationManifest } from "../scripts/carousel-curation";

const execFileAsync = promisify(execFile);
const repositoryRoot = path.resolve(import.meta.dirname, "..");

test("prebuild outputs only manifest-listed media in manifest order", async () => {
  const root = await mkdtemp(
    path.join(os.tmpdir(), "nobar-carousel-prebuild-"),
  );
  const mediaDir = path.join(root, "public", "carousel-content");
  await mkdir(path.join(root, "app", "data"), { recursive: true });
  await mkdir(mediaDir, { recursive: true });

  const categories = [
    ...Array<"venue">(8).fill("venue"),
    ...Array<"drink">(14).fill("drink"),
    ...Array<"people">(18).fill("people"),
  ];
  const manifest: CarouselCurationManifest = {
    items: categories.map((category, index) => ({
      file: `curated-${String(40 - index).padStart(2, "0")}.jpg`,
      category,
      sourceType: "existing",
      sourceUrl: `legacy://curated-${index + 1}`,
      credit: "No Bar Đà Lạt",
      rightsStatus: "owner",
    })),
  };
  const jpeg = await sharp({
    create: {
      width: 24,
      height: 32,
      channels: 3,
      background: "#5b321f",
    },
  })
    .jpeg()
    .toBuffer();
  await Promise.all(
    [...manifest.items.map(({ file }) => file), "unlisted.jpg"].map((file) =>
      writeFile(path.join(mediaDir, file), jpeg),
    ),
  );
  await writeFile(
    path.join(root, "app", "data", "carousel-curation.json"),
    JSON.stringify(manifest),
  );

  await execFileAsync(
    path.join(repositoryRoot, "node_modules", ".bin", "tsx"),
    [path.join(repositoryRoot, "scripts", "prebuild-carousel.ts")],
    { cwd: root },
  );

  const generated = JSON.parse(
    await readFile(
      path.join(root, "app", "data", "carousel-content.json"),
      "utf8",
    ),
  ) as { files: Array<{ originalSrc: string }> };
  assert.equal(generated.files.length, 40);
  assert.deepEqual(
    generated.files.map(({ originalSrc }) =>
      decodeURIComponent(originalSrc.split("/").pop()!),
    ),
    manifest.items.map(({ file }) => file),
  );
});
