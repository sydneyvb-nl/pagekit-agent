import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

/**
 * Resolve the repository root by walking up from a starting directory until a
 * `pnpm-workspace.yaml` is found. Falls back to `process.cwd()`.
 */
export function findRepoRoot(start: string = process.cwd()): string {
  let dir = resolve(start);
  for (;;) {
    if (existsSync(join(dir, "pnpm-workspace.yaml"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return process.cwd();
    dir = parent;
  }
}

export function verticalsDir(root = findRepoRoot()): string {
  return join(root, "verticals");
}

export function generatedDir(root = findRepoRoot()): string {
  return join(root, "generated");
}
