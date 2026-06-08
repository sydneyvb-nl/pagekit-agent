# Quality gates

Quality gates are split into **blocking errors** (the build must fail) and
**warnings** (surfaced, non-blocking). Some run at the planning stage; others
run at content generation; rendered-page checks are on the roadmap.

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

## Implemented today — content gates (`validateContent`)

Run automatically by `pnpm content`.

### Blocking errors

| Gate                    | Rule                                              |
| ----------------------- | ------------------------------------------------- |
| Missing page content    | Every planned page must have resolved content.    |
| Extra / orphan content  | Every content page must match a planned page.     |
| Missing section         | Every planned section must appear on its page.    |
| Empty title / meta      | Every page needs a title and meta description.    |

### Warnings

| Gate                | Rule                                                            |
| ------------------- | --------------------------------------------------------------- |
| Meta description    | Over 160 characters is flagged.                                 |
| Word count          | Below the blueprint `minWords` target.                          |
| Open TODOs            | Unresolved placeholder gaps (expected in placeholder mode).     |

## Implemented today — SEO gates (`validateSeo`)

Run automatically by `pnpm content` (alongside content gates).

### Blocking errors

| Gate                | Rule                                    |
| ------------------- | --------------------------------------- |
| Duplicate canonical | No two pages may share a canonical URL. |

### Warnings

| Gate                | Rule                                                            |
| ------------------- | --------------------------------------------------------------- |
| No `site_url`       | Canonicals are relative; OG URL and sitemap are limited.        |
| OG description      | Over 160 characters.                                            |
| Missing JSON-LD     | Indexable page with no structured data.                         |
| Home WebSite node   | Home page should include a `WebSite` JSON-LD node.              |

## Implemented today — build gate

| Command           | Rule                                              |
| ----------------- | ------------------------------------------------- |
| `pnpm build:site` | Full Astro static build of the example brief.     |

## Roadmap — rendered-page gates

These require generated HTML and will run in dedicated SEO / a11y stages:

**Blocking:** missing/extra H1 · broken internal link · invalid JSON-LD in HTML ·
missing required form consent in EU regulated context · accessibility critical
issue · build failure.

**Warning:** meta description too short/long · title too short/long · low word
count · missing real images · placeholder testimonials · missing opening hours ·
no analytics configured · no custom domain configured.

## Commands

```bash
pnpm validate:brief    # ✅ brief schema validation
pnpm plan              # ✅ site plan + structural gates + report set
pnpm content           # ✅ placeholder content + content/SEO gates + theme.json
pnpm build:site        # ✅ Astro static build (runs content first)
pnpm validate:a11y     # ⏳ roadmap
```

The agent **must not skip validation**. A gate that is not yet implemented is
not a gate that can be ignored — note in the build report which gates ran.

Gap reporting: `pnpm content` merges content TODOs into `generated/missing-inputs.md`
alongside brief-level gaps from planning.
