# Authoring a vertical

A vertical is the configuration that adapts the generic site system to a
specific business type. Adding one is the easiest way to extend pagekit-agent —
it is **config, not code**.

## Steps

1. Create `verticals/<id>/vertical.yaml`, where `<id>` exactly matches a
   `business.type` enum value (the resolver maps type → directory 1:1).
2. Add the new `<id>` to the `BusinessType` enum in
   `packages/generator/src/brief/schema.ts` **and** the `business.type` enum in
   `input/business-brief.schema.json`.
3. Run `pnpm inspect:vertical <id>` to confirm it parses.
4. Add a brief that uses it and run `pnpm plan <brief>`.

## Schema

```yaml
id: midwifery_practice          # must equal the directory name & business.type
label: Midwifery Practice
regulated: true                 # turns on regulated-industry guardrails
recommended_theme: warm-family-practice
schema_default: MedicalBusiness # conservative schema.org type; never a subtype you can't verify
primary_goal_options:
  - registrations
  - contact_requests
required_pages:                 # page-type ids from blueprints.ts
  - home
  - services
  - service                     # marker: expands to one page per brief service
  - about
  - team
  - location
  - contact
  - faq
content_cautions:               # surfaced verbatim into site-plan.md
  - "Do not make medical guarantees or outcome promises."
  - "Do not request sensitive medical details in the generic contact form."
```

## Rules

- **Be conservative with `schema_default`.** If a type is regulated and you
  can't verify a subtype, use the safest valid type (`LocalBusiness`,
  `ProfessionalService`, `MedicalBusiness`) — never `Physician`/`Hospital`.
- **Every `required_pages` entry must be a known page-type id** in
  `blueprints.ts`, except the special `service` marker which fans out to one
  detail page per service in the brief.
- **`content_cautions` are not decoration.** They appear in `site-plan.md` and
  constrain the content-generation step.

## Currently shipped verticals

`midwifery_practice` · `physiotherapy_practice` · `dental_clinic` ·
`restaurant` · `legal_consultant` · `local_consultant` · `local-service`
(fallback).
