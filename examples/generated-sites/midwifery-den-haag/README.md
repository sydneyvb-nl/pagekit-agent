# Example: Verloskundigenpraktijk Example (Den Haag)

A regulated medical-like local business — the canonical example for the
midwifery vertical.

## How this was generated

```bash
pnpm plan input/business-brief.yaml
```

against the brief in [`input/business-brief.yaml`](input/business-brief.yaml).

## What's here

- `input/business-brief.yaml` — the source brief.
- `generated/site-plan.md` — 13-page plan: home, services overview, 3 service
  detail pages, about, team, location, contact, FAQ, privacy, cookies, 404.
- `generated/site-map.yaml` — machine-readable route map.
- `generated/assumptions.md` — assumptions made (e.g. text wordmark, no logo).
- `generated/missing-inputs.md` — gaps left as TODO (e.g. street address).

This demonstrates the v0.1 deterministic slice: validation → vertical resolution
→ planning → reports. Rendered Astro output is a roadmap item (Phase 9).
