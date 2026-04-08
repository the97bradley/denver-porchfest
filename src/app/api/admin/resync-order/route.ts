import { NextRequest, NextResponse } from "next/server";
import { fetchEventbriteAttendeesByOrder } from "@/lib/eventbrite";
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
    if (result.ok) processed += 1;
    else {
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
