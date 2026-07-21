# Security policy

Report suspected vulnerabilities privately to the repository owner. Do not open a public issue containing credentials, personal data, exploit details, or database contents.

## Supported boundary

Only the API routes `/api/auth/*`, `/api/procurement/*`, and `/api/health*` plus the built procurement UI are supported. Historical route/page files are unmounted prototype material and must not be exposed without a new threat model, authorization design, tests, and review.

## Controls and operator duties

- Configuration fails closed without `DATABASE_URL`, a non-placeholder 32+ character `JWT_SECRET`, and exact allowed origins. Rotate the JWT secret to invalidate all sessions after suspected exposure.
- Authentication uses a 15-minute HTTP-only, SameSite=Strict cookie; production requires HTTPS. The backend reloads the current user, active flag, role, and auth version on every request.
- Self-registration is disabled. Bootstrap is one-time. Operators must use unique passwords, least-privilege roles, prompt offboarding, and increment `auth_version` after role/password/security changes.
- Request payloads are capped at 64 KiB, inputs are bounded, totals are server-calculated, login is rate-limited, security headers are enabled, and errors do not expose stack traces or SQL details. State changes require JSON plus a non-simple idempotency header; combined with exact-origin CORS and SameSite=Strict cookies this rejects ordinary cross-site form/fetch requests.
- Workflow events are append-only at the database layer. Database administrators remain privileged and their access must be separately audited by PostgreSQL/platform logs.
- `.env`, private keys, credentials, and tokens are ignored. Keep secret values in the deployment secret store, restrict local `.env` files to owner read/write, scan the full Git history, and rotate any value ever exposed.
- The application currently has a single-organization role boundary, not tenant isolation. Do not use it for multiple mutually untrusted organizations.

## Incident response

Contain access, preserve application/database/provider audit evidence, rotate credentials and `JWT_SECRET`, disable or version affected users, assess immutable procurement events against database logs, notify affected stakeholders under applicable policy/law, restore only from a verified clean backup, and document corrective action.
