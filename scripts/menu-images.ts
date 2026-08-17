import path from "node:path";
import { mkdir, readdir } from "node:fs/promises";
import sharp from "sharp";

const menuImagePattern = /\.(png|jpe?g)$/i;

async function listImages(root: string, current = root): Promise<string[]> {
  const entries = await readdir(current, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) return listImages(root, absolute);
      if (!entry.isFile() || !menuImagePattern.test(entry.name)) return [];
      return [path.relative(root, absolute)];
    }),
  );

  return nested.flat().sort();
}

export async function optimizeMenuImages(
  inputDir: string,
  outputDir: string,
): Promise<string[]> {
  const sources = await listImages(inputDir);
  const generated: string[] = [];

  for (const relativeSource of sources) {
    const relativeOutput = path.join(
      path.dirname(relativeSource),
      `${path.parse(relativeSource).name}.webp`,
    );
    const outputPath = path.join(outputDir, relativeOutput);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await sharp(path.join(inputDir, relativeSource))
      .rotate()
      .resize(600, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);
    generated.push(relativeOutput.split(path.sep).join("/"));
  }

  return generated;
}
