// @ts-check
import { defineConfig, passthroughImageService } from "astro/config";

/**
 * Static-output config. The site content is read at build time from the
 * generator's `generated/` directory (see `src/lib/site.ts`); Astro only
 * renders it. No integrations are enabled — these sites are content-only and
 * ship as plain HTML + CSS so they deploy to any static host.
 */
export default defineConfig({
  output: "static",
  compressHTML: true,
  // No image transforms are used (content is text + slots), so avoid pulling
  // sharp's native build into the pipeline — keeps CI install lean and robust.
  image: { service: passthroughImageService() },
  // `site` is overridden per deployment; left generic for the placeholder build.
  trailingSlash: "always",
  build: { format: "directory" },
});
