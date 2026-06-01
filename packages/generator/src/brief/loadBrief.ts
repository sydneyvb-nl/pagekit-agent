import { readFileSync } from "node:fs";
import { extname } from "node:path";
import { parse as parseYaml } from "yaml";
import { z } from "zod";
import { BriefSchema, type Brief } from "./schema.js";

export interface BriefIssue {
  path: string;
  message: string;
}

export type LoadBriefResult =
  | { ok: true; brief: Brief }
  | { ok: false; issues: BriefIssue[] };

/** Parse a YAML or JSON brief file into a plain object (no schema validation). */
export function readBriefFile(filePath: string): unknown {
  const raw = readFileSync(filePath, "utf8");
  const ext = extname(filePath).toLowerCase();
  if (ext === ".json") return JSON.parse(raw);
  // yaml.parse also accepts JSON, so it is a safe default for .yaml/.yml.
  return parseYaml(raw);
}

/** Validate an already-parsed brief object against the schema. */
export function validateBrief(data: unknown): LoadBriefResult {
  const result = BriefSchema.safeParse(data);
  if (result.success) return { ok: true, brief: result.data };
  return { ok: false, issues: toIssues(result.error) };
}

/** Read and validate a brief from disk in one step. */
export function loadBrief(filePath: string): LoadBriefResult {
  let data: unknown;
  try {
    data = readBriefFile(filePath);
  } catch (err) {
    return {
      ok: false,
      issues: [
        {
          path: filePath,
          message: `Could not parse brief: ${(err as Error).message}`,
        },
      ],
    };
  }
  return validateBrief(data);
}

function toIssues(error: z.ZodError): BriefIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.length ? issue.path.join(".") : "(root)",
    message: issue.message,
  }));
}
