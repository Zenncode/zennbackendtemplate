# AI Workflow

## Goal

Provide a consistent process for making safe, shippable changes to the CLI and backend template.

## Standard Flow

1. Identify scope.
   - CLI behavior change: edit files in `backend/bin` and `backend/package.json`.
   - Template app change: edit files in `backend/templates/backend/`.
2. Read local context first.
   - Check existing README/docs and neighboring code before editing.
3. Implement minimal change.
   - Favor narrow diffs and preserve existing project style.
4. Validate locally.
   - Run the smallest relevant command set (`lint`, `test`, `build`, or `test:cli`).
5. Update documentation.
   - Reflect behavior/API changes in markdown docs near the affected area.
6. Final verification.
   - Confirm no accidental file churn and summarize changed files + outcomes.

## Suggested Command Sets

### If CLI was changed (`backend/`)

1. `npm run test:cli`
2. `node ./bin/zenntechinc.js --help`

### If template app was changed (`backend/templates/backend/`)

1. `npm run lint`
2. `npm test`
3. `npm run build`

## Definition of Done

- Changes are limited to requested scope.
- Relevant checks pass or failures are clearly reported.
- Docs are updated for any new or changed behavior.
- The final summary includes:
  - what changed
  - why it changed
  - what was validated
  - any known follow-ups

## Escalation Rules

Pause and confirm before:

- changing public CLI commands/flags
- modifying auth token behavior
- altering endpoint contracts
- adding/removing major dependencies
