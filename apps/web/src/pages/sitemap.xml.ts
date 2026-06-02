import { loadSite } from "../lib/site";

/**
 * Static sitemap of every indexable page. Sitemaps require absolute URLs, so
 * only pages with an absolute canonical (i.e. when the brief set `seo.site_url`)
 * are listed; otherwise the urlset is empty and the SEO gate warns at generation
 * time.
 */
export function GET() {
  const site = loadSite();
  const urls = site.pages
    .filter((p) => p.seo.canonicalAbsolute && p.seo.robots.startsWith("index"))
    .map((p) => `  <url><loc>${escapeXml(p.seo.canonical)}</loc></url>`)
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(body, {
    headers: { "content-type": "application/xml; charset=utf-8" },
  });
}

function escapeXml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&apos;",
  );
}
