import path from "node:path";
import { readdir, writeFile, mkdir } from "node:fs/promises";
import sharp from "sharp";

const supportedImageExtensions = /\.(jpe?g|png|gif|webp)$/i;
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

    const entries = await readdir(dir, { withFileTypes: true });

    const files = (
      await Promise.all(
        entries
          .filter((e) => e.isFile())
          .map((e) => e.name)
          .filter(
            (name) =>
              supportedImageExtensions.test(name) ||
              supportedVideoExtensions.test(name),
          )
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
              const metadata = await image.metadata();

              // Generate optimized version (max width 640px)
              const optimizedName = `${path.parse(name).name}.webp`;
              const optimizedPath = path.join(optimizedDir, optimizedName);
              const optimizedSrc = `/carousel-content-optimized/${encodeURIComponent(optimizedName)}`;

              await image
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

    // Randomize order using Fisher-Yates shuffle
    const shuffled = files.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const outputPath = path.join(
      process.cwd(),
      "app",
      "data",
      "carousel-content.json",
    );
    // Ensure app/data exists
    await mkdir(path.dirname(outputPath), { recursive: true });

    await writeFile(outputPath, JSON.stringify({ files: shuffled }), "utf-8");

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
    await mkdir(menuOutputDir, { recursive: true });

    try {
      const menuFiles = await readdir(menuInputDir);
      for (const file of menuFiles) {
        if (!/\.(png|jpg|jpeg)$/i.test(file)) continue;

        const inputPath = path.join(menuInputDir, file);
        const outputName = `${path.parse(file).name}.webp`;
        const outputPath = path.join(menuOutputDir, outputName);

        // Check if file already exists to avoid re-processing (optional, but good for speed)
        // For now, overwrite to ensure latest settings
        await sharp(inputPath)
          .resize(600, null, { withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(outputPath);
      }
      console.log(
        `[prebuild-carousel] Optimized menu images to ${menuOutputDir}`,
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
