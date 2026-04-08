import { NextRequest, NextResponse } from "next/server";
import { fetchEventbriteAttendeesByOrder } from "@/lib/eventbrite";
import { upsertEventbriteAttendee } from "@/lib/attendee-sync";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { sendAccessEmail } from "@/lib/email";

function isAdmin(req: NextRequest) {
  const secret = process.env.ADMIN_API_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId } = (await req.json()) as { orderId?: string };
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });

  const token = process.env.EVENTBRITE_PRIVATE_TOKEN;
  const appBase = process.env.APP_BASE_URL;
  if (!token || !appBase) {
    return NextResponse.json({ error: "Missing env configuration" }, { status: 500 });
  }

  const supabase = getSupabaseAdmin();
  const attendees = await fetchEventbriteAttendeesByOrder(orderId, token);
  let processed = 0;

  for (const attendee of attendees) {
    const result = await upsertEventbriteAttendee(attendee, appBase);
    if (result.ok) {
      processed += 1;
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

        await supabase.from("webhook_dead_letters").insert({
          source: "admin_resync_order_email",
          reference_id: `${orderId}:${attendee.id}`,
          reason: "email_send_failed",
          payload: attendee,
          error: emailResult.error,
        });
      }
    } else {
      await supabase.from("webhook_dead_letters").insert({
        source: "admin_resync_order",
        reference_id: `${orderId}:${attendee.id}`,
        reason: result.reason,
        payload: attendee,
        error: result.reason === "db_error" ? result.error : null,
      });
    }
  }

  return NextResponse.json({ ok: true, orderId, attendeesTotal: attendees.length, attendeesProcessed: processed });
}
