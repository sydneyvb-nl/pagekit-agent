# Architecture

pagekit-agent is a deterministic TypeScript generator. A validated business
brief flows through a fixed pipeline into a structured site plan and a set of
human- and machine-readable reports.

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
findings (errors / warnings)
  ↓  writeReports
generated/site-plan.md, site-map.yaml, assumptions.md, missing-inputs.md
```

Later roadmap stages extend this with content generation, Astro rendering,
SEO/schema emission, accessibility runners, and the Webstudio handoff. None of
those change the contract above; they consume the same `SitePlan`.

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
| `cli.ts`                     | `validate` / `plan` / `inspect-vertical` commands         |

## Design principles

The architecture exists to enforce five working principles — agent-first,
deterministic structure, no silent magic, config-driven extension, and safe-by-
default. Each is defined with examples and its enforcement point in
[`principles.md`](principles.md).

## Status & roadmap

See [`status.md`](status.md) for what is built today and [`roadmap.md`](roadmap.md)
for the phased plan mapped to the PRD.
