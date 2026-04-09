# Backend API Documentation

This document describes the PorchFest backend endpoints currently implemented in the Next.js app.

Base URL (production):

- `https://denverporchfest.com`

All endpoints return JSON unless noted.

---

## 1) Eventbrite Webhook

### `POST /api/eventbrite/webhook`

Receives Eventbrite webhook events and syncs order attendees into Supabase.

### Auth

One of the following must match `EVENTBRITE_WEBHOOK_SECRET`:

- Header: `Authorization: Bearer <secret>`
- Query param: `?secret=<secret>`

### Request body (from Eventbrite)

Typical payload fields used:

```json
{
  "api_url": "https://www.eventbriteapi.com/v3/orders/1234567890/",
  "action": "order.placed",
  "config": { "id": "15771420" }
}
```

### Behavior

1. Validates webhook auth.
2. Extracts `orderId` from `api_url`.
3. Pulls order + attendees from Eventbrite API.
4. For each attendee, upserts into `public.attendees`:
   - `firstName`, `lastName`, `email`
   - `eventbriteAttendeeId`, `eventbriteOrderId`
   - `tokenUrl`, `accessCode`, `status`
5. Sends attendee-specific access email (token link + code) via Resend.
6. Logs webhook processing status in `public.webhook_events`.
7. Writes failed attendee sync/email records to `public.webhook_dead_letters`.

### Success response

```json
{
  "ok": true,
  "attendeesProcessed": 10,
  "attendeesTotal": 10
}
```

### Error response examples

```json
{ "error": "Unauthorized" }
```

```json
{ "error": "No order id in payload.api_url" }
```

```json
{ "error": "Webhook processing failed" }
```

---

## 2) Token Access Redirect

### `GET /go/:token`

Resolves a tokenized attendee link.

### Behavior

- Looks up attendee by `tokenUrl = APP_BASE_URL + /go/:token`
- If attendee exists and `status = active`: redirects to `APP_SUCCESS_URL` with `?email=`
- Otherwise redirects to `EVENTBRITE_EVENT_URL`

### Notes

- This is currently a redirect gate; full auth session minting can be added later.

---

## 3) Manual Access Code Redeem

### `POST /api/access/redeem`

Validate an access code and return access link.

### Request

```json
{ "code": "ABC12345" }
```

### Success

```json
{ "ok": true, "accessLink": "https://denverporchfest.com/go/...." }
```

### Failure

```json
{ "error": "Invalid code" }
```

---

## 4) Admin: Resync One Order

### `POST /api/admin/resync-order`

Manually resync all attendees from one Eventbrite order.

### Auth

- Header: `Authorization: Bearer <ADMIN_API_SECRET>`

### Request

```json
{ "orderId": "1234567890" }
```

### Success

```json
{
  "ok": true,
  "orderId": "1234567890",
  "attendeesTotal": 3,
  "attendeesProcessed": 3
}
```

---

## 5) Admin: Backfill Recent Attendees

### `POST /api/admin/backfill`

Pull attendees changed recently from Eventbrite and upsert missing/updated rows.

### Auth

- Header: `Authorization: Bearer <ADMIN_API_SECRET>`

### Request (optional)

```json
{ "hoursBack": 72 }
```

Default is `24`.

### Success

```json
{
  "ok": true,
  "hoursBack": 72,
  "changedSince": "2026-04-05T20:00:00.000Z",
  "attendeesTotal": 87,
  "attendeesProcessed": 86
}
```

---

## 6) Admin: Resend Access Email

### `POST /api/admin/resend-access-email`

Resend the attendee access email manually.

### Auth

- Header: `Authorization: Bearer <ADMIN_API_SECRET>`

### Request

Provide one of:

```json
{ "attendeeId": "123456789" }
```

or

```json
{ "email": "person@example.com" }
```

### Success

```json
{ "ok": true, "attendeeId": "123456789", "email": "person@example.com" }
```

---

## 7) Internal: Poll Eventbrite (Cron)

### `GET /api/internal/poll-eventbrite`

Primary scheduled ingestion endpoint (runs every 10 minutes in Vercel cron).

### Auth

- Header: `Authorization: Bearer <CRON_SECRET>`

### Behavior

1. Pulls attendees changed within lookback window (`EVENTBRITE_POLL_LOOKBACK_MINUTES`, default 180).
2. Upserts attendees from Eventbrite into `public.attendees`.
3. Checks **order status** and force-revokes rows for refunded/canceled/deleted orders:
   - `status = revoked`
   - `tokenUrl = null`
   - `accessCode = null`
4. Sends access emails only for active attendees not already emailed.
5. Performs DB sweep for active rows missing `accessEmailSentAt` and attempts send.
6. Records run summary in `public.cron_status` for monitoring.

### Success response

```json
{
  "ok": true,
  "lookbackMinutes": 180,
  "changedSince": "2026-04-09T00:00:00.000Z",
  "attendeesFound": 12,
  "attendeesProcessed": 12,
  "attendeesIgnored": 4,
  "accessEmailsSent": 8,
  "dbSweepFound": 2,
  "dbSweepEmailed": 1
}
```

---

## 8) Internal: Cron Health (UptimeRobot target)

### `GET /api/internal/cron-health`

Read-only health/status snapshot for polling pipeline.

### Behavior

- Returns latest run status from `public.cron_status` (`eventbrite_poll`)
- Returns pending unsent active attendee count
- Returns dead-letter count in last 24h
- Marks response stale if last finished run is older than threshold

### Status code

- `200` when fresh
- `503` when stale (for alerting)

---

## Environment Variables

Required for full pipeline:

- `EVENTBRITE_PRIVATE_TOKEN`
- `EVENTBRITE_WEBHOOK_SECRET`
- `EVENTBRITE_EVENT_URL`
- `EVENTBRITE_EVENT_ID`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_BASE_URL`
- `APP_SUCCESS_URL`
- `ADMIN_API_SECRET`
- `CRON_SECRET`
- `RESEND_API_KEY`
- `ACCESS_EMAIL_FROM`
- `ACCESS_ALERT_TO` (alert recipient for failed attendee emails)
- `EVENTBRITE_POLL_LOOKBACK_MINUTES` (optional; default `180`)

---

## cURL Examples

### Test redeem code

```bash
curl -X POST https://denverporchfest.com/api/access/redeem \
  -H 'Content-Type: application/json' \
  -d '{"code":"ABC12345"}'
```

### Admin resync order

```bash
curl -X POST https://denverporchfest.com/api/admin/resync-order \
  -H 'Authorization: Bearer <ADMIN_API_SECRET>' \
  -H 'Content-Type: application/json' \
  -d '{"orderId":"1234567890"}'
```

### Admin backfill 72 hours

```bash
curl -X POST https://denverporchfest.com/api/admin/backfill \
  -H 'Authorization: Bearer <ADMIN_API_SECRET>' \
  -H 'Content-Type: application/json' \
  -d '{"hoursBack":72}'
```
