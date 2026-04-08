import { NextRequest, NextResponse } from "next/server";
import { fetchEventbriteAttendeesByOrder } from "@/lib/eventbrite";
import { generateAccessCode, generateToken } from "@/lib/access";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.EVENTBRITE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ error: "Missing EVENTBRITE_WEBHOOK_SECRET" }, { status: 500 });
    }

    const auth = req.headers.get("authorization") ?? "";
    const querySecret = req.nextUrl.searchParams.get("secret") ?? "";
    const headerOk = auth === `Bearer ${webhookSecret}`;
    const queryOk = querySecret === webhookSecret;

    if (!headerOk && !queryOk) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = (await req.json()) as {
      api_url?: string;
      action?: string;
    };

    const orderMatch = payload.api_url?.match(/\/orders\/([^/]+)\/?/);
    const orderId = orderMatch?.[1];
    if (!orderId) {
      return NextResponse.json({ error: "No order id in payload.api_url" }, { status: 400 });
    }

    const eventbriteToken = process.env.EVENTBRITE_PRIVATE_TOKEN;
    const appBase = process.env.APP_BASE_URL;
    if (!eventbriteToken || !appBase) {
      return NextResponse.json(
        { error: "Missing EVENTBRITE_PRIVATE_TOKEN or APP_BASE_URL" },
        { status: 500 },
      );
    }

    const supabase = getSupabaseAdmin();
    const attendees = await fetchEventbriteAttendeesByOrder(orderId, eventbriteToken);

    for (const a of attendees) {
      const email = a.profile?.email?.trim().toLowerCase();
      if (!email) continue;

      const firstName = a.profile?.first_name?.trim() ?? "";
      const lastName = a.profile?.last_name?.trim() ?? "";

      const { data: existing } = await supabase
        .from("attendees")
        .select("tokenUrl,accessCode")
        .eq('eventbriteAttendeeId', a.id)
        .maybeSingle();

      const base = appBase.replace(/\/$/, "");
      const maxAttempts = 5;
      let wrote = false;
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
            eventbriteAttendeeId: a.id,
            eventbriteOrderId: a.order_id,
            status: "active",
          },
          { onConflict: "eventbriteAttendeeId" },
        );

        if (!error) {
          wrote = true;
          break;
        }

        lastError = error;
        const code = (error as { code?: string }).code;
        const details = `${(error as { message?: string }).message ?? ""} ${(error as { details?: string }).details ?? ""}`;
        const isUniqueViolation = code === "23505" || /duplicate key|unique/i.test(details);

        // Retry only for generated value collisions on new rows.
        if (!isUniqueViolation || existing) {
          break;
        }
      }

      if (!wrote) {
        console.error("Failed to upsert attendee", { attendeeId: a.id, lastError });
        return NextResponse.json({ error: "Failed to write attendee row" }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true, action: payload.action ?? null, attendeesProcessed: attendees.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
