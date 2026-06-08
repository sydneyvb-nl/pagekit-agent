import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { stringify as stringifyYaml } from "yaml";
import type { SitePlan } from "../plan/planSite.js";

export interface WrittenReport {
  file: string;
}

/**
 * Write the "no silent magic" report set for a site plan. Returns the list of
 * files written, relative to `outDir`.
 */
export function writeReports(plan: SitePlan, outDir: string): WrittenReport[] {
  mkdirSync(outDir, { recursive: true });
  const written: WrittenReport[] = [];

  const write = (name: string, content: string) => {
    writeFileSync(join(outDir, name), content.endsWith("\n") ? content : content + "\n");
    written.push({ file: name });
  };

  write("site-plan.md", renderSitePlan(plan));
  write("site-map.yaml", renderSiteMap(plan));
  write("assumptions.md", renderList("Assumptions", plan.assumptions, plan));
  write("missing-inputs.md", renderList("Missing inputs", plan.missingInputs, plan));

  return written;
}

/**
 * Write or refresh `missing-inputs.md`, merging plan-level gaps with content
 * TODOs so every open gap lives in one report (no silent magic).
 */
export function writeMissingInputs(
  plan: SitePlan,
  contentTodos: string[],
  outDir: string,
): WrittenReport {
  mkdirSync(outDir, { recursive: true });
  const merged = mergeMissingInputs(plan.missingInputs, contentTodos);
  const body = renderMissingInputs(plan, merged);
  writeFileSync(join(outDir, "missing-inputs.md"), body.endsWith("\n") ? body : body + "\n");
  return { file: "missing-inputs.md" };
}

/** De-duplicated union of brief gaps and content TODOs. */
export function mergeMissingInputs(planMissing: string[], contentTodos: string[]): string[] {
  const out = [...planMissing];
  const seen = new Set(out);
  for (const todo of contentTodos) {
    const item = todo.startsWith("TODO:") ? todo : `TODO: ${todo}`;
    if (!seen.has(item)) {
      seen.add(item);
      out.push(item);
    }
  }
  return out;
}

function renderMissingInputs(plan: SitePlan, items: string[]): string {
  const lines = [`# Missing inputs — ${plan.business}`, ""];
  if (!items.length) {
    lines.push("_None recorded._");
  } else {
    if (plan.missingInputs.length) {
      lines.push("## From brief validation");
      lines.push("");
      for (const item of plan.missingInputs) lines.push(`- ${item}`);
      lines.push("");
    }
    const contentOnly = items.filter((i) => !plan.missingInputs.includes(i));
    if (contentOnly.length) {
      lines.push("## From content generation");
      lines.push("");
      for (const item of contentOnly) lines.push(`- ${item}`);
      lines.push("");
    }
    if (!plan.missingInputs.length && contentOnly.length === 0) {
      for (const item of items) lines.push(`- ${item}`);
      lines.push("");
    }
  }
  if (lines[lines.length - 1] !== "") lines.push("");
  return lines.join("\n");
}

function renderSitePlan(plan: SitePlan): string {
  const lines: string[] = [];
  lines.push(`# Site plan — ${plan.business}`);
  lines.push("");
  lines.push(`- **Vertical:** \`${plan.verticalId}\`${plan.usedFallbackVertical ? " _(fallback)_" : ""}`);
  lines.push(`- **Theme:** \`${plan.theme}\``);
  lines.push(`- **Language:** \`${plan.language}\``);
  lines.push(`- **Pages:** ${plan.pages.length}`);
  lines.push("");
  if (plan.contentCautions.length) {
    lines.push("## Content cautions");
    lines.push("");
    for (const caution of plan.contentCautions) lines.push(`- ${caution}`);
    lines.push("");
  }
  lines.push("## Pages");
  lines.push("");
  for (const page of plan.pages) {
    lines.push(`### ${page.route}`);
    lines.push("");
    lines.push(`- **Type:** ${page.pageType}`);
    lines.push(`- **Title:** ${page.title}`);
    lines.push(`- **Intent:** ${page.intent}`);
    if (page.targetKeyword) lines.push(`- **Target keyword:** ${page.targetKeyword}`);
    lines.push(`- **Sections:** ${page.sections.join(", ")}`);
    lines.push(`- **Schema:** ${page.schema.length ? page.schema.join(", ") : "(none)"}`);
    lines.push(`- **Min words:** ${page.minWords}`);
    lines.push(`- **Image slots:** ${page.imageSlots.join(", ") || "(none)"}`);
    if (page.internalLinks.length) {
      lines.push(`- **Internal links:**`);
      for (const link of page.internalLinks) lines.push(`  - ${link.anchor} → \`${link.to}\``);
    }
    lines.push("");
  }
  return lines.join("\n");
}

function renderSiteMap(plan: SitePlan): string {
  const data = {
    business: plan.business,
    vertical: plan.verticalId,
    theme: plan.theme,
    language: plan.language,
    pages: plan.pages.map((p) => ({
      route: p.route,
      type: p.pageType,
      title: p.title,
      schema: p.schema,
      internal_links: p.internalLinks.map((l) => l.to),
    })),
  };
  return stringifyYaml(data);
}

function renderList(heading: string, items: string[], plan: SitePlan): string {
  const lines = [`# ${heading} — ${plan.business}`, ""];
  if (!items.length) {
    lines.push("_None recorded._");
  } else {
    for (const item of items) lines.push(`- ${item}`);
  }
  lines.push("");
  return lines.join("\n");
}
