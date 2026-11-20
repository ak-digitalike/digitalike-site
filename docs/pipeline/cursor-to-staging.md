# Pipeline: Cursor to WordPress staging draft

Target state after Option A (gate). Phase 2 draft push is implemented in `scripts/wp-draft.js`.

## Prerequisites

- WordPress with REST API (staging or production for draft-only writes)
- Application Password for a user who can create and edit drafts (`WP_STAGING_*` in `.env`)
- Prefer a user **without** `publish_posts` so automation cannot go live
- Repo clone of `digitalike-site`, `npm install`

## Daily flow

1. Change Markdown under `content/pages/` in Cursor.
2. Preview locally (optional): `npm run wp:draft -- --page <slug> --offline`
3. Dry-run against WordPress: `npm run wp:draft -- --page <slug>` (reads WP, no write)
4. Push draft: `npm run wp:draft -- --page <slug> --apply`
5. Open the printed `wp-admin` edit link, review content blocks.
6. Copy approved sections into the GenerateBlocks layout on the live page; human publishes.

GenerateBlocks layout, forms, testimonials, and hero fields (`h1`, `teaser`, `button_label`) are **not** automated. The script only posts core blocks for text review.

## Commands

```bash
npm run wp:draft -- --page ki-schulung              # dry-run (GET only)
npm run wp:draft -- --page ki-schulung --offline    # dry-run without HTTP
npm run wp:draft -- --page ki-schulung --apply      # create or update WP draft
npm run wp:draft -- --all                           # dry-run all pages in content/pages/
npm run test                                        # unit tests (guard, markdown converter)
```

Environment variables (see [.env.example](../../.env.example)):

| Variable | Purpose |
|----------|---------|
| `WP_STAGING_URL` | Site root, e.g. `https://staging.digitalike.de` or production if drafts go there |
| `WP_STAGING_USER` | WordPress username |
| `WP_STAGING_APP_PASSWORD` | Application password (spaces optional) |

## Safety rules

- Payload status is always **`draft`**. There is no publish path in the script.
- Before writing, the script looks up the canonical `slug` from frontmatter.
- If that page is **live** (`publish`, `private`, or `pending`), the script **does not** update it. It creates or updates a sibling draft with slug `{slug}-entwurf` (e.g. `ki-schulung-entwurf`).
- If the canonical slug is already a draft, the script updates that draft.
- Default without `--apply` is dry-run: JSON summary to stdout, no `POST`.

Polylang: lookups use `lang=de` first, then retry without `lang` if empty.

### Post type (digitalike.de)

Offer pages are not core `pages`. They use the custom post type **leistungen** (`/wp-json/wp/v2/leistungen`).

- Frontmatter `template: leistung` or `template: schulung` selects REST base `leistungen`.
- Override with optional `wp_rest_base` in frontmatter.
- Dry-run JSON includes `restBase` so you can confirm the target collection.
- Live slugs on production get sibling drafts `{slug}-entwurf` on the same post type.

## Phase 1 (manual merge)

After the API draft exists:

1. Compare draft content to the live Leistungsseite.
2. Paste sections into GenerateBlocks on the live page (or staging clone).
3. Set SEO title and meta from frontmatter manually if Yoast fields are not exposed via REST.

Estimated merge time: 6 to 10 h per page once templates are familiar.

## Phase 2 (implemented)

- Frontmatter from [content/schema/page-frontmatter.md](../../content/schema/page-frontmatter.md)
- Markdown body to core blocks (`paragraph`, `heading`, `list`, links, bold)
- Duplicate leading H1 dropped when it matches `title` or `h1`
- HTML comments in Markdown stripped (editor notes)

Code layout:

| Path | Role |
|------|------|
| [scripts/wp-draft.js](../../scripts/wp-draft.js) | CLI |
| [lib/wp-draft/guard.js](../../lib/wp-draft/guard.js) | Live-page guard, slug routing |
| [lib/wp-draft/markdown-to-blocks.js](../../lib/wp-draft/markdown-to-blocks.js) | MD to block markup |
| [lib/wp-draft/wp-client.js](../../lib/wp-draft/wp-client.js) | REST client |
| [lib/wp-draft/rest-base.js](../../lib/wp-draft/rest-base.js) | template to REST collection |

## Security

- Credentials only in local `.env`, not in repo.
- Staging should use `noindex` when available.
- Production publish remains human-only in WordPress.

## Cursor rules

See [.cursor/rules/pages.mdc](../../.cursor/rules/pages.mdc): after content edits, run `wp:draft` (dry-run or `--apply`).