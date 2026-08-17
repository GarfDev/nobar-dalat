import assert from "node:assert/strict";
import { access, mkdir, mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import sharp from "sharp";
import { optimizeMenuImages } from "../scripts/menu-images";

test("optimizes nested menu images and preserves relative paths", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "nobar-menu-images-"));
  const input = path.join(root, "input");
  const output = path.join(root, "output");
  await mkdir(path.join(input, "classics"), { recursive: true });
  await sharp({
    create: {
      width: 24,
      height: 32,
      channels: 3,
      background: "#8b4513",
    },
  })
    .jpeg()
    .toFile(path.join(input, "classics", "old-fashioned.jpg"));

  const generated = await optimizeMenuImages(input, output);

  assert.deepEqual(generated, ["classics/old-fashioned.webp"]);
  await access(path.join(output, "classics", "old-fashioned.webp"));
});
