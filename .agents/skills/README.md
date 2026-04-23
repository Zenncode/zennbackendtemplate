# Agent Skills (Simplified)

Purpose: define clear ownership so updates stay consistent and safe.

## Skill 1: API Flow Maintainer

- Owns: `app/routes`, `app/controllers`, `app/services`, `app/app.module.ts`
- Focus:
  - endpoint behavior
  - request/response contract consistency
  - error handling
- Validate:
  - `npm run lint`
  - `npm test`

## Skill 2: Auth and Security Keeper

- Owns: `app/common/guards`, auth service/token logic, auth DTO validation
- Focus:
  - access token vs refresh token rules
  - protected route behavior
  - auth-related validation
- Validate:
  - auth tests (`npm test`)
  - manual protected-route checks if needed

## Skill 3: Data and Integration Keeper

- Owns: `prisma`, schema/model docs, `app/config`, cache services
- Focus:
  - schema/data changes
  - MongoDB and Redis integration safety
  - backward compatibility notes
- Validate:
  - `npm run build`
  - `npm test`
  - docs alignment (`docs/`)

## Skill 4: Realtime and Infrastructure Keeper

- Owns: `app/socket`, server startup flow, environment-based runtime behavior
- Focus:
  - Socket.IO events and connection rules
  - startup resilience (port fallback, optional Redis)
  - runtime safety and graceful shutdown behavior
- Validate:
  - `npm run build`
  - socket/manual smoke checks when behavior changes

## Skill 5: Docs and Developer Experience

- Owns: `README.md`, `docs/**`, `.agents/**`
- Focus:
  - clear onboarding
  - accurate endpoint flow docs
  - keeping agent instructions updated with project changes
- Validate:
  - command/path correctness in docs
  - consistency with actual implementation

## Simple assignment rule

If a task touches route + service + docs, involve both:
- `API Flow Maintainer` for code behavior
- `Docs and Developer Experience` for documentation updates
