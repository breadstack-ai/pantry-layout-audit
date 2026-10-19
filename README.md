# Pantry layout audit

Layout and responsiveness audit of Breadstack's **Pantry** storefront template, run against six live sites, with a developer guide to the template-level fixes.

- **Guide (GitHub Pages):** `docs/index.html` (Pages serves the `/docs` folder) → https://breadstack-claude-sessions.github.io/pantry-layout-audit/
- **Screenshots:** `docs/screenshots/<version>/` — annotated captures the guide links to
- **Scripts:** `scripts/` — the Playwright crawl, the site list, and the per-finding console checks
- **History:** `CHANGELOG.md` — one entry per audit run, mirrored in the guide's version dialog

## How a new audit run works

1. Run the crawl: `npm i -D playwright && npx playwright install chromium`, then `node scripts/audit.mjs --out audit-results.json`. Compare with the previous run's JSON to see what moved.
2. Re-capture screenshots for anything that changed (same file names, new `docs/screenshots/vX.Y/` folder).
3. Update the guide's data (findings, `since` / `lastChange`, `VERSIONS`) and rebuild `docs/index.html`.
4. Add a `CHANGELOG.md` entry, commit, push. Pages redeploys on its own.

Steps 1–4 can be run by Claude in a cloud session whose environment allows the storefront domains (see `scripts/sites.json` for the list). Until then the crawl runs locally through the Playwright plugin and the results are committed here.

## Sites in scope (v1.0 / v1.1)

| Code | Site | Variant |
| --- | --- | --- |
| GH | golden-harvest.ca | bold · header-centered |
| 416 | 416cannabis.ca | editorial · header-split |
| MM | mistymountaincannabis.ca | boutique · header-split |
| QC | queenscannabis.ca | bold · header-minimal · multi-location |
| GC | gormleycannabis.ca | bold · header-logo-lockup |
| PW | prairieweed.ca | editorial · header-split · static header |

New Pantry sites: add a row to `scripts/sites.json` and (for cloud runs) the domain to the environment's allowed-domains list.

## Guide source

The guide is a React + Tailwind + shadcn/ui build bundled into one file. Its source lives in the Claude session that produced it; the bundled `index.html` here is the artifact. If you want the source in this repo too, ask and it will be committed under `guide-src/`.
