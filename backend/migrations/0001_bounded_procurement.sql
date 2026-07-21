CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  department VARCHAR(100) NOT NULL DEFAULT 'General',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  auth_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_version INTEGER NOT NULL DEFAULT 1;
UPDATE users SET role = 'user' WHERE role IS NULL OR role NOT IN ('user', 'manager', 'admin');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'users'::regclass AND conname = 'users_role_allowed'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_role_allowed
      CHECK (role IN ('user', 'manager', 'admin')) NOT VALID;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'users'::regclass AND conname = 'users_auth_version_positive'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_auth_version_positive
      CHECK (auth_version > 0) NOT VALID;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS procurement_orders (
  id BIGSERIAL PRIMARY KEY,
  po_number VARCHAR(50) UNIQUE NOT NULL,
  supplier_name VARCHAR(255) NOT NULL,
  supplier_email VARCHAR(255),
  item_description TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_cost NUMERIC(12,2) NOT NULL,
  total_cost NUMERIC(15,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  delivery_date DATE,
  payment_terms VARCHAR(100),
  created_by VARCHAR(255),
  created_by_user_id BIGINT,
  idempotency_key UUID,
  request_fingerprint CHAR(64),
  version INTEGER NOT NULL DEFAULT 1,
  submitted_at TIMESTAMPTZ,
  decided_at TIMESTAMPTZ,
  decision_note TEXT,
  order_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE procurement_orders ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE procurement_orders ADD COLUMN IF NOT EXISTS created_by_user_id BIGINT;
ALTER TABLE procurement_orders ADD COLUMN IF NOT EXISTS idempotency_key UUID;
ALTER TABLE procurement_orders ADD COLUMN IF NOT EXISTS request_fingerprint CHAR(64);
ALTER TABLE procurement_orders ADD COLUMN IF NOT EXISTS currency CHAR(3) NOT NULL DEFAULT 'USD';
ALTER TABLE procurement_orders ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE procurement_orders ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;
ALTER TABLE procurement_orders ADD COLUMN IF NOT EXISTS decided_at TIMESTAMPTZ;
ALTER TABLE procurement_orders ADD COLUMN IF NOT EXISTS decision_note TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'procurement_orders'::regclass
      AND conname = 'procurement_orders_creator_fk'
  ) THEN
    ALTER TABLE procurement_orders ADD CONSTRAINT procurement_orders_creator_fk
      FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE RESTRICT NOT VALID;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'procurement_orders'::regclass
      AND conname = 'procurement_orders_workflow_status'
  ) THEN
    ALTER TABLE procurement_orders ADD CONSTRAINT procurement_orders_workflow_status
      CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'cancelled')) NOT VALID;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'procurement_orders'::regclass
      AND conname = 'procurement_orders_positive_amounts'
  ) THEN
    ALTER TABLE procurement_orders ADD CONSTRAINT procurement_orders_positive_amounts
      CHECK (quantity > 0 AND unit_cost > 0 AND total_cost = quantity * unit_cost) NOT VALID;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'procurement_orders'::regclass
      AND conname = 'procurement_orders_request_integrity'
  ) THEN
    ALTER TABLE procurement_orders ADD CONSTRAINT procurement_orders_request_integrity
      CHECK (
        currency ~ '^[A-Z]{3}$'
        AND (idempotency_key IS NULL OR request_fingerprint ~ '^[0-9a-f]{64}$')
      ) NOT VALID;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS procurement_orders_creator_idempotency
  ON procurement_orders (created_by_user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS procurement_orders_creator_status
  ON procurement_orders (created_by_user_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS procurement_events (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES procurement_orders(id) ON DELETE RESTRICT,
  event_type VARCHAR(32) NOT NULL,
  from_status VARCHAR(50),
  to_status VARCHAR(50) NOT NULL,
  actor_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  actor_role VARCHAR(50) NOT NULL,
  request_id UUID NOT NULL UNIQUE,
  request_fingerprint CHAR(64) NOT NULL,
  note TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT procurement_events_type_allowed
    CHECK (event_type IN ('created', 'submitted', 'approved', 'rejected', 'cancelled')),
  CONSTRAINT procurement_events_role_allowed
    CHECK (actor_role IN ('user', 'manager', 'admin')),
  CONSTRAINT procurement_events_fingerprint_valid
    CHECK (request_fingerprint ~ '^[0-9a-f]{64}$'),
  CONSTRAINT procurement_events_transition_valid
    CHECK (
      (event_type = 'created' AND from_status IS NULL AND to_status = 'draft')
      OR (event_type = 'submitted' AND from_status = 'draft' AND to_status = 'submitted')
      OR (event_type = 'approved' AND from_status = 'submitted' AND to_status = 'approved')
      OR (event_type = 'rejected' AND from_status = 'submitted' AND to_status = 'rejected')
      OR (event_type = 'cancelled' AND from_status IN ('draft', 'submitted') AND to_status = 'cancelled')
    ),
  CONSTRAINT procurement_events_required_note
    CHECK (event_type NOT IN ('rejected', 'cancelled') OR NULLIF(BTRIM(note), '') IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS procurement_events_order_time
  ON procurement_events (order_id, occurred_at, id);

CREATE OR REPLACE FUNCTION reject_procurement_event_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'procurement_events is append-only' USING ERRCODE = '55000';
END;
$$;

DROP TRIGGER IF EXISTS procurement_events_append_only ON procurement_events;
CREATE TRIGGER procurement_events_append_only
BEFORE UPDATE OR DELETE ON procurement_events
FOR EACH ROW EXECUTE FUNCTION reject_procurement_event_mutation();
