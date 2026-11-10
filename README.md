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

The following skills are installed for Codex in `.agents/skills/` and committed with `skills-lock.json`. These are development instructions, references, and supporting scripts; they are not included in the website bundle. See [AGENTS.md](AGENTS.md) for task selection.

| Collection | Purpose | License |
| --- | --- | --- |
| [Emil Kowalski](https://github.com/emilkowalski/skills) | Interface polish, motion, gestures, and performance | [MIT](.agents/skills/EMIL-LICENSE.txt) |
| [Official GSAP skills](https://github.com/greensock/gsap-skills) | GSAP APIs, timelines, ScrollTrigger, plugins, and framework integration | [MIT](.agents/skills/GSAP-LICENSE.txt) |
| [Taste Skill](https://github.com/Leonxlnx/taste-skill) | Layout, typography, visual design, and design review | [MIT](.agents/skills/TASTE-LICENSE.txt) |

To install or refresh the collections from the repository root:

```sh
npx --yes skills@latest add emilkowalski/skills --agent codex --skill '*' --copy --yes
npx --yes skills@latest add greensock/gsap-skills --agent codex --skill '*' --copy --yes
npx --yes skills@latest add Leonxlnx/taste-skill --agent codex --skill design-taste-frontend --copy --yes
```

To list the project skills:

```sh
npx --yes skills@latest list --agent codex
```

An agent can read the skill files directly in an existing session. Automatic skill discovery and slash-command availability depend on the coding client and may require reopening the project or starting a new session. Example request: "Use review-animations to review the portfolio's motion without changing it."

Impeccable is managed separately through the user's plugin installation. No Claude-specific skill configuration is included. Lenis remains an installed application dependency; use its bundled README and the existing integration for version-specific guidance. The former Lenis skill listed under `darkroomengineering/cc-settings` is absent from that repository's current skill collection, so it has not been installed.
