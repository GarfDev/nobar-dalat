import { access, readFile } from "node:fs/promises";
import path from "node:path";

export type CarouselCategory = "venue" | "drink" | "people";
export type CarouselRightsStatus = "owner" | "permission-required";
export type CarouselSourceType =
  | "existing"
  | "instagram-owner"
  | "instagram-third-party"
  | "google-owner"
  | "google-review";

export type CarouselCurationItem = {
  file: string;
  category: CarouselCategory;
  sourceType: CarouselSourceType;
  sourceUrl: string;
  credit: string;
  rightsStatus: CarouselRightsStatus;
};

export type CarouselCurationManifest = {
  items: CarouselCurationItem[];
};

export const requiredCounts = { venue: 8, drink: 14, people: 18 } as const;

const categories = new Set<CarouselCategory>(["venue", "drink", "people"]);
const rightsStatuses = new Set<CarouselRightsStatus>([
  "owner",
  "permission-required",
]);
const sourceTypes = new Set<CarouselSourceType>([
  "existing",
  "instagram-owner",
  "instagram-third-party",
  "google-owner",
  "google-review",
]);
const supportedMediaExtension = /\.(jpe?g|png|gif|webp|mp4|webm)$/i;

export function summarizeCarouselManifest(manifest: CarouselCurationManifest) {
  const counts: Record<CarouselCategory, number> = {
    venue: 0,
    drink: 0,
    people: 0,
  };

  for (const item of manifest.items) {
    if (categories.has(item.category)) counts[item.category] += 1;
  }

  return counts;
}

export async function loadCarouselManifest(manifestPath: string) {
  return JSON.parse(
    await readFile(manifestPath, "utf8"),
  ) as CarouselCurationManifest;
}

export async function validateCarouselManifest(
  manifest: CarouselCurationManifest,
  mediaDir: string,
) {
  if (!manifest || !Array.isArray(manifest.items)) {
    throw new Error("Carousel manifest must contain an items array.");
  }
  if (manifest.items.length !== 40) {
    throw new Error(
      `Carousel manifest must contain exactly 40 items; found ${manifest.items.length}.`,
    );
  }

  const seenFiles = new Set<string>();
  for (const [index, item] of manifest.items.entries()) {
    const label = `Carousel item ${index + 1}`;
    if (!item.file || path.basename(item.file) !== item.file) {
      throw new Error(`${label} must use a safe filename.`);
    }
    if (seenFiles.has(item.file)) {
      throw new Error(`Duplicate carousel file: ${item.file}.`);
    }
    seenFiles.add(item.file);
    if (!supportedMediaExtension.test(item.file)) {
      throw new Error(
        `${label} has an unsupported media extension: ${item.file}.`,
      );
    }
    if (!categories.has(item.category)) {
      throw new Error(
        `${label} category is unsupported: ${String(item.category)}.`,
      );
    }
    if (!sourceTypes.has(item.sourceType)) {
      throw new Error(
        `${label} source type is unsupported: ${String(item.sourceType)}.`,
      );
    }
    if (!item.sourceUrl?.trim()) {
      throw new Error(`${label} sourceUrl is required.`);
    }
    if (!item.credit?.trim()) {
      throw new Error(`${label} credit is required.`);
    }
    if (!rightsStatuses.has(item.rightsStatus)) {
      throw new Error(
        `${label} rights status is unsupported: ${String(item.rightsStatus)}.`,
      );
    }
    try {
      await access(path.join(mediaDir, item.file));
    } catch {
      throw new Error(`Carousel media file is missing: ${item.file}.`);
    }
  }

  const counts = summarizeCarouselManifest(manifest);
  for (const category of categories) {
    if (counts[category] !== requiredCounts[category]) {
      throw new Error(
        `Carousel category ${category} must contain ${requiredCounts[category]} items; found ${counts[category]}.`,
      );
    }
  }

  return counts;
}
