import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function isAdmin(req: NextRequest) {
  const secret = process.env.ADMIN_API_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { attendeeId?: string; email?: string; accessCode?: string };
  const supabase = getSupabaseAdmin();

  let query = supabase.from("attendees").update({ deviceId: null, deviceBoundAt: null, lastSeenAt: null });

  if (body.attendeeId) {
    query = query.eq("eventbriteAttendeeId", body.attendeeId);
  } else if (body.email) {
    query = query.eq("email", body.email.trim().toLowerCase());
  } else if (body.accessCode) {
    query = query.eq("accessCode", body.accessCode.trim().toUpperCase());
  } else {
    return NextResponse.json({ error: "attendeeId, email, or accessCode required" }, { status: 400 });
  }

  const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
