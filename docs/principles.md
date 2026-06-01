# Working principles

Five principles govern every decision in pagekit-agent. They are not aspirational
— they are testable constraints. When a change or a generated output violates one,
that is a defect. Anyone (human or agent) extending the system must preserve them.

## 1. Agent-first, human-readable second

Every instruction must be executable by an LLM agent without hidden assumptions.

- ❌ "Make the site look modern."
- ✅ "Use the `calm-service` theme. Apply spacing token `section.y.lg` and radius
  token `radius.card`. Build the homepage from sections `hero.local-service`,
  `trust-bar`, `services-grid`, `process-steps`, `testimonials`, `faq-preview`,
  `final-cta`."

Instructions name concrete tokens, sections, and files — never vibes.

## 2. Deterministic structure, creative-but-constrained copy

The agent may write copy. It may **not** invent structure.

| Deterministic (fixed)         | Creative (within rules)         |
| ----------------------------- | ------------------------------- |
| page routes                   | headings                        |
| required sections             | body copy                       |
| metadata fields               | FAQ answers                     |
| schema types                  | CTA text                        |
| image slot names              | testimonial **placeholders**    |
| validation rules              |                                 |
| report format                 |                                 |

The same brief must always produce the same site plan. Copy varies; structure
does not.

## 3. No silent magic

Every generation run must produce the report set, so every decision is visible:

- `site-plan.md` — the structure and the link graph
- `site-map.yaml` — machine-readable routes
- `assumptions.md` — every assumption made
- `missing-inputs.md` — every gap left as a `TODO`
- _(later stages)_ `seo-report.md`, `accessibility-report.md`,
  `build-report.md`, `change-log.md`

If a decision isn't in a report, it didn't happen transparently — fix that.

## 4. Easy to extend (config, not code)

Adding a vertical, theme, or section is **configuration**, never a rewrite of the
generator. A new business type is a `verticals/<id>/vertical.yaml` plus an enum
entry — see [vertical-authoring.md](vertical-authoring.md).

## 5. Safe by default

The system must never invent unverifiable claims: credentials, certifications,
awards, testimonials, review counts/scores, prices, opening hours, team members,
or medical/legal/regulatory claims. When a fact is missing, emit an explicit
`TODO:` and record it in `missing-inputs.md`. A plausible-sounding invention is
the worst possible output — worse than an obvious gap.

---

These principles are enforced in practice by: the Zod brief schema, the blueprint
registry, the structural quality gates (`validatePlan`), the per-vertical
`content_cautions`, and the `content-rules/` set. See
[architecture.md](architecture.md) for where each lives.
