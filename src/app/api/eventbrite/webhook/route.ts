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
    if (auth !== `Bearer ${webhookSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = (await req.json()) as {
      api_url?: string;
      config?: { id?: string };
      action?: string;
    };

    const orderMatch = payload.api_url?.match(/\/orders\/(\d+)\/?/);
    const orderId = orderMatch?.[1];
    if (!orderId) {
      return NextResponse.json({ error: "No order id in payload.api_url" }, { status: 400 });
    }

    const eventbriteToken = process.env.EVENTBRITE_PRIVATE_TOKEN;
    const appBase = process.env.APP_BASE_URL;
    if (!eventbriteToken || !appBase) {
      return NextResponse.json({ error: "Missing EVENTBRITE_PRIVATE_TOKEN or APP_BASE_URL" }, { status: 500 });
    }

    const supabase = getSupabaseAdmin();

    // idempotency on webhook config+order+action
    const webhookKey = `${payload.config?.id ?? "unknown"}:${payload.action ?? "unknown"}:${orderId}`;
    const { data: existingWebhook } = await supabase
      .from("webhook_events")
      .select("id")
      .eq("eventbrite_webhook_id", webhookKey)
      .maybeSingle();

    if (existingWebhook) {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    const attendees = await fetchEventbriteAttendeesByOrder(orderId, eventbriteToken);

    for (const a of attendees) {
      const email = a.profile?.email?.trim().toLowerCase();
      if (!email) continue;

      const firstName = a.profile?.first_name?.trim() ?? "";
      const lastName = a.profile?.last_name?.trim() ?? "";
      const fullName = `${firstName} ${lastName}`.trim() || a.profile?.name?.trim() || "Attendee";

      const accessCode = generateAccessCode(8);
      const token = generateToken(24);
      await supabase.from("attendees").upsert(
        {
          eventbrite_attendee_id: a.id,
          eventbrite_order_id: a.order_id,
          full_name: fullName,
          email,
          access_code: accessCode,
          access_link_token: token,
          access_link: `${appBase.replace(/\/$/, "")}/go/${token}`,
          status: "active",
        },
        { onConflict: "eventbrite_attendee_id" },
      );

      // TODO: send email (Resend/Postmark/Supabase Auth magic link)
      // For now we only generate/store unique link+code.
    }

    await supabase.from("webhook_events").insert({
      eventbrite_webhook_id: webhookKey,
      event_type: payload.action ?? "unknown",
      payload,
      processed_at: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, attendeesProcessed: attendees.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
