import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const ADMIN_CODE = "porchfestadmin2026";

export async function POST(req: NextRequest) {
  const { code, deviceId } = (await req.json()) as { code?: string; deviceId?: string };
  if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });
  if (!deviceId || deviceId.trim().length < 8) {
    return NextResponse.json({ error: "Valid deviceId required" }, { status: 400 });
  }

  const normalized = code.trim().toUpperCase();
  const normalizedDeviceId = deviceId.trim();

  if (code.trim() === ADMIN_CODE) {
    const appBase = process.env.APP_BASE_URL?.replace(/\/$/, "") ?? "https://www.denverporchfest.com";
    return NextResponse.json({ ok: true, accessLink: `${appBase}/app`, deviceBound: true, admin: true });
  }

  const supabase = getSupabaseAdmin();

  const { data: attendee } = await supabase
    .from("attendees")
    .select("eventbriteAttendeeId,tokenUrl,status,deviceId")
    .eq("accessCode", normalized)
    .maybeSingle();

  if (!attendee || attendee.status !== "active") {
    return NextResponse.json({ error: "Invalid code" }, { status: 404 });
  }

  if (attendee.deviceId && attendee.deviceId !== normalizedDeviceId) {
    return NextResponse.json(
      { error: "Access already activated on another device" },
      { status: 409 },
    );
  }

  const nowIso = new Date().toISOString();

  const updatePayload: { deviceId: string; deviceBoundAt?: string; lastSeenAt: string } = {
    deviceId: normalizedDeviceId,
    lastSeenAt: nowIso,
  };
  if (!attendee.deviceId) updatePayload.deviceBoundAt = nowIso;

  await supabase
    .from("attendees")
    .update(updatePayload)
    .eq("eventbriteAttendeeId", attendee.eventbriteAttendeeId);

  return NextResponse.json({ ok: true, accessLink: attendee.tokenUrl, deviceBound: true });
}
