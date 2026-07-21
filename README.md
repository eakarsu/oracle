# Oracle Procurement

This repository retains one production-shaped boundary from the former Oracle ERP prototype: persistent purchase-order submission and approval. Requesters create and submit drafts; a different manager or administrator approves or rejects them; every transition is append-only and attributable.

The historical generic ERP, AI, gap, custom-view, and order-to-cash files remain as reference code but are deliberately not mounted by the server or frontend. They are not supported product features.

## Acceptance criteria

- A provisioned requester can create a draft; quantity and unit cost are validated and total cost is calculated by the server.
- The requester sees only their records and can submit or cancel their draft/submitted records.
- Managers and administrators see the approval queue but cannot decide their own requests.
- Only `draft → submitted → approved|rejected` and `draft|submitted → cancelled` transitions are allowed.
- Creation and transitions require UUID idempotency keys, survive retries, and use database row locks.
- Every state change creates an immutable `procurement_events` row with actor, role, request ID, timestamp, prior state, next state, and optional note.
- A disabled user or incremented `auth_version` loses access even when a previously issued session cookie has not expired.

## Local setup

Requirements: Node.js 20.19 LTS or 22.12/newer and PostgreSQL 14 or newer.

1. Copy `.env.example` to `.env`. Set a dedicated `DATABASE_URL`, a randomly generated `JWT_SECRET` of at least 32 characters, and exact `CORS_ORIGINS`. Never commit `.env`.
2. Install reproducibly with `npm ci --ignore-scripts` in both `backend/` and `frontend/`.
3. From `backend/`, run `npm run check:config`, then `npm run migrate`.
4. Provision the first administrator once by exporting `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_NAME`, and a unique `BOOTSTRAP_ADMIN_PASSWORD` of at least 14 characters, then run `npm run bootstrap:admin`. Do not place the bootstrap password in shell history or a tracked file.
5. Provision later accounts through the operator-only `npm run provision:user` command with exported `PROVISION_EMAIL`, `PROVISION_NAME`, `PROVISION_PASSWORD`, `PROVISION_ROLE`, and optional `PROVISION_DEPARTMENT`. The command validates roles and hashes passwords with bcrypt cost 12. Avoid shell history and tracked files for passwords.
6. Run `./start.sh`. It validates configuration, dependencies, ports, and database readiness. It never installs packages, starts PostgreSQL, runs migrations/seeds, or terminates unrelated processes.

The UI is at `http://127.0.0.1:3000`; the API is at `http://127.0.0.1:3001`. Sessions are short-lived, HTTP-only, SameSite=Strict cookies. Production cookies additionally require HTTPS.

Only the root `.env` is loaded. A legacy `backend/.env` file, if present locally, is ignored by the application; reconcile and remove duplicate local files through your secret-management process rather than relying on them.

## Verification

Run:

```sh
ALLOW_TEST_DATABASE_RESET=1 npm --prefix backend test
npm --prefix frontend test
npm --prefix frontend run build
npm --prefix backend audit --audit-level=high
npm --prefix frontend audit --audit-level=high
```

Backend integration tests require a disposable migrated PostgreSQL database identified by `DATABASE_URL`; they truncate the retained workflow tables. Never point tests at shared or production data.

## Migrations and deployment

`backend/migrations/run.js` applies ordered SQL migrations under an advisory lock, stores SHA-256 checksums, and refuses changed migrations. Run it as an explicit release step before starting a new application version. Application startup is read-only and fails closed when the schema is missing.

The root `Dockerfile` builds the bounded UI and API as a non-root container. The image does not run migrations automatically. Supply runtime secrets through the deployment platform, run `node migrations/run.js` as a one-off release command, then deploy the application container. Set `BACKEND_HOST=0.0.0.0` and `ALLOW_PUBLIC_BIND=true` only inside an explicitly isolated container/network.

## Operations

- Liveness: `GET /api/health/live`; readiness: `GET /api/health/ready`.
- Responses include `X-Request-Id`. Structured completion/error logs include request ID, method, path, status, and duration; request bodies and credentials are never logged.
- Alert on sustained readiness failures, HTTP 5xx responses, authentication throttling, migration failure, and database capacity/replication alarms.
- Back up with the platform's encrypted PostgreSQL snapshot plus regular logical `pg_dump` exports. Define retention and off-site storage before launch.
- Test restore into an isolated database at least quarterly, run migrations/readiness, compare retained table counts and event history, and record recovery time and recovery point.
- Before deploy, take/verify a backup, run CI and migrations, deploy, check readiness, and perform a requester/manager smoke flow. Roll back application code only when schema remains compatible; restore data only under an approved incident procedure.

See [SECURITY.md](SECURITY.md) and [docs/PROCUREMENT_WORKFLOW.md](docs/PROCUREMENT_WORKFLOW.md).
