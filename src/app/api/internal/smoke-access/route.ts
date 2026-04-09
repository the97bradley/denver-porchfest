import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = process.env.EVENTBRITE_PRIVATE_TOKEN;
  const eventId = process.env.EVENTBRITE_EVENT_ID;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const env = {
    eventbriteTokenConfigured: Boolean(token),
    eventbriteEventIdConfigured: Boolean(eventId),
    supabaseUrlConfigured: Boolean(supabaseUrl),
    supabaseServiceRoleConfigured: Boolean(supabaseKey),
  };

  try {
    const supabase = getSupabaseAdmin();

    const [{ count: attendeeCount, error: dbError }, eventbriteRes] = await Promise.all([
      supabase.from("attendees").select("id", { count: "exact", head: true }),
      token && eventId
        ? fetch(`https://www.eventbriteapi.com/v3/events/${eventId}/`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          })
        : Promise.resolve(null),
    ]);

    const dbOk = !dbError;
    const eventbriteOk = Boolean(eventbriteRes && eventbriteRes.ok);

    const ok = dbOk && eventbriteOk && Object.values(env).every(Boolean);

    const response = NextResponse.json(
      {
        ok,
        checks: {
          ...env,
          dbOk,
          eventbriteOk,
          attendeeCount: attendeeCount ?? 0,
        },
        timestamp: new Date().toISOString(),
      },
      { status: ok ? 200 : 503 },
    );

    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    const response = NextResponse.json(
      {
        ok: false,
        checks: env,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
    response.headers.set("Cache-Control", "no-store");
    return response;
  }
}
