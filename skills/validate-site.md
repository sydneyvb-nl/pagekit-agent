# Skill: validate-site

Run the quality gates against a brief/plan and report results without changing
content.

## Trigger

The user asks to validate, check, or review a site/brief.

## Steps

1. `pnpm validate:brief <path>` — schema validity.
2. `pnpm plan <path> --dry-run` — structural gates without writing files.
3. Summarize findings: list each blocking error and warning verbatim.
4. _(later stages)_ `pnpm validate:seo`, `validate:schema`, `validate:a11y`.

## Outputs

A findings summary. State clearly which gates ran and which are not yet
implemented — do not imply coverage you didn't run.

## Validation

This skill is read-only. It must not modify the brief, the plan, or any content.
