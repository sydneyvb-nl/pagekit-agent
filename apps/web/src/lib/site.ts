import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export type {
  ContentSource,
  ContentField,
  ContentItem,
  SectionContent,
  OpenGraph,
  PageSeo,
  JsonLdNode,
  PageContent,
  SiteContent,
  ResolvedTheme,
} from "@pagekit/generator";

import type { JsonLdNode, PageContent, ResolvedTheme, SiteContent } from "@pagekit/generator";

/**
 * Build-time loaders for the generator's output. Astro page frontmatter runs in
 * Node during the static build, so we read `content.json` and `theme.json`
 * straight from the `generated/` directory rather than bundling them.
 *
 * Override the source directory with `PAGEKIT_GENERATED_DIR` (absolute, or
 * relative to the repo root) to render a specific brief's output — e.g. an
 * example site committed under `examples/`.
 */

const thisDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(thisDir, "../../../../"); // apps/web/src/lib → repo root

function generatedDir(): string {
  const override = process.env.PAGEKIT_GENERATED_DIR;
  if (override) return isAbsolute(override) ? override : resolve(repoRoot, override);
  return join(repoRoot, "generated");
}

function readJson<T>(file: string): T {
  const path = join(generatedDir(), file);
  if (!existsSync(path)) {
    throw new Error(
      `pagekit: ${file} not found at ${path}. Run \`pnpm content <brief>\` first, ` +
        `or set PAGEKIT_GENERATED_DIR to a directory that contains it.`,
    );
  }
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

export function loadSite(): SiteContent {
  return readJson<SiteContent>("content.json");
}

export function loadTheme(): ResolvedTheme {
  return readJson<ResolvedTheme>("theme.json");
}

/** Render the resolved theme as a `:root { ... }` CSS string. */
export function themeRootCss(theme: ResolvedTheme): string {
  const decls = Object.entries(theme.cssVariables)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");
  return `:root {\n${decls}\n}`;
}

/** Serialize JSON-LD safely for embedding in a `<script>` tag. */
export function safeJsonLd(node: JsonLdNode): string {
  return JSON.stringify(node).replace(/</g, "\\u003c");
}

/** Whether a page includes a hero section (which owns the sole `<h1>`). */
export function pageHasHero(page: PageContent): boolean {
  return page.sections.some((s) => s.section.split(".")[0] === "hero");
}

/** Heading level for a section: `<h1>` on hero or the first section when no hero. */
export function sectionHeadingLevel(page: PageContent, sectionIndex: number): "h1" | "h2" {
  const base = page.sections[sectionIndex]?.section.split(".")[0];
  if (base === "hero") return "h1";
  if (!pageHasHero(page) && sectionIndex === 0) return "h1";
  return "h2";
}

/** Convert a page route (`/services/echo-s/`) to an Astro slug (`services/echo-s`). */
export function routeToSlug(route: string): string | undefined {
  const trimmed = route.replace(/^\/+|\/+$/g, "");
  return trimmed === "" ? undefined : trimmed;
}

/** Primary-nav pages, in a sensible order. */
export function navPages(site: SiteContent): PageContent[] {
  const order = ["home", "services", "about", "team", "location", "faq", "contact"];
  return site.pages
    .filter((p) => order.includes(p.pageType))
    .sort((a, b) => order.indexOf(a.pageType) - order.indexOf(b.pageType));
}

/** Legal/utility pages for the footer (privacy, cookies, terms). */
export function footerPages(site: SiteContent): PageContent[] {
  const legal = ["privacy", "cookies", "terms"];
  return site.pages.filter((p) => legal.includes(p.pageType));
}
