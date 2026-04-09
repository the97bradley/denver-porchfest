import { NextRequest, NextResponse } from "next/server";
import { fetchEventbriteOrder, fetchRecentEventbriteAttendees } from "@/lib/eventbrite";
import { upsertEventbriteAttendee } from "@/lib/attendee-sync";
import { sendAccessEmail } from "@/lib/email";
import { notifyAccessEmailFailure } from "@/lib/email-alerts";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const JOB_NAME = "eventbrite_poll";

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

  const supabase = getSupabaseAdmin();
  const runStartedAt = new Date().toISOString();

  await supabase.from("cron_status").upsert(
    {
      job_name: JOB_NAME,
      last_started_at: runStartedAt,
      last_status: "running",
      last_error: null,
    },
    { onConflict: "job_name" },
  );

  try {
    const lookbackMinutes = Math.max(30, Math.min(24 * 60, Number(process.env.EVENTBRITE_POLL_LOOKBACK_MINUTES ?? 180)));
    const changedSince = new Date(Date.now() - lookbackMinutes * 60 * 1000).toISOString();

    const attendees = await fetchRecentEventbriteAttendees(eventId, token, changedSince);
    const revokedOrderStatuses = new Set(["refunded", "canceled", "cancelled", "deleted"]);
    const orderStatusCache = new Map<string, string>();

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

      let orderStatus = orderStatusCache.get(attendee.order_id);
      if (!orderStatus) {
        const order = await fetchEventbriteOrder(attendee.order_id, token);
        orderStatus = String(order.status ?? "").toLowerCase();
        orderStatusCache.set(attendee.order_id, orderStatus);
      }

      const orderRevoked = revokedOrderStatuses.has(orderStatus);
      if (orderRevoked) {
        await supabase
          .from("attendees")
          .update({ status: "revoked", tokenUrl: null, accessCode: null })
          .eq("eventbriteAttendeeId", attendee.id);
        ignored += 1;
        continue;
      }

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

    const { data: pendingEmailRows } = await supabase
      .from("attendees")
      .select("eventbriteAttendeeId,eventbriteOrderId,email,firstName,tokenUrl,accessCode")
      .eq("status", "active")
      .is("accessEmailSentAt", null)
      .limit(500);

    let dbSweepFound = 0;
    let dbSweepEmailed = 0;

    for (const row of pendingEmailRows ?? []) {
      dbSweepFound += 1;

      let orderStatus = orderStatusCache.get(row.eventbriteOrderId);
      if (!orderStatus) {
        const order = await fetchEventbriteOrder(row.eventbriteOrderId, token);
        orderStatus = String(order.status ?? "").toLowerCase();
        orderStatusCache.set(row.eventbriteOrderId, orderStatus);
      }

      if (revokedOrderStatuses.has(orderStatus)) {
        await supabase
          .from("attendees")
          .update({ status: "revoked", tokenUrl: null, accessCode: null })
          .eq("eventbriteAttendeeId", row.eventbriteAttendeeId);
        continue;
      }

      const emailResult = await sendAccessEmail({
        to: row.email,
        firstName: row.firstName ?? "",
        tokenUrl: row.tokenUrl,
        accessCode: row.accessCode,
      });

      if (emailResult.ok) {
        dbSweepEmailed += 1;
        await supabase
          .from("attendees")
          .update({ accessEmailSentAt: new Date().toISOString(), accessEmailError: null })
          .eq("eventbriteAttendeeId", row.eventbriteAttendeeId);
      } else {
        await supabase
          .from("attendees")
          .update({ accessEmailError: emailResult.error })
          .eq("eventbriteAttendeeId", row.eventbriteAttendeeId);

        await supabase.from("webhook_dead_letters").insert({
          source: "eventbrite_poll_db_sweep_email",
          reference_id: `${row.eventbriteOrderId}:${row.eventbriteAttendeeId}`,
          reason: "email_send_failed",
          payload: row,
          error: emailResult.error,
        });

        await notifyAccessEmailFailure({
          attendeeEmail: row.email,
          attendeeName: row.firstName ?? row.email,
          eventbriteOrderId: row.eventbriteOrderId,
          eventbriteAttendeeId: row.eventbriteAttendeeId,
          reason: emailResult.error,
        });
      }
    }

    const lastFinishedAt = new Date().toISOString();
    await supabase.from("cron_status").upsert(
      {
        job_name: JOB_NAME,
        last_started_at: runStartedAt,
        last_finished_at: lastFinishedAt,
        last_status: "ok",
        last_error: null,
        attendees_found: attendees.length,
        attendees_processed: processed,
        attendees_ignored: ignored,
        emails_sent: emailed,
        db_sweep_found: dbSweepFound,
        db_sweep_emailed: dbSweepEmailed,
      },
      { onConflict: "job_name" },
    );

    return NextResponse.json({
      ok: true,
      lookbackMinutes,
      changedSince,
      attendeesFound: attendees.length,
      attendeesProcessed: processed,
      attendeesIgnored: ignored,
      accessEmailsSent: emailed,
      dbSweepFound,
      dbSweepEmailed,
    });
  } catch (error) {
    await supabase.from("cron_status").upsert(
      {
        job_name: JOB_NAME,
        last_started_at: runStartedAt,
        last_finished_at: new Date().toISOString(),
        last_status: "error",
        last_error: error instanceof Error ? error.message : String(error),
      },
      { onConflict: "job_name" },
    );

    throw error;
  }
}
