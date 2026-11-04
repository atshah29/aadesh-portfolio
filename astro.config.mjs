import { defineConfig } from "astro/config";
import react from "@astrojs/react";

// Netlify sets URL to the production site origin. For another host, set SITE_URL.
const site = process.env.SITE_URL || process.env.URL;
export default defineConfig({
  output: "static",
  integrations: [react()],
  trailingSlash: "always",
  ...(site ? { site } : {}),
});
