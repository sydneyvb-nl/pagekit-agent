import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { designDir, findRepoRoot } from "../paths.js";

/**
 * Resolve a named theme preset plus the shared design tokens into a flat set of
 * CSS custom properties, ready for the Astro layer to drop into a `:root` block.
 *
 * This is the deterministic bridge between the implementation-independent design
 * system (`design/themes/*.yaml`, `design/tokens/*.yaml`) and rendered CSS. No
 * colors or sizes are invented here: every value traces back to a token file or
 * a theme preset. When a brief supplies explicit brand colors, the caller may
 * override the accent before rendering (see `applyBrandColors`).
 */

export interface ThemePreset {
  name: string;
  colors: {
    background: string;
    surface: string;
    text: string;
    muted: string;
    accent: string;
    accent_contrast: string;
  };
  typography: { heading: string; body: string };
  spacing_scale: string;
  radius_scale: string;
  motion: string;
}

export interface ResolvedTheme {
  name: string;
  /** Flat `--name: value` map for a `:root` block. */
  cssVariables: Record<string, string>;
  /** Echoed for debugging / reports. */
  fonts: { heading: string; body: string };
  motion: string;
}

interface TypographyTokens {
  families: Record<string, string>;
  scale: Record<string, number>;
  weights: Record<string, number>;
  line_height: Record<string, number>;
}
interface SpacingTokens {
  scale: Record<string, number>;
  section: { y: Record<string, string> };
}
interface RadiusTokens {
  scale: Record<string, number>;
}

export interface ResolveThemeOptions {
  root?: string;
  /** Optional brand colors from the brief; first entry overrides the accent. */
  brandColors?: string[] | null;
}

export function resolveTheme(themeName: string, options: ResolveThemeOptions = {}): ResolvedTheme {
  const root = options.root ?? findRepoRoot();
  const dir = designDir(root);

  const preset = loadYaml<ThemePreset>(join(dir, "themes", `${themeName}.yaml`), () =>
    fail(`No theme preset found: design/themes/${themeName}.yaml`),
  );
  const type = loadYaml<TypographyTokens>(join(dir, "tokens", "typography.yaml"), () =>
    fail("Missing design/tokens/typography.yaml"),
  );
  const spacing = loadYaml<SpacingTokens>(join(dir, "tokens", "spacing.yaml"), () =>
    fail("Missing design/tokens/spacing.yaml"),
  );
  const radius = loadYaml<RadiusTokens>(join(dir, "tokens", "radius.yaml"), () =>
    fail("Missing design/tokens/radius.yaml"),
  );

  const accent = pickAccent(preset.colors.accent, options.brandColors);

  const vars: Record<string, string> = {};

  // Colors.
  vars["--color-bg"] = preset.colors.background;
  vars["--color-surface"] = preset.colors.surface;
  vars["--color-text"] = preset.colors.text;
  vars["--color-muted"] = preset.colors.muted;
  vars["--color-accent"] = accent;
  vars["--color-accent-contrast"] = preset.colors.accent_contrast;

  // Fonts — resolve the preset's family choice through the token families map.
  const headingFamily = type.families[preset.typography.heading] ?? type.families.system!;
  const bodyFamily = type.families[preset.typography.body] ?? type.families.system!;
  vars["--font-heading"] = headingFamily;
  vars["--font-body"] = bodyFamily;

  // Type scale (rem).
  for (const [step, value] of Object.entries(type.scale)) vars[`--text-${step}`] = `${value}rem`;
  vars["--weight-regular"] = String(type.weights.regular ?? 400);
  vars["--weight-medium"] = String(type.weights.medium ?? 500);
  vars["--weight-bold"] = String(type.weights.bold ?? 700);
  vars["--leading-tight"] = String(type.line_height.tight ?? 1.2);
  vars["--leading-normal"] = String(type.line_height.normal ?? 1.6);

  // Spacing scale (rem).
  for (const [step, value] of Object.entries(spacing.scale)) vars[`--space-${step}`] = `${value}rem`;
  // Section vertical rhythm: the preset's spacing_scale names a section.y bucket.
  const sectionBucket = spacing.section.y[bucketFor(preset.spacing_scale)] ?? spacing.section.y.md!;
  vars["--section-y"] = `${spacing.scale[sectionBucket] ?? 2.5}rem`;

  // Radius.
  for (const [step, value] of Object.entries(radius.scale)) vars[`--radius-${step}`] = `${value}rem`;
  vars["--radius"] = `${radius.scale[preset.radius_scale] ?? radius.scale.card ?? 0.75}rem`;

  // Motion.
  vars["--motion-duration"] = preset.motion === "none" ? "0ms" : preset.motion === "lively" ? "260ms" : "160ms";

  return {
    name: preset.name,
    cssVariables: vars,
    fonts: { heading: headingFamily, body: bodyFamily },
    motion: preset.motion,
  };
}

/** Map a theme's `spacing_scale` label to a `section.y` bucket name. */
function bucketFor(spacingScale: string): string {
  switch (spacingScale) {
    case "compact":
      return "sm";
    case "spacious":
      return "lg";
    default:
      return "md"; // "standard" and anything unknown
  }
}

function pickAccent(presetAccent: string, brandColors?: string[] | null): string {
  const first = brandColors?.find((c) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c.trim()));
  return first ? first.trim() : presetAccent;
}

function loadYaml<T>(path: string, onMissing: () => never): T {
  if (!existsSync(path)) onMissing();
  return parseYaml(readFileSync(path, "utf8")) as T;
}

function fail(message: string): never {
  throw new Error(message);
}
