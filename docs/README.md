# Documentation map

Start here if you are a human. If you are an LLM agent, start at
[`../AGENTS.md`](../AGENTS.md) — it tells you which of these to read, in order.

## Read in this order

| #   | Doc                                                       | What it gives you                                  |
| --- | --------------------------------------------------------- | -------------------------------------------------- |
| 1   | [`../AGENTS.md`](../AGENTS.md)                             | Operating rules for the agent. The contract.       |
| 2   | [principles.md](principles.md)                            | The five working principles behind every decision. |
| 3   | [architecture.md](architecture.md)                        | The pipeline and module responsibilities.          |
| 4   | [site-generation-protocol.md](site-generation-protocol.md)| The step-by-step procedure for one run.            |
| 5   | [quality-gates.md](quality-gates.md)                      | Blocking errors vs. warnings; which gates run.     |

## Reference

| Doc                                       | When you need it                              |
| ----------------------------------------- | --------------------------------------------- |
| [status.md](status.md)                    | Current project status — what is/ isn't built |
| [roadmap.md](roadmap.md)                  | Phased build plan mapped to the PRD            |
| [vertical-authoring.md](vertical-authoring.md) | Add support for a new business type      |
| [agent-playbook.md](agent-playbook.md)    | Quick command + decision reference            |
| [../skills/README.md](../skills/README.md)| Task recipes (create-site, add-service-page…)  |

## Where the rules actually live (machine-readable)

Docs explain intent; these files are the source of truth the generator reads:

- `../input/business-brief.schema.json` + `../packages/generator/src/brief/schema.ts`
  — the brief contract (JSON Schema mirrors the Zod schema).
- `../packages/generator/src/plan/blueprints.ts` — page-type structure.
- `../verticals/<id>/vertical.yaml` — per-vertical pages, schema, cautions.
- `../sections/**` — section contracts.
- `../content-rules/**` — content safety and tone rules.
- `../design/tokens/**`, `../design/themes/**` — design tokens and theme presets.
