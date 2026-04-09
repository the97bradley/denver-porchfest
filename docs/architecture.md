# Denver PorchFest Website Architecture

Practical overview of the current PorchFest platform (polling-based ingestion, webhook-free).

## 1) High-Level Stack

- **Frontend + API host:** Next.js on Vercel
- **Database:** Supabase (Postgres)
- **Ticket source:** Eventbrite
- **Inbound integration:** Scheduled Eventbrite API polling (`/api/internal/poll-eventbrite`)
- **Email delivery:** Resend API (attendee-specific token/code emails)
- **Access model:** token link + access code + single-device binding

## 2) System Flow

1. Attendee buys ticket on Eventbrite.
2. Vercel cron runs `GET /api/internal/poll-eventbrite` every 10 minutes.
3. Backend fetches changed attendees/orders from Eventbrite API.
4. Backend upserts attendee rows into Supabase and maintains:
   - unique `tokenUrl`
   - unique `accessCode`
5. Refunded/canceled/deleted orders are forced to:
   - `status = revoked`
   - `tokenUrl = null`
   - `accessCode = null`
6. Access emails are sent only to active attendees not already emailed.
7. App users enter via:
   - `/go/:token` or
   - `/api/access/redeem` code flow (device-bound)

## 3) Data Model

Primary table: `public.attendees`

Key fields:
- identity: `firstName`, `lastName`, `email`
- eventbrite refs: `eventbriteAttendeeId`, `eventbriteOrderId`
- access: `tokenUrl`, `accessCode`, `status`
- device binding: `deviceId`, `deviceBoundAt`, `lastSeenAt`
- ops: `accessEmailSentAt`, `accessEmailError`, `created_at`, `updated_at`

Operational tables:
- `public.retry_jobs`
- `public.cron_status`
- `public.job_locks`
- `public.pipeline_errors`

## 4) API Surface

Public/app routes:
- `GET /go/:token`
- `POST /api/access/redeem`
- `GET /api/app/info`
- `GET /api/app/schedule`
- `GET /api/app/lineup`
- `GET /api/app/map`
- `GET /api/app/updates`

Internal routes:
- `GET /api/internal/poll-eventbrite`
- `GET /api/internal/cron-health`
- `GET /api/internal/smoke-access`
- `GET /api/internal/nightly-self-test`

Admin routes (secret protected):
- `POST /api/admin/resync-order`
- `POST /api/admin/backfill`
- `POST /api/admin/resend-access-email`
- `POST /api/admin/reset-device-binding`

Detailed request/response docs:
- `docs/backend-api.md`

## 5) Security Model

- Internal cron endpoints protected by `CRON_SECRET`
- Admin endpoints protected by `ADMIN_API_SECRET`
- Supabase secret/service key used server-side only
- Single-device enforcement on redeem (`deviceId` binding)
- RLS enabled on pipeline tables

## 6) Reliability / Recovery

Implemented:
- Idempotent attendee upsert by Eventbrite attendee ID
- Retry/backoff for Eventbrite fetches
- DB lock (`acquire_job_lock`) to prevent overlapping poll runs
- DB sweep for unsent active attendee emails
- Auto-revocation for refunded/canceled/deleted orders
- Nightly self-test with email alerting on failure
- UptimeRobot monitors for health/cron/smoke

## 7) Environment / Config Contract

Required envs for access pipeline:
- `EVENTBRITE_PRIVATE_TOKEN`
- `EVENTBRITE_EVENT_URL`
- `EVENTBRITE_EVENT_ID`
- `EVENTBRITE_POLL_LOOKBACK_MINUTES`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_BASE_URL`
- `APP_SUCCESS_URL`
- `ADMIN_API_SECRET`
- `CRON_SECRET`
- `RESEND_API_KEY`
- `ACCESS_EMAIL_FROM`
- `ACCESS_ALERT_TO`

## 8) Deployment Model

- Vercel hosts Next.js app and API routes
- Supabase hosts Postgres tables
- Vercel cron drives Eventbrite polling

Release checklist:
1. Add/update env vars in Vercel.
2. Run DB schema SQL in Supabase.
3. Deploy Vercel production.
4. Force one poll run and verify `/api/internal/cron-health`.
5. Confirm `/api/internal/smoke-access` is `ok: true`.
