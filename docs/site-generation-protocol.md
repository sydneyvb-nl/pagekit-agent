# Site generation protocol

The exact sequence an agent follows to generate a site. This is the long-form
version of the workflow in [`AGENTS.md`](../AGENTS.md).

## 0. Preconditions

- Repo installed: `pnpm install`.
- A brief exists at `input/business-brief.yaml` (or a path you were given).

## 1. Validate the brief

```bash
pnpm validate:brief input/business-brief.yaml
```

If invalid, the command prints each issue with a dotted path
(`business.contact.email`) and a message. Fix the brief or report the blocking
field. **Do not proceed on an invalid brief.**

## 2. Plan the site

```bash
pnpm plan input/business-brief.yaml
```

This:

1. Resolves the vertical from `business.type` (falls back to `local-service`).
2. Expands page blueprints + one service page per `business.services` entry.
3. Injects mandatory legal/utility pages (`privacy`, `404`, and `cookies` when
   analytics/forms are active).
4. Builds the internal-link graph.
5. Runs structural quality gates.
6. Writes the report set to `generated/`.

A blocking error (duplicate route/title, missing required page, too few internal
links) fails the command with exit code 1.

## 3. Read the plan and the gaps

Read, in order:

- `generated/site-plan.md` — the structure you must fill.
- `generated/assumptions.md` — what was assumed; verify each is acceptable.
- `generated/missing-inputs.md` — gaps you must leave as `TODO`, not invent.

## 4. Generate content (per page)

For each page in the plan, write copy that:

- fills every required section in order;
- obeys `content-rules/` and the selected `verticals/<id>/vertical.yaml`
  cautions;
- answers, for a service page: **what it is, who it's for, how it works, what to
  expect, when to contact, next step**;
- marks every unverified fact with `TODO:` and adds it to missing-inputs.

## 5. Run quality gates

See [`quality-gates.md`](quality-gates.md). Do not skip. Fix blocking errors and
re-run until clean.

## 6. Report

Update `generated/build-report.md` and `generated/change-log.md` with what was
generated, which gates passed, and what remains TODO. Report exactly what you
verified — no more.
