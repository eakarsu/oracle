# Completeness Review: oracle

**Review date:** 2026-07-18

## Assessment basis

Static inspection of project-owned source and configuration only; no dependency installation, build, database migration, external-service call, or runtime launch was performed. The scan considered 99 project files (88 source files), 2 manifest(s), 0 test-like file(s), and 0 CI workflow(s), excluding dependency/generated directories.

## Classification

**Prototype-demo**

This is a prototype/demo for application workflow. Generated gap/demo patterns are present: it contains 88 source files and visible routes/pages in `backend/`, `frontend/`, but those surfaces are not evidence of durable domain execution, verified integrations, or operational completion.

## Why it is not complete

- Generated gap/visualization routes describe missing capabilities or simulate recommendations; they do not implement the underlying domain operation.
- Generic LLM calls are used as product behavior without enough typed tools, grounded evidence, deterministic rules, or output evaluation.
- Mock, demo, sample, fixture, or placeholder behavior remains in executable/product paths.
- No recognizable project-owned automated tests were found for the main workflow.
- No checked-in CI workflow proves builds, tests, migrations, and security checks on every change.

## Needed features

1. Define the primary user and acceptance criteria, then complete one end-to-end workflow against persistent data instead of demo fixtures.
2. Replace mocks, placeholders, and generic AI responses with validated domain services and explicit failure/retry behavior.
3. Implement secure identity, role/tenant boundaries, input validation, secrets handling, and auditable state changes.
4. Add representative automated tests, CI quality gates, environment documentation, migrations, observability, backup, and deployment configuration.
5. Add risk-based unit, integration, and end-to-end tests in CI, including migration and failure-path coverage.

## Risks or launch blockers

- Credential/configuration exposure: environment files are present in the repository tree and must be checked against Git history and rotated if real.
- Weak/fallback secret patterns can permit forged sessions or accidental insecure deployments.
- Automation contains destructive process, filesystem, or database operations; do not run it on a shared machine without review.
- Startup appears coupled to seed/migration behavior, risking data mutation or non-repeatable launches.

## Evidence inspected

- `backend/middleware/auth.js:4`
- `backend/routes/gap-features.js:8`
- `backend/server.js`
- `backend/middleware/auth.js`
- `backend/package.json`
- `start.sh`

## Recommended next action

Stop adding generated pages; prove one application workflow workflow against real services and persistent state, with tests and measurable acceptance criteria.

## Implementation progress — 2026-07-20

**Boundary decision:** implementation is complete for the safest evidence-backed retained product boundary: single-organization purchase-order submission and approval. Within that boundary the project is now **functional but incomplete**; the historical 42-module “ERP,” generated gap/AI pages, custom views, and order-to-cash demos remain prototype reference files and are deliberately absent from the runtime, navigation, container, and supported API.

### Implemented

- Defined requesters as the primary users and documented measurable acceptance criteria in `README.md` and the state/role contract in `docs/PROCUREMENT_WORKFLOW.md`.
- Replaced generic procurement CRUD with persistent `draft → submitted → approved|rejected` and `draft|submitted → cancelled` transitions. The API calculates totals, validates bounded inputs, locks rows during transitions, requires UUID idempotency keys, fingerprints creation and transition payloads, scopes requesters to their own records, and prevents self-approval.
- Added ordered, checksummed PostgreSQL migration `0001_bounded_procurement.sql`, advisory-lock migration execution, readiness checks, foreign keys, data constraints for new/changed rows, actor IDs, and append-only procurement events protected by a database trigger.
- Replaced fallback database/JWT behavior with validated fail-closed configuration using only `DATABASE_URL`; added 15-minute signed sessions in HTTP-only SameSite=Strict cookies, current-user/active/auth-version checks on every request, exact-origin CORS, login throttling, security/CSP headers, 64 KiB body limits, generic database errors, no-store API caching, and request IDs/structured completion logs.
- Disabled public registration and shared demo credentials; added one-time first-admin bootstrap plus explicit operator user provisioning. The legacy destructive seed is no longer a package command and refuses production, missing confirmation, or a default/short demo password.
- Replaced the frontend navigation with a dedicated procurement queue/form/history UI. Removed token storage, demo-account autofill, generated gap routes, generic module mutation, and unsupported module navigation from the built application.
- Replaced `start.sh` with a loopback-only, fail-closed launcher that checks configuration, schema readiness, dependencies, and free ports, manages only its child processes, and never installs, updates, seeds, migrates, starts PostgreSQL, creates databases, or kills unrelated processes.
- Added pinned CI actions, PostgreSQL integration coverage, syntax/build/test/audit/container gates, full-history secret scanning, a non-root multi-stage Dockerfile, `.env.example`, security policy, migration/deployment instructions, liveness/readiness endpoints, backup/restore expectations, and rollback/incident guidance.

