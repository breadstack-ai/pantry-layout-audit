# Pantry layout audit

Layout and responsiveness audit of Breadstack's **Pantry** storefront template, run against six live sites, with a developer guide to the template-level fixes.

- **Guide (GitHub Pages):** `docs/index.html` (Pages serves the `/docs` folder) → https://breadstack-claude-sessions.github.io/pantry-layout-audit/
- **Screenshots:** `docs/screenshots/<version>/` — annotated captures the guide links to
- **Scripts:** `scripts/` — the Playwright crawl, the site list, and the per-finding console checks
- **History:** `CHANGELOG.md` — one entry per audit run, mirrored in the guide's version dialog

## How a new audit run works

1. Run the crawl: `npm ci && npx playwright install chromium`, then `PANTRY_AUDIT_KEY=… node scripts/audit.mjs --out audit-results.json`. Compare with the previous run's JSON to see what moved. Any record with `"blocked": true` was stopped by Cloudflare and has no measurements — see [Getting past Cloudflare](#getting-past-cloudflare).
2. Re-capture screenshots for anything that changed (same file names, new `docs/screenshots/vX.Y/` folder).
3. Update the guide's data (findings, `since` / `lastChange`, `VERSIONS`) and rebuild `docs/index.html`.
4. Add a `CHANGELOG.md` entry, commit, push. Pages redeploys on its own.

Steps 1–4 can be run by Claude in a cloud session whose environment allows the storefront domains (see `scripts/sites.json` for the list). Until then the crawl runs locally through the Playwright plugin and the results are committed here.

## Getting past Cloudflare

The storefronts sit behind Cloudflare, which challenges headless Chromium ("Performing security verification"). The crawl gets through with a shared secret header plus a WAF skip rule on each zone.

**Env var:** `PANTRY_AUDIT_KEY`. When it is set, `scripts/audit.mjs` sends it on every request as the `x-pantry-audit` header. Generate a long random value (e.g. `openssl rand -hex 32`), keep it out of the repo, and set it wherever the crawl runs — your shell locally, or the cloud environment's environment variables for Claude sessions. The cloud environment's setup script is `npm ci && npx playwright install chromium`.

**Skip rule** — once per site zone in the Cloudflare dashboard:

1. Open the zone → **Security** → **WAF** → **Custom rules** → **Create rule**.
2. Name it `Pantry layout audit`.
3. Click **Edit expression** and enter (replace the value with the key):
   ```
   (http.request.headers["x-pantry-audit"][0] eq "<PANTRY_AUDIT_KEY value>")
   ```
4. **Action:** `Skip`. Under **WAF components to skip**, tick *All remaining custom rules*, *All rate limiting rules*, *All managed rules* and *All Super Bot Fight Mode rules*; under **More components to skip**, tick *Browser Integrity Check* and *Security Level*.
5. Leave **Log matching requests** on so audit traffic is visible, then **Deploy**, and drag the rule to the **top** of the custom-rules list (skip only affects rules evaluated after it).

Notes:
- The free-plan **Bot Fight Mode** cannot be skipped by a WAF rule. If a zone uses it, either turn it off during the crawl or move the zone to Super Bot Fight Mode (Pro+), which the rule above does skip.
- To rotate the key, change the value in the rule on every zone and in `PANTRY_AUDIT_KEY` together.
- A page that still answers 403, or whose title contains "security verification", is written to the results as `{ "status": 403, "blocked": true }` (no measurements) and the console line reads `blocked (403)`. If every page is blocked, the header is missing or the rule isn't matching — check the env var and the rule's position.

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
