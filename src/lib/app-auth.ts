import { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const ADMIN_CODE = "PORCHFESTADMIN2026";

export async function requireAppAccess(req: NextRequest) {
  const rawAccessCode = (req.headers.get("x-access-code") ?? "").trim();
  const accessCode = rawAccessCode.toUpperCase();
  const deviceId = (req.headers.get("x-device-id") ?? "").trim();

  if (!rawAccessCode || !deviceId) {
    return { ok: false as const, status: 401, error: "Missing access headers" };
  }

  if (accessCode === ADMIN_CODE) {
    return {
      ok: true as const,
      attendee: {
        eventbriteAttendeeId: "admin",
        status: "active",
        deviceId,
        email: "info@denverporchfest.com",
      },
      admin: true,
    };
  }

  const supabase = getSupabaseAdmin();
  const { data: attendee } = await supabase
    .from("attendees")
    .select("eventbriteAttendeeId,status,deviceId,email")
    .eq("accessCode", accessCode)
    .maybeSingle();

  if (!attendee || attendee.status !== "active") {
    return { ok: false as const, status: 401, error: "Invalid access" };
  }

  if (attendee.deviceId && attendee.deviceId !== deviceId) {
    return { ok: false as const, status: 409, error: "Device mismatch" };
  }

  await supabase
    .from("attendees")
    .update({ lastSeenAt: new Date().toISOString() })
    .eq("eventbriteAttendeeId", attendee.eventbriteAttendeeId);

  return { ok: true as const, attendee };
}
