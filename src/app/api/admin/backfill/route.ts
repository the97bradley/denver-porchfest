import { NextRequest, NextResponse } from "next/server";
import { fetchRecentEventbriteAttendees } from "@/lib/eventbrite";
import { upsertEventbriteAttendee } from "@/lib/attendee-sync";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { sendAccessEmail } from "@/lib/email";
import { notifyAccessEmailFailure } from "@/lib/email-alerts";

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
    if (result.ok) {
      processed += 1;
      if (result.status !== "active" || result.alreadyEmailed) {
        continue;
      }
      const emailResult = await sendAccessEmail({
        to: result.email,
        firstName: result.firstName,
        tokenUrl: result.tokenUrl,
        accessCode: result.accessCode,
      });

      if (emailResult.ok) {
        await supabase
          .from("attendees")
          .update({ accessEmailSentAt: new Date().toISOString(), accessEmailError: null })
          .eq("eventbriteAttendeeId", attendee.id);
      } else {
        await supabase
          .from("attendees")
          .update({ accessEmailError: emailResult.error })
          .eq("eventbriteAttendeeId", attendee.id);

        await supabase.from("pipeline_errors").insert({
          source: "admin_backfill_email",
          reference_id: `${attendee.order_id}:${attendee.id}`,
          reason: "email_send_failed",
          payload: attendee,
          error: emailResult.error,
        });

        await notifyAccessEmailFailure({
          attendeeEmail: result.email,
          attendeeName: attendee.profile?.name ?? result.firstName,
          eventbriteOrderId: attendee.order_id,
          eventbriteAttendeeId: attendee.id,
          reason: emailResult.error,
        });
      }
    } else {
      await supabase.from("pipeline_errors").insert({
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
