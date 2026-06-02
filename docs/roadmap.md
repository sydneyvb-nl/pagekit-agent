# Roadmap

Status of the phased build from the product PRD. This kickoff delivers the
foundation and the first deterministic slice (brief → plan → reports). For the
plain built-vs-planned snapshot, see [status.md](status.md).

Toolchain: Node ≥ 22 (CI on Node 24 LTS), pnpm ≥ 11, TypeScript 6, Zod 4,
Vitest 4.

Legend: ✅ done · 🟡 partial · ⏳ planned

| Phase | Area                          | Status | Notes                                                        |
| ----- | ----------------------------- | ------ | ------------------------------------------------------------ |
| 1     | Repository foundation         | ✅     | workspace, license, generator skeleton, CI                   |
| 2     | Business-brief schema         | ✅     | Zod + JSON Schema, loader, validator, tests                  |
| 3     | Vertical system               | ✅     | 6 verticals + `local-service` fallback, resolver             |
| 4     | Design tokens & themes        | 🟡     | tokens+themes → CSS vars via `resolveTheme`; Webstudio export ⏳ |
| 5     | Section library               | 🟡     | section schema + representative sections; full set ⏳       |
| 6     | Page blueprint system         | 🟡     | blueprints implemented in code; external YAML authoring ⏳  |
| 7     | Site plan generator           | ✅     | routes, intents, services, legal pages, link graph, reports  |
| 8     | Content generation contracts  | ✅     | typed `PageContent` model + placeholder mode + gates + CLI  |
| 9     | Astro site generator          | ✅     | `apps/web` (Astro 5) renders content.json+theme.json → static |
| 10    | SEO system                    | 🟡     | title/route rules in plan + gates; emitter/validator ⏳     |
| 11    | Schema.org system             | 🟡     | conservative type resolution in plan; JSON-LD emitter ⏳    |
| 12    | Accessibility validation      | ⏳     | rules documented; Axe/Playwright runners ⏳                 |
| 13    | Forms & integrations          | 🟡     | brief config + EU consent gate; renderers ⏳               |
| 14    | Webstudio target mapping      | ⏳     | not started                                                  |
| 15    | Example sites                 | 🟡     | one example plan committed; full sites ⏳                   |
| 16    | Agent skills                  | 🟡     | core skills authored; remainder ⏳                          |
| 17    | Traceability layer            | 🟡     | site-map + assumptions + missing-inputs; trace/*.jsonl ⏳   |
| 18    | CI/CD                         | 🟡     | validate workflow; example-generation + deploy docs ⏳     |
| 19    | Documentation polish          | 🟡     | core docs in place                                           |
| 20    | Public release readiness      | ⏳     | issue/PR templates, badges, v1.0.0 tag                       |

## Next slice

1. ~~**Content generation interface** (Phase 8)~~ — ✅ done: typed `PageContent`
   model, deterministic placeholder mode, content gates, `pagekit content` CLI.
2. ~~**Astro generator** (Phase 9)~~ — ✅ done: `apps/web` (Astro 5) renders
   `content.json` + `theme.json` to a static site; `pnpm build:site`; in CI.
3. **SEO + schema emitters** (Phases 10–11) — JSON-LD per page + a validator in
   the gates. Title + meta description already render into each page `<head>`;
   schema types travel in the plan but are not yet emitted as `<script>` LD.
4. **First full example site** (Phase 15) — generate + commit the midwifery
   brief's `content.json`/`theme.json` and built output under `examples/`.
5. **Accessibility runners** (Phase 12) — Axe/Playwright against the built site.
