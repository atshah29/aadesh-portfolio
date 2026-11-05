# Aadesh Shah's Astro Portfolio

Production: https://aadesh-portfolio.aaditshah05.workers.dev/

Cloudflare Workers serves the static Astro build. React handles interactive components in the browser; this deployment has no application backend.

## Build and deploy

- Node.js: 24
- Install: `npm ci`
- Build: `npm run build`
- Cloudflare deploy: `npx wrangler deploy`
- Production branch: `main`

`wrangler.jsonc` defines the Worker name, compatibility date, and `dist` asset directory. The existing dashboard deploy command with `--assets=./dist --name=aadesh-portfolio` also works.

`public/_headers` supplies security and fingerprinted-asset cache headers on Cloudflare and Netlify. The retained Netlify configuration can build an optional fallback deployment.

Production canonical URLs, Open Graph URLs, sitemap entries, and the Umami hostname filter use the Cloudflare origin. To use a custom domain, set `SITE_URL` to its HTTPS origin before building and update the website domain in Umami. Preview hostnames are excluded from analytics.
