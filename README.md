# pagekit-agent

**Agent-ready open-source website build system for local service businesses.**
Generate complete, SEO-ready, accessible, visually-editable websites from a
structured business brief.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](./LICENSE)

> This is not a generic UI kit or a "prompt → landing page" toy. It is a
> deterministic site **production system** whose primary user is an LLM agent:
> explicit rules, predictable files, validation gates, and full traceability
> from brief field → rule → generated page.

## What it does

You give an agent a short business brief:

```yaml
business:
  name: "Verloskundigenpraktijk Example"
  type: "midwifery_practice"
  city: "Den Haag"
  language: "nl"
  services: ["Zwangerschapscontroles", "Echo's", "Kraamzorg"]
  # ...
```

…and it produces a full, structured website plan — homepage, service pages,
about/team/location/contact, FAQ, legal pages, sitemap, structured data, SEO
metadata — plus a set of reports that explain every decision and every gap.

## Why it's different

- **Agent-first.** `AGENTS.md` is the entrypoint. Instructions are executable,
  not vibes (`hero.local-service` + spacing token, not "make it modern").
- **Deterministic structure, constrained copy.** Routes, sections, schema types
  and validation are fixed. Headings and body copy are creative within rules.
- **No silent magic.** Every run writes `site-plan.md`, `assumptions.md`,
  `missing-inputs.md` and a machine-readable `site-map.yaml`.
- **Safe by default.** The system never invents credentials, testimonials,
  prices, opening hours, or medical/legal claims. Gaps become explicit `TODO`s.
- **Extensible by config.** Add a vertical by dropping in a YAML file, not by
  rewriting the generator.

## Quickstart

Requires Node ≥ 20 and pnpm ≥ 9 (`corepack enable`).

```bash
pnpm install
pnpm validate:brief                 # validate the example brief
pnpm plan                           # plan the site, write reports to generated/
pnpm test                           # run the test suite
```

Use your own brief:

```bash
cp input/business-brief.example.yaml input/business-brief.yaml
# edit it, then:
pnpm validate:brief input/business-brief.yaml
pnpm plan input/business-brief.yaml
```

Inspect a vertical:

```bash
pnpm inspect:vertical midwifery_practice
```

## Repository layout

```
AGENTS.md                  # primary agent entrypoint — read this first
input/                     # business-brief schema (JSON + Zod) and example
packages/generator/        # TypeScript generator: brief → plan → reports
verticals/                 # per-vertical config (pages, schema, cautions)
design/                    # design tokens + theme presets
sections/                  # reusable section definitions
content-rules/             # content safety + tone rules
skills/                    # task recipes the agent can follow
docs/                      # human + machine documentation
examples/                  # example briefs and generated output
```

## Status

**v0.1 — foundation.** Implemented today: brief validation, vertical
resolution, deterministic site planning, internal-link graph, structural
quality gates, and the report set. See [`docs/roadmap.md`](docs/roadmap.md) for
what's next (Astro rendering, SEO/schema emission, accessibility runners,
Webstudio handoff, example sites).

## Recommended foundation & licensing

The static-site output target is [Astro](https://astro.build); the visual-builder
handoff target is [Webstudio](https://webstudio.is). pagekit-agent is an
**independent generator and mapping layer** — it does not bundle or modify
Webstudio source. Webstudio itself is AGPL-3.0-or-later; if you self-host or
integrate it, comply with its license separately.

This repository is licensed under **Apache-2.0** — see [`LICENSE`](./LICENSE) and
[`NOTICE`](./NOTICE).

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md). The fastest way to extend the system
is to add a vertical (`docs/vertical-authoring.md`).
