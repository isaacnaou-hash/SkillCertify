import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Safe check for Replit environment
const isReplit = process.env.REPL_ID !== undefined && process.env.REPL_OWNER !== undefined;

export default defineConfig(async () => {
  const plugins = [react()];

  if (isReplit) {
    try {
      const runtimeErrorOverlay = (await import("@replit/vite-plugin-runtime-error-modal")).default;
      const { cartographer } = await import("@replit/vite-plugin-cartographer");
      const { devBanner } = await import("@replit/vite-plugin-dev-banner");

      plugins.push(runtimeErrorOverlay(), cartographer(), devBanner());
    } catch (err) {
      console.warn("Replit plugins not loaded:", err.message);
    }
  }

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    root: path.resolve(import.meta.dirname, "client"),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});

