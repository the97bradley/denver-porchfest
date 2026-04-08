import { generateAccessCode, generateToken } from "@/lib/access";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { EventbriteAttendee } from "@/lib/eventbrite";

export async function upsertEventbriteAttendee(attendee: EventbriteAttendee, appBaseUrl: string) {
  const supabase = getSupabaseAdmin();

  const email = attendee.profile?.email?.trim().toLowerCase();
  if (!email) {
    return { ok: false as const, reason: "missing_email" };
  }

  const firstName = attendee.profile?.first_name?.trim() ?? "";
  const lastName = attendee.profile?.last_name?.trim() ?? "";
  const base = appBaseUrl.replace(/\/$/, "");
  const attendeeStatus = (attendee.status ?? "").toLowerCase();
  const status = attendeeStatus.includes("refund") || attendeeStatus.includes("cancel") ? "revoked" : "active";

  const { data: existing } = await supabase
    .from("attendees")
    .select("tokenUrl,accessCode,accessEmailSentAt")
    .eq("eventbriteAttendeeId", attendee.id)
    .maybeSingle();

  const maxAttempts = 5;
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const token = existing?.tokenUrl?.split("/go/")[1] ?? generateToken(24);
    const tokenUrl = `${base}/go/${token}`;
    const accessCode = existing?.accessCode ?? generateAccessCode(8);

    const { error } = await supabase.from("attendees").upsert(
      {
        firstName,
        lastName,
        email,
        tokenUrl,
        accessCode,
        eventbriteAttendeeId: attendee.id,
        eventbriteOrderId: attendee.order_id,
        status,
      },
      { onConflict: "eventbriteAttendeeId" },
    );

    if (!error) {
      return {
        ok: true as const,
        attendeeId: attendee.id,
        email,
        firstName,
        tokenUrl,
        accessCode,
        status,
        alreadyEmailed: Boolean(existing?.accessEmailSentAt),
      };
    }

    lastError = error;
    const code = (error as { code?: string }).code;
    const details = `${(error as { message?: string }).message ?? ""} ${(error as { details?: string }).details ?? ""}`;
    const isUniqueViolation = code === "23505" || /duplicate key|unique/i.test(details);

    if (!isUniqueViolation || existing) {
      break;
    }
  }

  return { ok: false as const, reason: "db_error", error: lastError };
}
