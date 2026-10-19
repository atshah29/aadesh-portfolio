import { defineConfig } from "astro/config";

// Netlify sets URL to the production site origin. For another host, set SITE_URL.
const site = process.env.SITE_URL || process.env.URL;
export default defineConfig({
  output: "static",
  trailingSlash: "always",
  ...(site ? { site } : {}),
});
