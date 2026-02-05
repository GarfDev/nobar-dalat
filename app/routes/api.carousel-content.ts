import { readFile } from "node:fs/promises";
import path from "node:path";

export async function loader() {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "carousel-content.json",
    );
    const content = await readFile(filePath, "utf-8");

    return new Response(content, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(
      "[api.carousel-content] Failed to read pre-generated content:",
      err,
    );
    return new Response(JSON.stringify({ files: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
