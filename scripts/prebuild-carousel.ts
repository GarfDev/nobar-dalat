import path from "node:path";
import { readdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const supportedImageExtensions = /\.(jpe?g|png|gif|webp)$/i;
const supportedVideoExtensions = /\.(mp4|webm)$/i;

async function generateCarouselContent() {
  try {
    const dir = path.join(process.cwd(), "public", "carousel-content");
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
              const src = `/carousel-content/${encodeURIComponent(name)}`;
              if (isVideo) {
                return { type: "video", src };
              }
              // For images, generate a blurred placeholder
              const imagePath = path.join(dir, name);
              const image = sharp(imagePath);
              const metadata = await image.metadata();
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
                src,
                placeholder,
                width: metadata.width,
                height: metadata.height,
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
      "public",
      "carousel-content.json",
    );
    await writeFile(outputPath, JSON.stringify({ files: shuffled }), "utf-8");

    console.log(
      `[prebuild-carousel] Generated carousel content to ${outputPath}`,
    );
  } catch (err) {
    console.error(
      "[prebuild-carousel] Failed to generate carousel content:",
      err,
    );
    process.exit(1);
  }
}

generateCarouselContent();