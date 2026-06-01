# Project status

**Version:** 0.1 (foundation) · **Updated:** 2026-06-01

A snapshot of what is real today versus what is planned. For the phase-by-phase
breakdown see [roadmap.md](roadmap.md); this page is the honest one-glance view.

## ✅ Implemented and verified

The first deterministic slice — **brief → vertical → site plan → reports** —
works end to end and is covered by tests + CI.

- **Business-brief contract.** Zod schema (`packages/generator/src/brief/`) with a
  mirrored JSON Schema (`input/business-brief.schema.json`). Parses YAML/JSON,
  returns typed results or path-scoped issues.
- **Vertical system.** Six verticals + a `local-service` fallback, resolved from
  `business.type`.
- **Deterministic planner.** Page blueprints, one detail page per service,
  auto-injected legal/utility pages, internal-link graph, image slots,
  conservative schema-type resolution.
- **Structural quality gates.** Duplicate route/title, required pages, internal-
  link minimum, EU-regulated-form consent flag.
- **Report set.** `site-plan.md`, `site-map.yaml`, `assumptions.md`,
  `missing-inputs.md`.
- **CLI.** `validate`, `plan` (+`--dry-run`), `inspect-vertical`.
- **Supporting config.** Design tokens + 6 theme presets, a representative
  section library, content-safety rules, agent skills, one committed example.

## ⏳ Not yet built

Do not claim these work. They are scaffolded as docs/roadmap only:

- Content-generation interface (typed `PageContent`, placeholder mode)
- Astro site rendering and `pnpm build`
- SEO + schema.org JSON-LD emitters and their validators
- Accessibility runners (Axe / Playwright)
- Form rendering (Netlify / Formspree / webhook / mailto)
- Webstudio target mapping and handoff
- Full generated example sites (only the plan is committed today)
- Trace layer (`generated/trace/*.jsonl`)

## Toolchain

- **Node** ≥ 22 (Node 24 LTS recommended; CI runs Node 24)
- **pnpm** ≥ 11 (pinned via `packageManager`; provided by Corepack)
- **TypeScript** 6 · **Zod** 4 · **Vitest** 4 (+ Vite 7) · **yaml** 2
- **Supply-chain cooldown.** `pnpm-workspace.yaml` sets `minimumReleaseAge` to
  14 days: dependency versions published more recently than that are rejected at
  install time, so a freshly-compromised release can't enter the lockfile. Deps
  are pinned to the newest versions that clear this window.

## Quality bar right now

`pnpm -r lint` (typecheck), `pnpm test` (13 tests), `pnpm validate:brief`, and
`pnpm plan --dry-run` all run in CI on every push and PR.
