# AI Context: ZENNTECHINC Backend Template

## Repository Purpose

This workspace contains a CLI package that scaffolds backend API projects.

- CLI package root: `backend/`
- Generated project source template: `backend/templates/backend/`

The CLI command `zenntechinc new <project-name>` copies the template folder into a new project and updates `package.json` name values.

## High-Level Architecture

1. `backend/bin/zenntechinc.js`
   - Entrypoint for CLI commands (`new`, `--help`, `--version`).
   - Copies template files and optionally installs dependencies.
2. `backend/templates/backend/`
   - Express + TypeScript backend starter.
   - Includes auth routes, services, tests, and Prisma model files.

## Important Paths

- `backend/package.json` - CLI package metadata and scripts.
- `backend/bin/zenntechinc.js` - Scaffolding logic.
- `backend/templates/backend/package.json` - Generated app scripts/dependencies.
- `backend/templates/backend/app/` - API implementation.
- `backend/templates/backend/tests/` - Jest tests.
- `backend/templates/backend/docs/endpoints.md` - API endpoint reference.

## Runtime and Tooling

- Node.js: `>=18.18.0`
- Language: TypeScript
- Server framework: Express
- Auth: JWT + refresh tokens
- Data libraries: Mongoose (runtime), Prisma model files (schema assets)
- Dev tooling: nodemon, ts-node, eslint, prettier, jest

## Key Commands

### CLI package (`backend/`)

- `npm run dev` - run CLI entry directly
- `npm run test:cli` - basic CLI invocation check

### Generated backend template (`backend/templates/backend/`)

- `npm run dev` - start dev server via nodemon
- `npm run build` - compile TypeScript
- `npm test` - run tests
- `npm run lint` - lint app and tests

## API Surface (Current Template)

- `GET /`
- `GET /api/health`
- `POST /api/auth/admin/login`
- `POST /api/auth/admin/refresh`
- `POST /api/auth/admin/logout` (requires access token)
- `GET /api/admin/me` (requires access token)

## Working Rules for AI Contributors

- Keep CLI behavior backward-compatible unless change is requested.
- If changing template APIs, update both code and docs in `backend/templates/backend/docs/`.
- Prefer small, testable edits and run related scripts before finishing.
- Never remove existing template files unless the request explicitly requires it.
