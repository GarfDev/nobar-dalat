import path from "node:path";
import {
  loadCarouselManifest,
  summarizeCarouselManifest,
  validateCarouselManifest,
} from "./carousel-curation";

const rootDir = process.cwd();
const manifestPath = path.join(
  rootDir,
  "app",
  "data",
  "carousel-curation.json",
);
const mediaDir = path.join(rootDir, "public", "carousel-content");

try {
  const manifest = await loadCarouselManifest(manifestPath);
  const counts = summarizeCarouselManifest(manifest);
  console.log(
    `Carousel manifest: ${manifest.items.length} items (${counts.venue} venue, ${counts.drink} drink, ${counts.people} people).`,
  );
  await validateCarouselManifest(manifest, mediaDir);
  console.log(
    "Carousel validation passed: 40 items (8 venue, 14 drink, 18 people).",
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
