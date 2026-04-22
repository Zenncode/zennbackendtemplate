# AI Skills Map

## Purpose

Define reusable AI skill roles for this repository so tasks can be executed faster and with fewer regressions.

## Skill 1: CLI Maintainer

- Ownership: `backend/bin/zenntechinc.js`, `backend/package.json`
- Responsibilities:
  - maintain command parsing and help/version output
  - preserve project generation flow (`new`, `--skip-install`)
  - keep copy behavior stable and predictable
- Validation:
  - `npm run test:cli`
  - manual `--help` and `--version` checks

## Skill 2: Template API Engineer

- Ownership: `backend/templates/backend/app/**`
- Responsibilities:
  - implement route/service updates
  - preserve auth flow (login, refresh, logout)
  - maintain compatibility for existing endpoint contracts when possible
- Validation:
  - `npm run lint`
  - `npm test`

## Skill 3: Data and Schema Keeper

- Ownership: `backend/templates/backend/prisma/**`, model docs
- Responsibilities:
  - evolve schema/model files safely
  - keep migrations/schema docs aligned with code changes
  - flag breaking data changes explicitly
- Validation:
  - ensure schema files compile in project context
  - update related docs in `backend/templates/backend/docs/`

## Skill 4: Quality and Test Guardian

- Ownership: `backend/templates/backend/tests/**`
- Responsibilities:
  - add or update tests for behavior changes
  - prevent regressions in auth and protected routes
  - keep test intent readable and deterministic
- Validation:
  - `npm test`
  - targeted endpoint smoke checks where needed

## Skill 5: Docs and Developer Experience

- Ownership: `README.md` and `docs/**` files in both CLI and template areas
- Responsibilities:
  - keep setup/usage instructions accurate
  - document new endpoints and request/response formats
  - ensure quick-start remains copy-paste friendly
- Validation:
  - verify command snippets and paths are correct
  - confirm docs reflect actual code behavior

## Skill Selection Guide

- CLI command issue -> use `CLI Maintainer`
- Endpoint or auth issue -> use `Template API Engineer`
- Schema/model updates -> use `Data and Schema Keeper`
- Failing tests or missing coverage -> use `Quality and Test Guardian`
- Confusing onboarding/setup docs -> use `Docs and Developer Experience`
