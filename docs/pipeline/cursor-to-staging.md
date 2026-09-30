# Pipeline: Cursor to WordPress staging draft

Target state after Option A (gate). Not fully automated yet; steps are ordered for implementation.

## Prerequisites

- WordPress staging with same theme (GeneratePress Child) and plugins as production
- Application Password for a dedicated `cursor-publish` user (draft only, no publish capability)
- Repo clone of `digitalike-site`

## Daily flow

1. Change Markdown under `content/pages/` in Cursor.
2. Run local preview (optional): render MD to HTML with a small script or VS Code preview.
3. Run publish script (future): `npm run wp:draft -- --page ki-schulung --env staging`
4. Open staging URL, check layout in GenerateBlocks if blocks were pasted manually (phase 1).
5. Notify reviewer; after OK, publish in WP or elevate role on production.

## Phase 1 (manual bridge)

Until the script exists:

1. Copy sections from Markdown into GenerateBlocks on staging.
2. Match slug and Yoast/RankMath fields from frontmatter.
3. Keep parent page: Schulungen for KI-Schulung.

Estimated: 12 to 20 h per first page, then 6 to 10 h with template reuse.

## Phase 2 (API draft)

- Map frontmatter to WP page fields.
- Convert Markdown body to HTML or core blocks (simple headings, lists, paragraphs first).
- `POST /wp-json/wp/v2/pages` with `status: draft`, `meta` for SEO plugin if exposed.
- Never set `status: publish` in automation.

## Security

- Credentials only in local `.env`, not in repo (see `.env.example`).
- Staging may use `noindex`.
- Production publish remains human-only until explicitly changed.

## Cursor rules (suggested `.cursor/rules/pages.mdc`)

- Only edit files under `content/pages/` and `content/snippets/`.
- Do not invent URLs; use slugs from frontmatter.
- No em dash in German copy.
- After editing, remind human to run staging publish step.