### Verification evidence

- Pre-edit collision protocol found only the inherited untracked `_COMPLETENESS_REVIEW.md`; no recent non-generated writes or external writer processes were present. Two 10-second baselines were identical: source `ef6ce63e3b4c35d9e070e77de434a31ad2f0ecbfb06a99dff43207ace962f528`, review `bf9b54354ead5c2714dda76c889c01e74a444558beec40081d32b3f88561a274`.
- Baseline dependency audit: backend 7 findings (4 moderate, 3 high); frontend 6 findings (1 low, 4 moderate, 1 high). After lockfile upgrades, both `npm audit --audit-level=high` runs report 0 vulnerabilities.
- Backend `node --test --test-concurrency=1 test/*.test.js`: 6/6 passing against a disposable PostgreSQL database. Coverage includes migration replay/checksum readiness, authentication cookies, forbidden origins, retired-route denial, owner scoping, server-calculated totals, concurrent idempotent transition retry, idempotency-payload conflict, approve/reject/cancel paths, invalid transitions, separation of duties, rejection reason validation, append-only update/delete rejection, foreign-key audit retention, and disabled-user revocation.
- Frontend `node --test test/*.test.js`: 2/2 passing; Vite 8.1.5 production build passes with 27 transformed modules and a 245.15 kB JavaScript bundle (77.97 kB gzip). All project-owned backend JavaScript passes `node --check`.
- An isolated launcher smoke test returned readiness 200, frontend 200, retired legacy API 404, and required security headers; its temporary database and processes were removed afterward. Migration was also verified from a legacy-shaped schema while retaining an unsupported legacy status without guessing ownership.
- Gitleaks 8.30.1 full Git-history and workspace scans both returned 0 findings. No tracked/reachable non-example environment or private-key path was found. Both ignored local environment files were retained without value changes and restricted to mode `0600`.
- `git diff --check`, `bash -n start.sh`, and CI YAML parsing pass. The Dockerfile is checked by CI, but the local Docker build could not run because the configured Colima Docker daemon is unavailable.

### Residual launch blockers and limits

- The ignored local configuration was intentionally not rewritten: the current JWT value is short/placeholder and `CORS_ORIGINS` is malformed. `npm run check:config` therefore correctly exits 1 before any database or listener action. An operator must supply new secret-managed values; any real value previously shared elsewhere must be rotated.
- The configured application database was not migrated, reset, seeded, bootstrapped, or otherwise altered. An operator must back it up, review legacy rows, run the explicit migration release step, verify readiness, and provision distinct requester/manager accounts before launch.
- Remote GitHub Actions and the container build have not run in this workspace. No real backup/restore drill, alert delivery, TLS/reverse-proxy deployment, or production rollback exercise can be evidenced until a deployment environment exists.
- This remains a single-organization workflow. Tenant isolation, vendor master/accounting integration, budget reservation, attachments, notifications, exchange-rate conversion, account self-service, and the broader historical ERP/AI surfaces are explicitly out of scope and must not be represented as complete.

### Runtime campaign acceptance (2026-07-20)

The root launcher now resolves the original project when invoked from an isolated fixture, accepts injected configuration without requiring an ignored `.env`, enforces distinct assigned backend/frontend ports, and binds the backend to loopback. The existing bcrypt-12 bootstrap is exposed as an explicit `create-admin` command and now requires the standard one-time acknowledgement while retaining its database guard. The first 55679/6162/6163 attempt failed before any listener because bootstrap inherited the deliberately malformed local CORS value; the shared validator now injects its assigned UI origin consistently during bootstrap and launch. On the wholly fresh 55682/6168/6169 triple, ordered migration/bootstrap, API and UI startup, credentials login, database-revalidated HTTP-only session cookie, and authenticated `/api/auth/me` all passed (`API_VERIFIED`, `startup_login_session_api`). A separate PostgreSQL run on 55683 passed all 6 backend scenarios, both frontend tests, the 27-module Vite production build, launcher/script/manifest checks, and `git diff --check`.
