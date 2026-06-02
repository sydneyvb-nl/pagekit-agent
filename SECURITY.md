# Security Policy

## Supported versions

pagekit-agent is pre-1.0. Security fixes land on `main`; please track the latest
commit or release.

## Reporting a vulnerability

Please **do not** open a public issue for security problems. Instead, use GitHub's
private vulnerability reporting:

1. Go to the repository's **Security** tab → **Report a vulnerability**.
2. Describe the issue, affected files, and a reproduction if possible.

We aim to acknowledge reports within a few days.

## Scope notes

This project's primary user is an LLM agent that generates websites. Especially
relevant reports include:

- Ways the generator can be made to **invent unverifiable claims** (credentials,
  prices, medical/legal guarantees) despite the safe-by-default rules.
- **Template/content injection** through brief fields into generated output.
- Supply-chain concerns in the dependency graph. Note we enforce a 14-day
  `minimumReleaseAge` cooldown and an explicit build-script allowlist in
  `pnpm-workspace.yaml`.
