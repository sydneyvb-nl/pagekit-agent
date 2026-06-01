# Skill: create-site

Generate a complete site plan (and, in later stages, the rendered site) from a
business brief.

## Trigger

The user provides a business brief, or asks to "build/generate a site" for a
local business.

## Required inputs

- A brief at `input/business-brief.yaml` conforming to
  `input/business-brief.schema.json`.

## Files to read first

- `AGENTS.md`
- `docs/site-generation-protocol.md`
- `content-rules/global.md` (+ `regulated-industries.md` if regulated)
- the resolved `verticals/<type>/vertical.yaml`

## Steps

1. `pnpm validate:brief input/business-brief.yaml` — fix blocking issues.
2. `pnpm plan input/business-brief.yaml` — writes the report set.
3. Read `generated/site-plan.md`, `assumptions.md`, `missing-inputs.md`.
4. Generate content per page following the blueprint + content rules.
5. Run quality gates (`docs/quality-gates.md`); fix blocking errors; re-run.
6. Update `generated/build-report.md` and `generated/change-log.md`.

## Outputs

- `generated/site-plan.md`, `site-map.yaml`, `assumptions.md`, `missing-inputs.md`
- _(later)_ rendered site under `site/`, plus SEO/a11y/build reports.

## Validation

The plan must pass all blocking structural gates. Never report the site as
"done" or "deployed" beyond what the gates you ran actually verified.
