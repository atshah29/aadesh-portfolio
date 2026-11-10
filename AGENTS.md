# Portfolio development

This is Aadesh Shah's Astro portfolio. Use the existing React, GSAP, Lenis, and React Bits components when working on the interface.

## Design skills

Design skills are installed for Codex as project files in `.agents/skills/`. For relevant design or animation tasks, read the matching `SKILL.md` and any references needed for that task:

- `emil-design-eng`: interface polish and animation decisions.
- `review-animations` and `animation-performance`: motion reviews and frame-rate issues.
- `mobile-native` and `gestures`: touch interactions and mobile behavior.
- `animate` and `choreograph`: implementing and coordinating motion.
- `gsap-core`, `gsap-timeline`, and `gsap-utils`: GSAP API usage and sequencing.
- `gsap-scrolltrigger`, `gsap-react`, and `gsap-performance`: scroll integration, React lifecycle cleanup, and GSAP performance. Consult `gsap-plugins` or `gsap-frameworks` when the task needs them.
- `design-taste-frontend`: broader layout, typography, and visual-design work when requested.

Use only the skills relevant to the request. The user's instructions take priority over skill defaults. Preserve the established content, electric borders, accessibility, and mobile behavior unless the requested change calls for an adjustment. Installing skills alone does not call for a redesign. Prefer the GSAP skills for GSAP API details and Emil's skills for motion decisions; select a design workflow appropriate to the request instead of combining conflicting design defaults.

For Lenis, consult the README shipped with the installed package (`node_modules/lenis/README.md`, after `npm ci`) and the existing integration in `src/scripts/interactions.js`. A dedicated upstream Lenis skill has not been installed. Impeccable is managed separately through the user's plugin installation; do not add a duplicate repository copy. This repository's skill setup targets Codex only.

For website changes, run `npm run check` and `npm run build`, plus browser verification appropriate to the affected interactions. For skill-only changes, verify the installed files and their references. The user has requested that completed implementation changes be pushed to `main`; advice and review requests alone do not call for edits.
