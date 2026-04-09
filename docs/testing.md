# Testing Guide

This project uses **Vitest** for integration-style tests of the Eventbrite → Supabase → email access pipeline.

> All tests are stubbed/mocked for external side effects.
> - No real Eventbrite API calls
> - No real email sends
> - No real alert emails

## Run tests

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

## Test stack

- **Vitest** (`vitest`)
- Node test environment
- Module-level mocks for:
  - `@/lib/eventbrite`
  - `@/lib/attendee-sync`
  - `@/lib/email`
  - `@/lib/email-alerts`
  - `@/lib/supabase-admin`

## Current integration scenarios

Implemented in:

- `tests/poll-eventbrite.integration.test.ts`

Covered scenarios:

1. **Single-attendee order**
   - Poll returns one attendee
   - Attendee is processed
   - Access email send is attempted

2. **Multi-attendee order**
   - Poll returns multiple attendees on one order
   - All attendees are processed
   - Access email send is attempted for each

3. **Refunded order**
   - Order status resolves to `refunded`
   - Attendee is marked `revoked`
   - `tokenUrl` and `accessCode` are cleared (`null`)
   - No access email is sent

4. **DB sweep catches unsent attendee**
   - Attendee row exists with:
     - `status = active`
     - `accessEmailSentAt IS NULL`
   - Poll cron DB sweep attempts email and marks as sent on success

5. **DB sweep ignores revoked attendee**
   - Pending row exists, but order status resolves revoked
   - Row is set revoked/cleared
   - No email send

6. **Already emailed attendee is not re-emailed**
   - Upsert result indicates already emailed
   - Poll ignores send path

7. **Email delivery failure path**
   - Email send returns failure
   - `accessEmailError` is updated
   - Dead-letter insert is recorded
   - Failure notifier is invoked (alerts route)

8. **Unauthorized cron request**
   - Missing/invalid bearer token
   - Endpoint returns `401`

## Notes on alert routing

Failure alert code lives in:

- `src/lib/email-alerts.ts`

It targets:

- `ACCESS_ALERT_TO` (if set), otherwise
- `info@denverporchfest.com`

In tests, alert sending is stubbed; we assert invocation and payload only.

## Recommended next additions

- Late attendee assignment on same order across two poll runs (idempotent catch-up)
- Duplicate poll payload replay (no duplicate sends)
- Eventbrite order fetch failure/timeout handling for one order among many
- Unit tests for `upsertEventbriteAttendee` uniqueness collision retry behavior
- Unit tests for token/code revocation transitions
