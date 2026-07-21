# Procurement workflow contract

## Roles

- `user`: requester; lists only orders whose `created_by_user_id` matches their current user ID.
- `manager`: decision maker; lists all orders but cannot approve/reject an order they created.
- `admin`: emergency/operator decision role; has the same separation-of-duties restriction and does not bypass the state machine.

Legacy records without a user-ID owner are visible only to managers/admins and cannot be transitioned through the bounded API. Reconcile them explicitly before use; the migration does not guess identity from display names.

## State machine

```text
draft ──submit──> submitted ──approve──> approved
  │                    ├──────reject───> rejected
  └────cancel──────────┴──────cancel───> cancelled
```

Direct `PUT`, `PATCH`, and `DELETE` mutations are rejected. Rejections and cancellations require a note. All creation/transition calls require a UUID `Idempotency-Key`; successful retries with the same actor/order/action return the resulting order without a second event. Reusing a creation key with a different validated payload returns a conflict.

The web client retains an operation key after an uncertain network failure and reuses it for a same-payload retry. A received HTTP response clears the pending key; changing the payload generates a different operation identity. Pending keys are intentionally memory-only and do not survive a page reload.

## Audit and concurrency

The API takes a row lock before each transition and checks both current persistent status and actor identity. `procurement_events` has foreign keys to actor and order, a globally unique request ID, and a trigger that rejects update/delete. The application never accepts caller-provided status, total cost, creator identity, actor role, or PO number.

## Known retained limits

- Single organization only; no tenant model.
- USD is the UI default, while the API accepts validated three-letter currency codes. No exchange-rate conversion exists.
- Account lifecycle beyond first-admin bootstrap remains operator-controlled.
- Email notifications, budget reservation, vendor master integration, accounting posting, attachment handling, and external AI/integration features are not implemented.
- The historical 42-module demo data and generated screens are outside the runtime boundary.
