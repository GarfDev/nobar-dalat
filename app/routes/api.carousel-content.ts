import path from "node:path";
import { readdir } from "node:fs/promises";
import sharp from "sharp";

export async function loader() {
  try {
    const dir = path.join(process.cwd(), "public", "carousel-content");
    const entries = await readdir(dir, { withFileTypes: true });

    const files = await Promise.all(
      entries
        .filter((e) => e.isFile())
        .map((e) => e.name)
        .filter((name) => /\.(jpe?g|png|gif|webp|mp4|webm)$/i.test(name))
        .map(async (name) => {
          const lower = name.toLowerCase();
          const isVideo = lower.endsWith(".mp4") || lower.endsWith(".webm");
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
            .blur(2) // Apply a blur
            .jpeg({ quality: 50 }) // Low quality JPEG
            .toBuffer()
            .then(
              (buffer) => `data:image/jpeg;base64,${buffer.toString("base64")}`,
            );
          return {
            type: "image",
            src,
            placeholder,
            width: metadata.width,
            height: metadata.height,
          };
        }),
    );

    // Randomize order using Fisher-Yates shuffle
    const shuffled = files.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return new Response(JSON.stringify({ files: shuffled }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[api.carousel-content] Failed to read directory:", err);
    return new Response(JSON.stringify({ files: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
