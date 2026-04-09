import { NextRequest, NextResponse } from "next/server";
import { fetchEventbriteAttendeesByOrder } from "@/lib/eventbrite";
import { upsertEventbriteAttendee } from "@/lib/attendee-sync";
import { sendAccessEmail } from "@/lib/email";
import { notifyAccessEmailFailure } from "@/lib/email-alerts";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { markRetryJobDone, markRetryJobFailed } from "@/lib/retry-jobs";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET ?? process.env.INTERNAL_CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.EVENTBRITE_PRIVATE_TOKEN;
  const appBase = process.env.APP_BASE_URL;
  if (!token || !appBase) return NextResponse.json({ error: "Missing env" }, { status: 500 });

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { data: jobs } = await supabase
    .from("retry_jobs")
    .select("id,payload")
    .eq("status", "pending")
    .lte("run_at", now)
    .order("run_at", { ascending: true })
    .limit(20);

  let processed = 0;
  for (const job of jobs ?? []) {
    try {
      const orderId = (job.payload as { orderId?: string })?.orderId;
      if (!orderId) {
        await markRetryJobFailed(job.id, "missing_order_id");
        continue;
      }

      const attendees = await fetchEventbriteAttendeesByOrder(orderId, token);
      for (const attendee of attendees) {
        const result = await upsertEventbriteAttendee(attendee, appBase);
        if (!result.ok || result.status !== "active" || result.alreadyEmailed) continue;

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
          await notifyAccessEmailFailure({
            attendeeEmail: result.email,
            attendeeName: attendee.profile?.name ?? result.firstName,
            eventbriteOrderId: attendee.order_id,
            eventbriteAttendeeId: attendee.id,
            reason: emailResult.error,
          });
        }
      }

      await markRetryJobDone(job.id);
      processed += 1;
    } catch (err) {
      await markRetryJobFailed(job.id, err);
    }
  }

  return NextResponse.json({ ok: true, jobsProcessed: processed, jobsFound: jobs?.length ?? 0 });
}
