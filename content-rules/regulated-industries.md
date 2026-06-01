# Regulated industries

Applies when `business.compliance.regulated_industry` is `true` (e.g. midwifery,
physiotherapy, dental, legal). These rules are stricter than the global set and
are reinforced per vertical via `content_cautions`.

## Rules

- **No guarantees of outcome.** Never promise recovery, results, success rates,
  or "pain-free", "guaranteed", "cure".
- **Do not replace professional advice.** Frame content as informational; direct
  readers to a consultation for their specific situation.
- **Cautious, precise language.** Avoid alarming or absolute claims.
- **Schema stays conservative.** Use the vertical's `schema_default` only; never
  claim a regulated subtype you cannot verify (`Physician`, `Hospital`).
- **Forms.** Never request sensitive medical/legal detail in a generic contact
  form. If `medical_or_legal_claims_allowed` is `false`, omit any copy that makes
  such a claim, even if it would read well.
- **EU consent.** In an EU regulated context, the contact form must include an
  explicit consent field and a privacy note (the planner flags this; the
  form-generation stage enforces it).

## When unsure

Downgrade the claim, add a `TODO` for the business owner to confirm, and record
it in `generated/missing-inputs.md`.
