# digitalike-site

Project root: `C:\Users\Arbeit\Projects\digitalike-site`.

Source and decision docs for new digitalike.de offer pages (KI training, KI automation, Cursor blueprint). Live site stays WordPress until a separate relaunch project replaces it.

## Layout

| Path | Purpose |
|------|---------|
| [docs/research/entscheidungsnotiz.md](docs/research/entscheidungsnotiz.md) | Stack research: Cursor to staging, hours, CMS options |
| [docs/gate/empfehlung.md](docs/gate/empfehlung.md) | Management recommendation and decision record |
| [docs/pipeline/cursor-to-staging.md](docs/pipeline/cursor-to-staging.md) | Target workflow after the gate |
| [content/pages/](content/pages/) | Page copy as Markdown (slug, SEO, blocks) |
| [content/schema/page-frontmatter.md](content/schema/page-frontmatter.md) | Shared frontmatter rules |

## Workflow

1. Edit or add Markdown under `content/pages/`.
2. Open a PR or local review in Cursor.
3. Publish to WordPress staging as draft (pipeline step, see pipeline doc).
4. Human approves, then publish on production.

## First URLs

- `/leistungen/schulungen/ki-schulung/` (new, under existing Schulungen)
- `/leistungen/ki-automatisierung/` (upgrade existing offer page content)
