# @pagekit/web — Astro renderer

Static [Astro](https://astro.build) app that renders a generated site. It is a
**pure renderer**: it invents nothing and decides nothing about structure. Its
only inputs are the generator's output:

- `generated/content.json` — the resolved `SiteContent` (pages → sections →
  fields, with provenance and CTAs).
- `generated/theme.json` — the resolved theme as CSS custom properties.

Both are produced by `pnpm content <brief>` (see `packages/generator`).

## Build

From the repo root:

```bash
pnpm build:site        # = pnpm content && astro build  → apps/web/dist/
pnpm preview:site      # serve the built site
```

Render a specific brief's output by pointing at its directory:

```bash
PAGEKIT_GENERATED_DIR=examples/generated-sites/midwifery-den-haag/generated \
  pnpm --filter @pagekit/web build
```

## Version pin

Pinned to **Astro 5.18.1**. Astro 6+ requires Node ≥ 22.12; 5.x supports
`^20.3.0`, so the site still builds on the Node 20 dev machine. Keep this in 5.x
until the toolchain's minimum Node moves to 22.

## How it maps

- `src/pages/[...slug].astro` — one static route per page in `content.json`.
- `src/components/Section.astro` — dispatches each section id to a component
  (`sections/*.astro`); unknown ids fall back to `Prose` so new blueprint
  sections still render.
- `src/layouts/BaseLayout.astro` — `<head>` (title/meta), theme `:root`
  variables, nav, skip-link, footer.
- `src/components/Field.astro` — renders a content field; **placeholder**-source
  copy is wrapped in `[data-placeholder]` and styled as a visible draft gap,
  honoring "no silent magic".
- `src/styles/global.css` — structural styles only; all color/size/font values
  come from the theme CSS variables.
