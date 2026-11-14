import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { loadEnv, type Plugin } from "vite";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

// Local preview only. Personal media is never copied into the public build.
function privateLocalCover(): Plugin {
  return {
    name: "winter-private-local-cover",
    apply: "serve",
    configureServer(server) {
      const imagePath = resolve(server.config.root, ".private-assets/winter-cover.png");
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.split("?")[0] !== "/__winter-private-cover") return next();
        const address = req.socket.remoteAddress;
        if (!["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(address ?? "")) {
          res.statusCode = 403; res.end(); return;
        }
        if (req.method !== "GET" && req.method !== "HEAD") {
          res.statusCode = 405; res.end(); return;
        }
        try {
          const bytes = await readFile(imagePath);
          res.setHeader("Content-Type", "image/png");
          res.setHeader("Cache-Control", "no-store");
          res.setHeader("X-Content-Type-Options", "nosniff");
          res.end(req.method === "HEAD" ? undefined : bytes);
        } catch { res.statusCode = 404; res.end(); }
      });
    },
  };
}
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (key) {
    let publicKey = key.startsWith("sb_publishable_");
    if (!publicKey) {
      try {
        publicKey =
          JSON.parse(
            Buffer.from(key.split(".")[1] || "", "base64url").toString(),
          ).role === "anon";
      } catch {
        publicKey = false;
      }
    }
    if (!publicKey)
      throw new Error(
        "Only a Supabase publishable or anon key is allowed. Never use a secret/service_role key.",
      );
  }
  const base = env.VITE_BASE_PATH || "/";
  if (!base.startsWith("/") || !base.endsWith("/"))
    throw new Error("VITE_BASE_PATH must start and end with /.");
  return {
    base,
    plugins: [
      privateLocalCover(),
      react(),
      tailwind(),
      VitePWA({
        registerType: "prompt",
        injectRegister: false,
        manifest: {
          name: "Winter Arc — The Quiet Season",
          short_name: "Winter Arc",
          lang: "hu",
          start_url: base,
          scope: base,
          display: "standalone",
          background_color: "#0B1017",
          theme_color: "#0B1017",
          icons: [
            {
              src: "icon.svg",
              sizes: "any",
              type: "image/svg+xml",
              purpose: "any",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,svg,woff2}"],
          navigateFallback: "index.html",
          runtimeCaching: [],
        },
      }),
    ],
    test: {
      environment: "jsdom",
      setupFiles: ["./tests/setup.ts"],
      include: ["tests/**/*.test.{ts,tsx}"],
    },
  };
});
