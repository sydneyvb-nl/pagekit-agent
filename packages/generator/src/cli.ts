#!/usr/bin/env node
import { join } from "node:path";
import { loadBrief } from "./brief/loadBrief.js";
import { resolveVertical } from "./vertical/resolveVertical.js";
import { planSite } from "./plan/planSite.js";
import { validatePlan, type PlanFinding } from "./plan/validatePlan.js";
import { writeReports } from "./report/writeReports.js";
import { findRepoRoot, generatedDir, verticalsDir } from "./paths.js";
import { existsSync, readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";

const DEFAULT_BRIEF = "input/business-brief.example.yaml";

function main(argv: string[]): number {
  const [command, ...rest] = argv;
  switch (command) {
    case "validate":
      return cmdValidate(rest[0]);
    case "plan":
      return cmdPlan(rest[0], rest.includes("--dry-run"));
    case "inspect-vertical":
      return cmdInspectVertical(rest[0]);
    case undefined:
    case "help":
    case "--help":
    case "-h":
      printHelp();
      return 0;
    default:
      console.error(`Unknown command: ${command}\n`);
      printHelp();
      return 2;
  }
}

function cmdValidate(briefPath?: string): number {
  const path = resolveBriefPath(briefPath);
  const result = loadBrief(path);
  if (!result.ok) {
    console.error(`✗ Brief is invalid: ${path}\n`);
    for (const issue of result.issues) console.error(`  - [${issue.path}] ${issue.message}`);
    return 1;
  }
  console.log(`✓ Brief is valid: ${path}`);
  console.log(`  business: ${result.brief.business.name} (${result.brief.business.type})`);
  console.log(`  services: ${result.brief.business.services.length}`);
  return 0;
}

function cmdPlan(briefPath: string | undefined, dryRun: boolean): number {
  const path = resolveBriefPath(briefPath);
  const loaded = loadBrief(path);
  if (!loaded.ok) {
    console.error(`✗ Cannot plan: brief is invalid (${path}). Run \`validate\` for details.`);
    return 1;
  }

  const root = findRepoRoot();
  const { vertical, usedFallback, requestedId } = resolveVertical(loaded.brief.business.type, root);
  if (usedFallback) {
    console.log(`ℹ Vertical '${requestedId}' not found; using fallback '${vertical.id}'.`);
  }

  const plan = planSite({ brief: loaded.brief, vertical, usedFallbackVertical: usedFallback });
  const findings = validatePlan(plan, loaded.brief);
  printFindings(findings);

  const errors = findings.filter((f) => f.level === "error");

  if (!dryRun) {
    const outDir = generatedDir(root);
    const written = writeReports(plan, outDir);
    console.log(`\n✓ Wrote ${written.length} report(s) to ${rel(root, outDir)}/`);
    for (const w of written) console.log(`  - ${w.file}`);
  } else {
    console.log(`\n(dry run: ${plan.pages.length} pages planned, no files written)`);
  }

  if (errors.length) {
    console.error(`\n✗ Plan has ${errors.length} blocking error(s).`);
    return 1;
  }
  console.log(`\n✓ Plan passes structural quality gates (${plan.pages.length} pages).`);
  return 0;
}

function cmdInspectVertical(id?: string): number {
  if (!id) {
    console.error("Usage: pagekit inspect-vertical <id>");
    return 2;
  }
  const file = join(verticalsDir(), id, "vertical.yaml");
  if (!existsSync(file)) {
    console.error(`✗ No vertical found at ${file}`);
    return 1;
  }
  const data = parseYaml(readFileSync(file, "utf8"));
  console.log(JSON.stringify(data, null, 2));
  return 0;
}

function resolveBriefPath(input?: string): string {
  if (input) return input;
  return join(findRepoRoot(), DEFAULT_BRIEF);
}

function printFindings(findings: PlanFinding[]): void {
  if (!findings.length) {
    console.log("✓ No findings.");
    return;
  }
  for (const f of findings) {
    const icon = f.level === "error" ? "✗" : "⚠";
    console.log(`${icon} [${f.level}] ${f.message}`);
  }
}

function rel(root: string, p: string): string {
  return p.startsWith(root) ? p.slice(root.length + 1) : p;
}

function printHelp(): void {
  console.log(`pagekit — agent-ready local business site generator

Usage:
  pagekit validate [brief.yaml]          Validate a business brief against the schema
  pagekit plan [brief.yaml] [--dry-run]  Resolve vertical, plan the site, write reports
  pagekit inspect-vertical <id>          Print a vertical definition as JSON
  pagekit help                           Show this help

Defaults to ${DEFAULT_BRIEF} when no brief path is given.`);
}

process.exit(main(process.argv.slice(2)));
