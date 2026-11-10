# Aadesh Shah's Astro Portfolio

Production: https://portfolio.aadeshshah.workers.dev/

Cloudflare Workers serves the static Astro build. React handles interactive components in the browser; this deployment has no application backend.

## Build and deploy

- Node.js: 24
- Install: `npm ci`
- Build: `npm run build`
- Cloudflare deploy: `npx wrangler deploy`
- Production branch: `main`

`wrangler.jsonc` defines the Worker name, compatibility date, and `dist` asset directory. Use `npx wrangler deploy` in the Cloudflare dashboard so the Worker name comes from this file. Remove any old `--name=aadesh-portfolio` override after renaming the Worker to `portfolio`.

`public/_headers` supplies security and fingerprinted-asset cache headers on Cloudflare and Netlify. The retained Netlify configuration can build an optional fallback deployment.

Production canonical URLs, Open Graph URLs, sitemap entries, and the Umami hostname filter use the Cloudflare origin. To use a custom domain, set `SITE_URL` to its HTTPS origin before building and update the website domain in Umami. Preview hostnames are excluded from analytics.

## Design skills

[Emil Kowalski's skills](https://github.com/emilkowalski/skills) are installed for Codex in `.agents/skills/` and committed with `skills-lock.json`. These are development instructions and references; they are not included in the website bundle. See [AGENTS.md](AGENTS.md) for task selection and the [upstream MIT license](.agents/skills/EMIL-LICENSE.txt).

To install or refresh the collection from the repository root:

```sh
npx --yes skills@latest add emilkowalski/skills --agent codex --skill '*' --copy --yes
```

To list the project skills:

```sh
npx --yes skills@latest list --agent codex
```

An agent can read the skill files directly in an existing session. Automatic skill discovery and slash-command availability depend on the coding client and may require reopening the project or starting a new session. Example request: "Use review-animations to review the portfolio's motion without changing it."
