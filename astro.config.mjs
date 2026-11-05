import { defineConfig } from "astro/config";
import react from "@astrojs/react";

// Keep production metadata stable across Cloudflare builds and preview URLs.
// Set SITE_URL explicitly when moving to a custom domain.
const site = process.env.SITE_URL || "https://portfolio.aadeshshah.workers.dev";
export default defineConfig({
  output: "static",
  integrations: [react()],
  trailingSlash: "always",
  ...(site ? { site } : {}),
});
