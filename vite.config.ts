import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ command, mode }) => {
  const plugins = [tailwindcss(), reactRouter(), tsconfigPaths()];

  // Only use SSL in dev mode when specifically requested or just dev
  // Note: react-router dev uses 'serve' command but development mode
  if (command === "serve" && mode === "development") {
    // Check if we are running the https script, or just add it optionally
    // Ideally we'd use an environment variable to toggle this
    if (process.env.HTTPS === "true") {
      plugins.push(basicSsl());
    }
  }

  return {
    plugins,
    optimizeDeps: {},
    server: {
      host: true,
    },
  };
});
