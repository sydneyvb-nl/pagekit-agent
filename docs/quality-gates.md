# Quality gates

Quality gates are split into **blocking errors** (the build must fail) and
**warnings** (surfaced, non-blocking). Some run at the planning stage (today);
others run at the rendering/SEO/a11y stages (roadmap).

## Implemented today — structural gates (`validatePlan`)

Run automatically by `pnpm plan`.

### Blocking errors

| Gate                         | Rule                                                        |
| ---------------------------- | ----------------------------------------------------------- |
| Duplicate route              | No two pages may share a route.                             |
| Duplicate title              | No two pages may share an exact title.                      |
| Missing required page        | `home` and `contact` page types must exist.                |
| Insufficient internal links  | Non-utility pages need ≥ 2 internal links.                  |

### Warnings

| Gate                | Rule                                                            |
| ------------------- | --------------------------------------------------------------- |
| Title length        | Title over 60 characters is flagged.                            |
| EU regulated form   | Regulated EU context + a form provider must add a consent field (enforced at form-generation stage). |

## Roadmap — rendered-page gates

These require generated HTML and will run in the SEO / a11y / build stages:

**Blocking:** invalid brief schema · missing/extra H1 · broken internal link ·
missing canonical · invalid JSON-LD · missing required form consent in EU
regulated context · accessibility critical issue · build failure.

**Warning:** meta description too short/long · title too short/long · low word
count · missing real images · placeholder testimonials · missing opening hours ·
no analytics configured · no custom domain configured.

## Planned commands

```bash
pnpm validate:brief    # ✅ implemented
pnpm plan              # ✅ implemented (runs structural gates)
pnpm validate:seo      # ⏳ roadmap
pnpm validate:a11y     # ⏳ roadmap
pnpm validate:schema   # ⏳ roadmap
pnpm build             # ⏳ roadmap (Astro)
```

The agent **must not skip validation**. A gate that is not yet implemented is
not a gate that can be ignored — note in the build report which gates ran.
