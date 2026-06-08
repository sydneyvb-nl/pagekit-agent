# Project status

**Version:** 0.1 (foundation) · **Updated:** 2026-06-02

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
- **Content interface.** Typed `PageContent`/`SiteContent` model
  (`packages/generator/src/content/`) with per-field provenance (brief /
  generated / placeholder) and a deterministic, safe-by-default **placeholder
  mode**: it reuses brief facts, writes structural copy, and emits an explicit
  `TODO:` for anything missing or forbidden to invent (testimonials, prices,
  hours, credentials, team). Content quality gates plus a `content.json` /
  `content-draft.md` / `content-todos.md` output set.
- **CLI.** `validate`, `plan` (+`--dry-run`), `content` (+`--dry-run`),
  `inspect-vertical`.
- **Theme resolver.** `resolveTheme` (`packages/generator/src/theme/`) turns a
  theme preset + design tokens into a flat set of CSS custom properties, emitted
  as `generated/theme.json`. Explicit brand colors from the brief override the
  accent; nothing is invented.
- **SEO + structured data.** Per-page metadata (canonical, robots, OpenGraph)
  and safe-by-default schema.org JSON-LD (`buildSeo`/`buildJsonLd` in the
  generator): a conservative LocalBusiness-family node, `WebSite`,
  `Organization`, `Service`, `BreadcrumbList`, and a `FAQPage` built only from
  *answered* questions — never reviews, ratings, or hours. Absolute URLs appear
  only when the brief sets `seo.site_url`. A `validateSeo` gate plus
  `sitemap.xml` + `robots.txt` from the renderer.
- **Astro renderer.** `apps/web` (Astro 5, static output) renders
  `content.json` + `theme.json` into a deployable HTML/CSS site: a section-id →
  component registry, per-page `<title>`/meta/canonical/OG + JSON-LD in
  `<head>`, theme CSS variables injected at `:root`, accessible nav/skip-link,
  and **honest draft styling** (placeholder copy is visibly flagged, never
  passed off as finished). `pnpm build:site` builds it; the example brief
  builds in CI.
- **Supporting config.** Design tokens + 6 theme presets, a representative
  section library, content-safety rules, agent skills, one committed example.

## ⏳ Not yet built

Do not claim these work. They are scaffolded as docs/roadmap only:

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

`pnpm -r lint` (typecheck), `pnpm test` (41 tests), `pnpm validate:brief`,
`pnpm plan --dry-run`, `pnpm content --dry-run`, and `pnpm build:site` (full
Astro static build of the example brief) all run in CI on every push and PR.

**Local note.** Astro 6/7 require Node ≥ 22.12; the renderer is pinned to
**Astro 5.18.1** so it also builds on the Node 20 dev machine (`^20.3.0`). The
version clears the 14-day supply-chain cooldown.
