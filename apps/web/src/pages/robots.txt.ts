import { loadSite } from "../lib/site";

/**
 * robots.txt — allow everything, and advertise the sitemap when the brief gave
 * an absolute origin (`seo.site_url`).
 */
export function GET() {
  const site = loadSite();
  const lines = ["User-agent: *", "Allow: /"];
  if (site.siteUrl) {
    lines.push(`Sitemap: ${site.siteUrl.replace(/\/+$/, "")}/sitemap.xml`);
  }
  return new Response(lines.join("\n") + "\n", {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
