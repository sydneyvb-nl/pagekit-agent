# Architecture

pagekit-agent is a deterministic TypeScript generator. A validated business
brief flows through a fixed pipeline into a structured site plan, resolved
content, and a deployable static site.

## Pipeline

```
business brief (YAML/JSON)
  ↓  loadBrief + Zod validation
validated Brief
  ↓  resolveVertical (business.type → verticals/<id>/, fallback local-service)
Vertical
  ↓  planSite (blueprints + brief services)
SitePlan  ── routes, sections, schema, internal-link graph, image slots
  ↓  validatePlan (structural quality gates)
  ↓  writeReports
generated/site-plan.md, site-map.yaml, assumptions.md, missing-inputs.md
  ↓  generateContent (placeholder or agent-filled copy)
SiteContent  ── per-section copy with provenance + SEO + JSON-LD
  ↓  validateContent + validateSeo
  ↓  resolveTheme + writeContent + writeMissingInputs (merged gaps)
generated/content.json, content-draft.md, content-todos.md, theme.json
  ↓  Astro static build (apps/web)
deployable HTML/CSS + sitemap.xml + robots.txt
```

Later roadmap stages add accessibility runners and the Webstudio handoff. None
of those change the contract above; they consume the same `SitePlan` and
`SiteContent`.

## Key modules (`packages/generator/src`)

| Module                       | Responsibility                                            |
| ---------------------------- | --------------------------------------------------------- |
| `brief/schema.ts`            | Zod schema — single source of truth for brief shape       |
| `brief/loadBrief.ts`         | Parse YAML/JSON + validate, return typed result or issues |
| `vertical/schema.ts`         | Zod schema for `verticals/<id>/vertical.yaml`             |
| `vertical/resolveVertical.ts`| Map business type → vertical, with `local-service` fallback |
| `plan/blueprints.ts`         | Deterministic page-type contracts (sections/schema/SEO)   |
| `plan/planSite.ts`           | Expand brief + vertical into a full `SitePlan`            |
| `plan/validatePlan.ts`       | Structural quality gates (blocking vs. warning)           |
| `report/writeReports.ts`     | Emit the "no silent magic" report set                     |
| `content/model.ts`           | Typed `SiteContent` / `PageContent` contract              |
| `content/generateContent.ts` | Deterministic placeholder content (safe-by-default)       |
| `content/validateContent.ts` | Content structure gates                                   |
| `content/writeContent.ts`    | Persist `content.json` + human-readable drafts              |
| `theme/resolveTheme.ts`      | Theme preset + tokens → CSS custom properties               |
| `seo/buildSeo.ts`            | Per-page canonical, robots, OpenGraph                     |
| `seo/validateSeo.ts`         | SEO / JSON-LD quality gates                                 |
| `schema/buildJsonLd.ts`      | Safe-by-default schema.org JSON-LD                          |
| `cli.ts`                     | `validate` / `plan` / `content` / `inspect-vertical`      |

## Renderer (`apps/web`)

| Module              | Responsibility                                      |
| ------------------- | --------------------------------------------------- |
| `src/lib/site.ts`   | Load `content.json` / `theme.json`; shared types from `@pagekit/generator` |
| `src/components/`   | Section-id → Astro component registry               |
| `src/layouts/`      | `<head>` SEO, JSON-LD, theme CSS variables, nav     |
| `src/pages/`        | Static paths from content; sitemap + robots.txt     |

## Design principles

The architecture exists to enforce five working principles — agent-first,
deterministic structure, no silent magic, config-driven extension, and safe-by-
default. Each is defined with examples and its enforcement point in
[`principles.md`](principles.md).

## Status & roadmap

See [`status.md`](status.md) for what is built today and [`roadmap.md`](roadmap.md)
for the phased plan mapped to the PRD.
