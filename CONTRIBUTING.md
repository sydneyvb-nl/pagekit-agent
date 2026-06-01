# Contributing to pagekit-agent

Thanks for your interest! This project's primary user is an LLM agent, so the
bar for contributions is: **is it deterministic, documented, and validated?**

## Development setup

```bash
corepack enable          # provides pnpm
pnpm install
pnpm -r lint             # typecheck all packages
pnpm test                # run the test suite
pnpm plan --dry-run      # plan the example brief without writing files
```

Node ≥ 20, pnpm ≥ 9.

## Ground rules

- **Structure stays deterministic.** Anything affecting routes, required
  sections, schema types or validation must be data-driven and tested.
- **Safe by default.** Never add a code path that can invent a credential,
  price, review, or claim. Gaps become explicit `TODO`s + a missing-input entry.
- **Keep the JSON Schema and the Zod schema in sync.** `input/business-brief.schema.json`
  mirrors `packages/generator/src/brief/schema.ts`. Change both together.
- **Match the surrounding style.** TypeScript, ESM, strict mode, no `any`.

## The easiest contribution: a new vertical

You can add support for a whole new business type without touching the
generator. See [`docs/vertical-authoring.md`](docs/vertical-authoring.md). In
short: add `verticals/<id>/vertical.yaml`, where `<id>` matches a `business.type`
enum value, then add that value to the enum in both schemas.

## Pull requests

1. Branch from `main`.
2. Add or update tests for behavior changes.
3. Ensure `pnpm -r lint` and `pnpm test` pass.
4. Describe what the change does and which quality gate (if any) it affects.

## License

By contributing you agree your contributions are licensed under Apache-2.0.
