# Section library

Reusable, implementation-independent section definitions. The planner references
sections by `id` (see `packages/generator/src/plan/blueprints.ts`); these files
describe each section's contract for the content-generation and rendering stages.

## Section schema

```yaml
id: hero.local-service          # dotted id, referenced by blueprints
purpose: string                 # one sentence: why this section exists
required_props:                 # props the content step must fill
  heading: string
  primary_cta_label: string
  # ... `string | null` marks optional props
accessibility:
  heading_level: h1 | h2 | h3   # enforced heading level
  image_alt_required: boolean
seo_notes:                      # guidance for the content step
  - string
agent_rules:                    # hard constraints; never violate
  - string
```

## Shipped sections (representative)

`hero/local-service` · `hero/service` · `services/service-grid` ·
`conversion/final-cta` · `conversion/contact-card` · `content/faq`

The full taxonomy (trust, local-seo, legal, etc.) is tracked in
[`../docs/roadmap.md`](../docs/roadmap.md) Phase 5.
