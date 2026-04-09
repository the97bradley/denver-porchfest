import { NextRequest, NextResponse } from "next/server";
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

  const { email, attendeeId } = (await req.json().catch(() => ({}))) as {
    email?: string;
    attendeeId?: string;
  };

  if (!email && !attendeeId) {
    return NextResponse.json({ error: "email or attendeeId required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("attendees")
    .select("eventbriteAttendeeId,email,firstName,tokenUrl,accessCode,status")
    .limit(1);

  if (attendeeId) query = query.eq("eventbriteAttendeeId", attendeeId);
  else query = query.eq("email", String(email).trim().toLowerCase());

  const { data: attendee } = await query.maybeSingle();

  if (!attendee) return NextResponse.json({ error: "Attendee not found" }, { status: 404 });
  if (attendee.status !== "active") {
    return NextResponse.json({ error: "Attendee access is not active" }, { status: 400 });
  }

  const result = await sendAccessEmail({
    to: attendee.email,
    firstName: attendee.firstName,
    tokenUrl: attendee.tokenUrl,
    accessCode: attendee.accessCode,
  });

  if (!result.ok) {
    await supabase
      .from("attendees")
      .update({ accessEmailError: result.error })
      .eq("eventbriteAttendeeId", attendee.eventbriteAttendeeId);

    return NextResponse.json({ error: "Email send failed", details: result.error }, { status: 500 });
  }

  await supabase
    .from("attendees")
    .update({ accessEmailSentAt: new Date().toISOString(), accessEmailError: null })
    .eq("eventbriteAttendeeId", attendee.eventbriteAttendeeId);

  return NextResponse.json({ ok: true, attendeeId: attendee.eventbriteAttendeeId, email: attendee.email });
}
