import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const cli = join(here, "..", "src", "cli.ts");

function run(args: string[]): { code: number; out: string } {
  try {
    const out = execFileSync("npx", ["tsx", cli, ...args], { encoding: "utf8" });
    return { code: 0, out };
  } catch (err) {
    const e = err as { status?: number; stdout?: string; stderr?: string };
    return { code: e.status ?? 1, out: `${e.stdout ?? ""}${e.stderr ?? ""}` };
  }
}

describe("cli", () => {
  it("plan --dry-run does not treat the flag as a brief path", () => {
    const { code, out } = run(["plan", "--dry-run"]);
    expect(out).not.toContain("brief is invalid (--dry-run)");
    expect(out).toContain("dry run");
    expect(code).toBe(0);
  });

  it("validate accepts the example brief", () => {
    const { code, out } = run(["validate"]);
    expect(out).toContain("Brief is valid");
    expect(code).toBe(0);
  });
});
