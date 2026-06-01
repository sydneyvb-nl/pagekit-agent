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

1. **Agent-first, human-readable second.** Every instruction is executable.
2. **Deterministic outputs.** Structure is fixed; copy is creative-but-constrained.
3. **No silent magic.** Reports explain every decision and gap.
4. **Easy to extend.** New verticals are config, not code.
5. **Safe by default.** The system never invents unverifiable claims.

See [`roadmap.md`](roadmap.md) for the phased build plan and current status.
