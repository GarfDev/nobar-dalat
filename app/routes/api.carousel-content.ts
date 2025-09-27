import path from "node:path";
import { readdir } from "node:fs/promises";

export async function loader() {
  try {
    const dir = path.join(process.cwd(), "public", "carousel-content");
    const entries = await readdir(dir, { withFileTypes: true });

    const files = entries
      .filter((e) => e.isFile())
      .map((e) => e.name)
      .filter((name) => /\.(jpe?g|png|gif|webp|mp4|webm)$/i.test(name));

    return new Response(JSON.stringify({ files }), {
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