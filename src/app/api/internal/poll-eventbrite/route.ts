import { NextRequest, NextResponse } from "next/server";
import { fetchRecentEventbriteAttendees } from "@/lib/eventbrite";
import { upsertEventbriteAttendee } from "@/lib/attendee-sync";
import { sendAccessEmail } from "@/lib/email";
import { notifyAccessEmailFailure } from "@/lib/email-alerts";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET ?? process.env.INTERNAL_CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.EVENTBRITE_PRIVATE_TOKEN;
  const appBase = process.env.APP_BASE_URL;
  const eventId = process.env.EVENTBRITE_EVENT_ID;
  if (!token || !appBase || !eventId) {
    return NextResponse.json(
      { error: "Missing EVENTBRITE_PRIVATE_TOKEN, APP_BASE_URL, or EVENTBRITE_EVENT_ID" },
      { status: 500 },
    );
  }

  const lookbackMinutes = Math.max(30, Math.min(24 * 60, Number(process.env.EVENTBRITE_POLL_LOOKBACK_MINUTES ?? 180)));
  const changedSince = new Date(Date.now() - lookbackMinutes * 60 * 1000).toISOString();

  const attendees = await fetchRecentEventbriteAttendees(eventId, token, changedSince);
  const supabase = getSupabaseAdmin();

  let processed = 0;
  let ignored = 0;
  let emailed = 0;

  for (const attendee of attendees) {
    const result = await upsertEventbriteAttendee(attendee, appBase);
    if (!result.ok) {
      ignored += 1;
      await supabase.from("webhook_dead_letters").insert({
        source: "eventbrite_poll",
        reference_id: `${attendee.order_id}:${attendee.id}`,
        reason: result.reason,
        payload: attendee,
        error: result.reason === "db_error" ? result.error : null,
      });
      continue;
    }

    processed += 1;
    if (result.status !== "active" || result.alreadyEmailed) {
      ignored += 1;
      continue;
    }

    const emailResult = await sendAccessEmail({
      to: result.email,
      firstName: result.firstName,
      tokenUrl: result.tokenUrl,
      accessCode: result.accessCode,
    });

    if (emailResult.ok) {
      emailed += 1;
      await supabase
        .from("attendees")
        .update({ accessEmailSentAt: new Date().toISOString(), accessEmailError: null })
        .eq("eventbriteAttendeeId", attendee.id);
    } else {
      await supabase
        .from("attendees")
        .update({ accessEmailError: emailResult.error })
        .eq("eventbriteAttendeeId", attendee.id);

      await supabase.from("webhook_dead_letters").insert({
        source: "eventbrite_poll_email",
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
  }

  return NextResponse.json({
    ok: true,
    lookbackMinutes,
    changedSince,
    attendeesFound: attendees.length,
    attendeesProcessed: processed,
    attendeesIgnored: ignored,
    accessEmailsSent: emailed,
  });
}
