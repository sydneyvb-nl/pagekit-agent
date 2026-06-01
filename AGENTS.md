# Agent Operating Instructions

You are building a complete local-service-business website from a structured
brief. This repository is designed for you, an LLM agent, as the primary user.
Everything here is meant to be executed deterministically, not interpreted
loosely.

## Golden rules

1. **Do not ask questions** unless a required field is missing _and_ no safe
   placeholder is possible. Prefer safe assumptions, and record them.
2. **Structure is deterministic. Copy is creative-but-constrained.** Never
   invent routes, schema types, or required sections. You may write headings,
   body copy, FAQ answers and CTA labels within the rules.
3. **No silent magic.** Every run must produce the report set below.
4. **Safe by default.** Never invent the things listed under "Never invent".

## Never invent

- credentials, certifications, awards
- testimonials or review counts/scores
- prices
- opening hours
- team members
- medical, legal or regulatory claims or guarantees

When a fact is missing, use an explicit `TODO:` marker in content and record it
in `generated/missing-inputs.md`. Never fill a gap with a plausible-sounding
invention.

## Required workflow

1. Read this file.
2. Read `input/business-brief.yaml` (or the path you were given).
3. Validate the brief: `pnpm validate:brief <path>`.
4. If invalid, fix the brief or report the blocking field. Do not proceed.
5. Plan the site: `pnpm plan <path>`. This resolves the vertical, expands page
   blueprints, builds the internal-link graph, and writes the report set.
6. Read `generated/site-plan.md`, `assumptions.md`, and `missing-inputs.md`.
7. Generate page content following the per-page blueprint and the rules in
   `content-rules/` and the selected `verticals/<id>/`.
8. Run the quality gates (see `docs/quality-gates.md`). Do not skip validation.
9. Fix any blocking errors and re-run.
10. Write/update the build report and changelog.

## Required outputs (per run)

Written to `generated/`:

- `site-plan.md` — pages, routes, intent, sections, schema, internal links
- `site-map.yaml` — machine-readable route map
- `assumptions.md` — every safe assumption you made
- `missing-inputs.md` — every gap left as TODO
- _(later stages)_ `seo-report.md`, `accessibility-report.md`,
  `build-report.md`, `change-log.md`

## Where to look

| You need…                        | Read…                                  |
| -------------------------------- | -------------------------------------- |
| The end-to-end protocol          | `docs/site-generation-protocol.md`     |
| What blocks a build vs. warns    | `docs/quality-gates.md`                |
| How a page is structured         | `packages/generator/src/plan/blueprints.ts` |
| Vertical-specific cautions       | `verticals/<id>/vertical.yaml`         |
| Content safety rules             | `content-rules/`                       |
| A task recipe                    | `skills/`                              |

## Current capability (v0.1)

The generator implemented today covers: brief validation, vertical resolution,
deterministic site planning, the internal-link graph, structural quality gates,
and the report set. Astro rendering, SEO/schema emission, accessibility runners,
and the Webstudio handoff are scaffolded in the roadmap (`docs/roadmap.md`) and
not yet implemented. Do not claim a site is "built and deployed" — claim exactly
what the gates you ran actually verified.
