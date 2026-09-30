# Page frontmatter schema

Every file in `content/pages/` starts with YAML:

```yaml
---
slug: ki-schulung
parent_slug: schulungen
title: "KI-Schulung für Marketing-Teams"
meta_description: "Praxisnahe KI-Schulung: Cursor, Claude, MCP und n8n. Online oder vor Ort."
primary_keyword: ki schulung
secondary_keywords:
  - ki workshop
  - ki weiterbildung
template: leistung
status: draft
wp_path: /leistungen/schulungen/ki-schulung/
---
```

| Field | Required | Notes |
|-------|----------|-------|
| slug | yes | URL segment |
| parent_slug | if nested | e.g. schulungen |
| title | yes | H1 |
| meta_description | yes | max ~155 chars |
| primary_keyword | yes | from research memo |
| secondary_keywords | no | modules, not separate URLs unless volume |
| template | yes | `leistung` or `schulung` |
| status | yes | `draft` until live |
| wp_path | yes | final public path |

Body: Markdown with `##` for GenerateBlocks section equivalents.
