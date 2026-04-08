import { NextRequest, NextResponse } from "next/server";
import { fetchRecentEventbriteAttendees } from "@/lib/eventbrite";
import { upsertEventbriteAttendee } from "@/lib/attendee-sync";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function isAdmin(req: NextRequest) {
  const secret = process.env.ADMIN_API_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { hoursBack?: number };
  const hoursBack = Math.max(1, Math.min(24 * 30, Number(body.hoursBack ?? 24)));

  const token = process.env.EVENTBRITE_PRIVATE_TOKEN;
  const appBase = process.env.APP_BASE_URL;
  const eventId = process.env.EVENTBRITE_EVENT_ID;
  if (!token || !appBase || !eventId) {
    return NextResponse.json({ error: "Missing EVENTBRITE_PRIVATE_TOKEN, APP_BASE_URL, or EVENTBRITE_EVENT_ID" }, { status: 500 });
  }

  const changedSince = new Date(Date.now() - hoursBack * 3600 * 1000).toISOString();
  const attendees = await fetchRecentEventbriteAttendees(eventId, token, changedSince);

  const supabase = getSupabaseAdmin();
  let processed = 0;

  for (const attendee of attendees) {
    const result = await upsertEventbriteAttendee(attendee, appBase);
    if (result.ok) processed += 1;
    else {
      await supabase.from("webhook_dead_letters").insert({
        source: "admin_backfill",
        reference_id: `${attendee.order_id}:${attendee.id}`,
        reason: result.reason,
        payload: attendee,
        error: result.reason === "db_error" ? result.error : null,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    hoursBack,
    changedSince,
    attendeesTotal: attendees.length,
    attendeesProcessed: processed,
  });
}
