# Skill: add-service-page

Add one service detail page to an existing site.

## Trigger

The user adds a new service, or asks to add a service page.

## Required inputs

- The service name.
- The existing brief (for city, contact, vertical, voice).

## Files to read first

- `packages/generator/src/plan/blueprints.ts` (the `service` blueprint)
- the resolved `verticals/<type>/vertical.yaml` (cautions)
- `content-rules/global.md`

## Steps

1. Add the service to `business.services` in the brief.
2. `pnpm validate:brief` then `pnpm plan` — the new `/diensten/<slug>/` route and
   its internal links appear in the plan automatically.
3. Generate the service page content: what it is · who it's for · how it works ·
   what to expect · when to contact · next step.
4. Ensure ≥ 2 internal links and exactly one H1.
5. Re-run quality gates.

## Outputs

- Updated `generated/site-map.yaml` with the new route.
- _(later)_ `site/src/content/pages/diensten/<slug>.mdx`.

## Validation

No duplicate route or title; service page meets `min_words` (700) at the content
stage; schema uses the vertical's conservative `schema_default`.
