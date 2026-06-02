import type { SitePlan } from "../plan/planSite.js";
import { countWords, type SiteContent } from "./model.js";

export interface ContentFinding {
  level: "error" | "warning";
  message: string;
}

/**
 * Quality gates for resolved {@link SiteContent}, checked against the structural
 * {@link SitePlan} it was generated from.
 *
 * Errors block (structure was not honoured); warnings flag work the content
 * still needs (short copy, unresolved placeholders) without failing a run —
 * placeholder mode is *expected* to warn.
 */
export function validateContent(content: SiteContent, plan: SitePlan): ContentFinding[] {
  const findings: ContentFinding[] = [];
  const planByRoute = new Map(plan.pages.map((p) => [p.route, p] as const));

  // Blocking: every planned page must have resolved content, and vice versa.
  const contentRoutes = new Set(content.pages.map((p) => p.route));
  for (const planned of plan.pages) {
    if (!contentRoutes.has(planned.route))
      findings.push({ level: "error", message: `No content generated for planned page ${planned.route}.` });
  }

  for (const page of content.pages) {
    const planned = planByRoute.get(page.route);
    if (!planned) {
      findings.push({ level: "error", message: `Content for ${page.route} has no matching planned page.` });
      continue;
    }

    // Blocking: every planned section must be present, in structure.
    const present = new Set(page.sections.map((s) => s.section));
    for (const section of planned.sections) {
      if (!present.has(section))
        findings.push({
          level: "error",
          message: `Page ${page.route} is missing planned section "${section}".`,
        });
    }

    // Blocking: a page must have a title and a meta description.
    if (!page.title.trim())
      findings.push({ level: "error", message: `Page ${page.route} has an empty title.` });
    if (!page.metaDescription.value.trim())
      findings.push({ level: "error", message: `Page ${page.route} has an empty meta description.` });

    // Warning: meta description length target.
    const metaLen = page.metaDescription.value.length;
    if (metaLen > 160)
      findings.push({
        level: "warning",
        message: `Meta description over 160 chars (${metaLen}) on ${page.route}.`,
      });

    // Warning: copy depth below the blueprint target.
    if (page.wordCount < page.minWords)
      findings.push({
        level: "warning",
        message: `Page ${page.route} has ~${page.wordCount} words; blueprint targets ${page.minWords}.`,
      });
  }

  // Warning: unresolved placeholders remaining (expected in placeholder mode).
  const todoCount = content.todos.length;
  if (todoCount)
    findings.push({
      level: "warning",
      message: `${todoCount} unresolved TODO(s) across the site (see content-todos.md).`,
    });

  return findings;
}

/** Total approximate word count across the site, for reporting. */
export function totalWordCount(content: SiteContent): number {
  return content.pages.reduce(
    (sum, p) =>
      sum +
      p.sections.reduce((s, sec) => {
        let n = sec.heading ? countWords(sec.heading.value) : 0;
        for (const b of sec.body) n += countWords(b.value);
        return s + n;
      }, 0),
    0,
  );
}
