import path from "node:path";
import { writeFile, mkdir } from "node:fs/promises";
import sharp from "sharp";
import { optimizeMenuImages } from "./menu-images";
import {
  loadCarouselManifest,
  validateCarouselManifest,
} from "./carousel-curation";

const supportedVideoExtensions = /\.(mp4|webm)$/i;

async function generateCarouselContent() {
  try {
    const dir = path.join(process.cwd(), "public", "carousel-content");
    const optimizedDir = path.join(
      process.cwd(),
      "public",
      "carousel-content-optimized",
    );

    // Ensure optimized directory exists
    await mkdir(optimizedDir, { recursive: true });

    const manifestPath = path.join(
      process.cwd(),
      "app",
      "data",
      "carousel-curation.json",
    );
    const manifest = await loadCarouselManifest(manifestPath);
    await validateCarouselManifest(manifest, dir);

    const files = (
      await Promise.all(
        manifest.items
          .map(({ file }) => file)
          .map(async (name) => {
            try {
              const lower = name.toLowerCase();
              const isVideo = supportedVideoExtensions.test(lower);
              const originalSrc = `/carousel-content/${encodeURIComponent(name)}`;

              if (isVideo) {
                return { type: "video", src: originalSrc };
              }

              // For images, generate optimized WebP and placeholder
              const imagePath = path.join(dir, name);
              const image = sharp(imagePath);

              // Generate optimized version (max width 640px)
              const optimizedName = `${path.parse(name).name}.webp`;
              const optimizedPath = path.join(optimizedDir, optimizedName);
              const optimizedSrc = `/carousel-content-optimized/${encodeURIComponent(optimizedName)}`;

              await image
                .rotate()
                .resize(640, null, { withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(optimizedPath);

              // Get optimized metadata
              const optimizedMetadata = await sharp(optimizedPath).metadata();

              const placeholder = await image
                .resize(20) // 20px wide, auto-height
                .blur(1) // Apply a blur
                .jpeg({ quality: 10 }) // Low quality JPEG
                .toBuffer()
                .then(
                  (buffer) =>
                    `data:image/jpeg;base64,${buffer.toString("base64")}`,
                );

              return {
                type: "image",
                src: optimizedSrc,
                originalSrc,
                placeholder,
                width: optimizedMetadata.width,
                height: optimizedMetadata.height,
              };
            } catch (err) {
              console.error(
                `[prebuild-carousel] Failed to process ${name}:`,
                err,
              );
              return null;
            }
          }),
      )
    ).filter(Boolean);

    const outputPath = path.join(
      process.cwd(),
      "app",
      "data",
      "carousel-content.json",
    );
    // Ensure app/data exists
    await mkdir(path.dirname(outputPath), { recursive: true });

    await writeFile(outputPath, JSON.stringify({ files }), "utf-8");

    console.log(
      `[prebuild-carousel] Generated carousel content to ${outputPath}`,
    );

    // Optimize menu images
    const menuInputDir = path.join(process.cwd(), "public", "images", "menu");
    const menuOutputDir = path.join(
      process.cwd(),
      "public",
      "images",
      "menu-optimized",
    );
    try {
      const optimizedMenuImages = await optimizeMenuImages(
        menuInputDir,
        menuOutputDir,
      );
      console.log(
        `[prebuild-carousel] Optimized ${optimizedMenuImages.length} menu images to ${menuOutputDir}`,
      );
    } catch (err) {
      console.warn(
        "[prebuild-carousel] Warning: Failed to optimize menu images (folder might not exist):",
        err,
      );
    }
  } catch (err) {
    console.error(
      "[prebuild-carousel] Failed to generate carousel content:",
      err,
    );
    process.exit(1);
  }
}

generateCarouselContent();
