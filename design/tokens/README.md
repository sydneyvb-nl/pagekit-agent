# Design tokens

Implementation-independent design tokens. Themes in `../themes/` reference these
scales by name. A later roadmap step exports them to CSS custom properties and to
the Webstudio token JSON mapping.

- `colors.yaml` — semantic color roles (per theme, see `../themes/`)
- `typography.yaml` — font families, type scale, weights, line heights
- `spacing.yaml` — spacing scale + semantic section spacing
- `radius.yaml` — border-radius scale

Agent rule: only adapt tokens when the brief provides explicit brand colors, or
when contrast validation fails. Otherwise use the theme preset as-is.
