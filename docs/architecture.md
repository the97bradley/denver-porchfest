# Denver PorchFest Website Architecture

This is a practical system overview of the current PorchFest platform.

## 1) High-Level Stack

- **Frontend + API host:** Next.js on Vercel
- **Database:** Supabase (Postgres)
- **Ticket source:** Eventbrite
- **Inbound integration:** Eventbrite webhooks + API pulls
- **Access model:** token link + access code gate

## 2) System Diagram (logical)

1. Attendee buys ticket on Eventbrite.
2. Eventbrite sends webhook to:
   - `POST /api/eventbrite/webhook`
3. Backend fetches order/attendees from Eventbrite API.
4. Backend upserts attendee rows into Supabase, generates:
   - unique `tokenUrl`
   - unique `accessCode`
5. User enters via:
   - `/go/:token` or
   - `/api/access/redeem` code flow
6. Invalid/unpaid path redirects to Eventbrite purchase URL.

## 3) Data Model

Primary table: `public.attendees`

Key fields:
- identity: `firstName`, `lastName`, `email`
- eventbrite refs: `eventbriteAttendeeId`, `eventbriteOrderId`
- access: `tokenUrl`, `accessCode`, `status`
- ops: `created_at`, `updated_at`, `lastAccessedAt`

Operational tables:
- `public.webhook_events` (delivery + processing status)
- `public.webhook_dead_letters` (failed sync rows and exceptions)

## 4) API Surface

Public-ish routes:
- `POST /api/eventbrite/webhook` (secret protected)
- `GET /go/:token`
- `POST /api/access/redeem`

Admin routes (secret protected):
- `POST /api/admin/resync-order`
- `POST /api/admin/backfill`

Detailed request/response docs:
- `docs/backend-api.md`

## 5) Security Model

- Webhook auth by secret (header or query secret)
- Admin endpoints protected by `ADMIN_API_SECRET`
- Supabase service key used server-side only
- No service keys exposed in client bundle

Recommended hardening next:
- Rotate webhook/admin secrets quarterly
- Restrict admin endpoints by IP allowlist (optional)
- Add request signature verification layer if available

## 6) Reliability / Recovery

Implemented:
- Unique constraints on access identifiers
- Retry logic on token/code uniqueness collisions
- Dead-letter capture for failed attendee writes
- Manual resync endpoint by order
- Backfill endpoint for missed webhook deliveries

Recommended next:
- Scheduled cron backfill every 15–30 min
- Alerting on dead-letter inserts
- Dashboard for webhook health metrics

## 7) Website Design System Notes

Brand direction currently in use:
- Primary blue: `#1D4ED8`
- Light backgrounds: `#F8FBFF`, `#EEF6FF`
- Accent orange: `#EA580C`
- Body text: `#1F2937`

UI characteristics:
- Friendly civic/community tone
- Mobile-first sections for lineup and participation
- Clear CTA hierarchy for applications and neighborhood actions

## 8) Environment / Config Contract

Required envs for access pipeline:
- `EVENTBRITE_PRIVATE_TOKEN`
- `EVENTBRITE_WEBHOOK_SECRET`
- `EVENTBRITE_EVENT_URL`
- `EVENTBRITE_EVENT_ID`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_BASE_URL`
- `APP_SUCCESS_URL`
- `ADMIN_API_SECRET`

## 9) Deployment Model

- Vercel hosts Next.js app and API routes
- Supabase hosts Postgres tables
- Eventbrite calls Vercel webhook endpoint

Release checklist:
1. Add/update env vars in Vercel.
2. Run DB schema SQL in Supabase.
3. Deploy Vercel production.
4. Verify webhook receives 200.
5. Run one manual `resync-order` test.

## 10) Near-Term Roadmap

1. Add outbound email sender (Resend/Postmark) for token/code delivery.
2. Add app-auth session exchange (beyond redirect with email hint).
3. Add admin UI page for dead-letter replay and order resync.
4. Add analytics on conversion from ticket purchase -> app access.
