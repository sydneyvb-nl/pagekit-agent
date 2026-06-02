import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Build-time loaders for the generator's output. Astro page frontmatter runs in
 * Node during the static build, so we read `content.json` and `theme.json`
 * straight from the `generated/` directory rather than bundling them.
 *
 * Override the source directory with `PAGEKIT_GENERATED_DIR` (absolute, or
 * relative to the repo root) to render a specific brief's output — e.g. an
 * example site committed under `examples/`.
 */

export type ContentSource = "brief" | "generated" | "placeholder";

export interface ContentField {
  value: string;
  source: ContentSource;
}
export interface ContentItem {
  title: ContentField;
  body: ContentField;
  href?: string;
}
export interface SectionContent {
  section: string;
  heading: ContentField | null;
  body: ContentField[];
  items: ContentItem[];
  cta: { label: string; href: string } | null;
  todos: string[];
}
export interface PageContent {
  route: string;
  pageType: string;
  title: string;
  metaDescription: ContentField;
  sections: SectionContent[];
  wordCount: number;
  minWords: number;
  todos: string[];
}
export interface SiteContent {
  business: string;
  language: string;
  mode: string;
  pages: PageContent[];
  todos: string[];
}

export interface ResolvedTheme {
  name: string;
  cssVariables: Record<string, string>;
  fonts: { heading: string; body: string };
  motion: string;
}

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

/** Convert a page route (`/diensten/echo-s/`) to an Astro slug (`diensten/echo-s`). */
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
