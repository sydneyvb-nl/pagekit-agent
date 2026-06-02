import type { SiteContent } from "../content/model.js";
import type { ContentFinding } from "../content/validateContent.js";

/**
 * SEO / structured-data gates over the resolved {@link SiteContent}. Errors mean
 * a correctness bug (e.g. two pages claiming the same canonical); warnings flag
 * quality gaps (a relative canonical because no `site_url` was given, an
 * over-long description, a content page with no JSON-LD).
 */
export function validateSeo(content: SiteContent): ContentFinding[] {
  const findings: ContentFinding[] = [];

  // Blocking: canonicals must be unique across the site.
  const byCanonical = new Map<string, number>();
  for (const p of content.pages)
    byCanonical.set(p.seo.canonical, (byCanonical.get(p.seo.canonical) ?? 0) + 1);
  for (const [canonical, count] of byCanonical) {
    if (count > 1)
      findings.push({ level: "error", message: `Duplicate canonical URL: ${canonical} (${count}×).` });
  }

  // Site-level: without an origin, canonicals are relative and OG/sitemap are
  // limited. One warning, not one per page.
  if (!content.siteUrl)
    findings.push({
      level: "warning",
      message:
        "No seo.site_url in the brief: canonicals are relative, og:url is omitted, and no sitemap is emitted.",
    });

  for (const page of content.pages) {
    const ogLen = page.seo.openGraph.description.length;
    if (ogLen > 160)
      findings.push({
        level: "warning",
        message: `Open Graph description over 160 chars (${ogLen}) on ${page.route}.`,
      });

    // Indexable content pages should carry at least one JSON-LD node.
    const indexable = page.seo.robots.startsWith("index");
    if (indexable && page.jsonLd.length === 0)
      findings.push({
        level: "warning",
        message: `No JSON-LD emitted for ${page.route}.`,
      });
  }

  // The home page anchors the site graph: expect a WebSite node.
  const home = content.pages.find((p) => p.pageType === "home");
  if (home && !home.jsonLd.some((n) => n["@type"] === "WebSite"))
    findings.push({ level: "warning", message: "Home page is missing a WebSite JSON-LD node." });

  return findings;
}
