import type { Brief } from "../brief/schema.js";
import type { SitePlan } from "./planSite.js";

export interface PlanFinding {
  level: "error" | "warning";
  message: string;
}

/**
 * Structural quality gates that apply at the planning stage (before any HTML
 * exists). Rendered-page checks (single H1, valid JSON-LD, etc.) run later in
 * the Astro/SEO/a11y stages.
 */
export function validatePlan(plan: SitePlan, brief: Brief): PlanFinding[] {
  const findings: PlanFinding[] = [];

  // Blocking: duplicate routes.
  const routes = new Map<string, number>();
  for (const p of plan.pages) routes.set(p.route, (routes.get(p.route) ?? 0) + 1);
  for (const [route, count] of routes) {
    if (count > 1) findings.push({ level: "error", message: `Duplicate route: ${route} (${count}×).` });
  }

  // Blocking: duplicate titles.
  const titles = new Map<string, number>();
  for (const p of plan.pages) titles.set(p.title, (titles.get(p.title) ?? 0) + 1);
  for (const [title, count] of titles) {
    if (count > 1) findings.push({ level: "error", message: `Duplicate title: "${title}" (${count}×).` });
  }

  // Blocking: required core pages must exist.
  for (const required of ["home", "contact"]) {
    if (!plan.pages.some((p) => p.pageType === required))
      findings.push({ level: "error", message: `Missing required page type: ${required}.` });
  }

  // Blocking: non-utility pages need at least two internal links.
  for (const p of plan.pages) {
    if (!p.isUtility && p.internalLinks.length < 2)
      findings.push({
        level: "error",
        message: `Page ${p.route} has ${p.internalLinks.length} internal link(s); minimum is 2.`,
      });
  }

  // Blocking: EU regulated context requires form consent handling.
  const euRegulated = brief.business.compliance.regulated_industry && isEu(brief.business.country);
  if (euRegulated && brief.integrations.forms !== "none") {
    findings.push({
      level: "warning",
      message:
        "Regulated EU context with a form provider: the contact form must include an explicit consent field (enforced at form-generation stage).",
    });
  }

  // Warning: title length targets.
  for (const p of plan.pages) {
    if (p.title.length > 60)
      findings.push({ level: "warning", message: `Title over 60 chars (${p.title.length}): ${p.route}` });
  }

  return findings;
}

const EU_COUNTRIES = new Set([
  "nl",
  "be",
  "de",
  "fr",
  "es",
  "it",
  "ie",
  "pt",
  "at",
  "lu",
  "dk",
  "se",
  "fi",
  "pl",
  "cz",
  "netherlands",
  "belgium",
  "germany",
  "france",
]);

function isEu(country: string): boolean {
  return EU_COUNTRIES.has(country.trim().toLowerCase());
}
