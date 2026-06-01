# Agent playbook

Quick reference for an agent operating this repo. For the authoritative rules,
read [`AGENTS.md`](../AGENTS.md); for the full sequence, read
[`site-generation-protocol.md`](site-generation-protocol.md).

## The loop

```
read AGENTS.md → validate brief → plan → read reports → generate content
→ run gates → fix → report
```

## Commands you will use

| Goal                       | Command                                       |
| -------------------------- | --------------------------------------------- |
| Validate a brief           | `pnpm validate:brief <path>`                  |
| Plan a site + reports      | `pnpm plan <path>`                            |
| Plan without writing       | `pnpm plan <path> --dry-run`                  |
| Inspect a vertical         | `pnpm inspect:vertical <id>`                  |
| Typecheck                  | `pnpm -r lint`                                |
| Tests                      | `pnpm test`                                   |

## Decision rules

- **Missing required field?** Stop and report it — the brief won't validate.
- **Missing optional fact (address, hours, price)?** Leave a `TODO:`, add it to
  `missing-inputs.md`, continue.
- **Unknown business type?** The resolver falls back to `local-service` and
  records it. That's fine; don't invent a vertical.
- **Tempted to write a testimonial / review / certification?** Don't. Use a
  clearly-marked placeholder.

## Anti-patterns

- Asking the user a question that a safe placeholder could answer.
- Claiming the site is "live" or "deployed" when only the plan was generated.
- Editing generated reports by hand instead of re-running `pnpm plan`.
- Adding a route or schema type that no blueprint defines.
