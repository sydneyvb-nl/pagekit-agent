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
| 4     | Design tokens & themes        | 🟡     | token + theme files present; CSS/Webstudio export ⏳        |
| 5     | Section library               | 🟡     | section schema + representative sections; full set ⏳       |
| 6     | Page blueprint system         | 🟡     | blueprints implemented in code; external YAML authoring ⏳  |
| 7     | Site plan generator           | ✅     | routes, intents, services, legal pages, link graph, reports  |
| 8     | Content generation contracts  | 🟡     | content-rules + skills authored; generator interface ⏳     |
| 9     | Astro site generator          | ⏳     | not started                                                  |
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

1. **Content generation interface** (Phase 8) — a typed `PageContent` model and
   a placeholder-content mode so the plan can be rendered end-to-end in tests.
2. **Astro generator** (Phase 9) — render the `SitePlan` to a buildable site.
3. **SEO + schema emitters** (Phases 10–11) — per-page metadata + JSON-LD with
   their validators wired into the gates.
4. **First full example site** (Phase 15) — the midwifery brief, generated and
   committed under `examples/generated-sites/`.
