import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { verticalsDir } from "../paths.js";
import { VerticalSchema, type Vertical } from "./schema.js";

const FALLBACK_VERTICAL = "local-service";

export interface ResolveVerticalResult {
  vertical: Vertical;
  /** True when the requested vertical was missing and the fallback was used. */
  usedFallback: boolean;
  requestedId: string;
}

/**
 * Load a vertical definition by id. Business `type` values map 1:1 to vertical
 * directory ids; an unknown type falls back to `local-service` so generation
 * never blocks on an unsupported vertical.
 */
export function resolveVertical(
  businessType: string,
  root?: string,
): ResolveVerticalResult {
  const dir = verticalsDir(root);
  const requested = loadVerticalFile(dir, businessType);
  if (requested) {
    return { vertical: requested, usedFallback: false, requestedId: businessType };
  }
  const fallback = loadVerticalFile(dir, FALLBACK_VERTICAL);
  if (!fallback) {
    throw new Error(
      `Vertical '${businessType}' not found and fallback '${FALLBACK_VERTICAL}' is missing from ${dir}.`,
    );
  }
  return { vertical: fallback, usedFallback: true, requestedId: businessType };
}

function loadVerticalFile(dir: string, id: string): Vertical | null {
  const file = join(dir, id, "vertical.yaml");
  if (!existsSync(file)) return null;
  const data = parseYaml(readFileSync(file, "utf8"));
  return VerticalSchema.parse(data);
}
