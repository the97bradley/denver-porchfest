import { NextRequest, NextResponse } from "next/server";
import { fetchEventbriteAttendeesByOrder, fetchEventbriteOrder } from "@/lib/eventbrite";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { upsertEventbriteAttendee } from "@/lib/attendee-sync";
import { sendAccessEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  let payload: unknown = null;

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

    payload = (await req.json()) as {
      api_url?: string;
      action?: string;
      config?: { id?: string };
    };

    const typedPayload = payload as { api_url?: string; action?: string; config?: { id?: string } };

    const orderMatch = typedPayload.api_url?.match(/\/orders\/([^/]+)\/?/);
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

    const webhookKey = `${typedPayload.config?.id ?? "unknown"}:${typedPayload.action ?? "unknown"}:${orderId}`;
    await supabase.from("webhook_events").upsert(
      {
        eventbrite_webhook_id: webhookKey,
        event_type: typedPayload.action ?? "unknown",
        payload: typedPayload,
        status: "received",
        processed_at: null,
      },
      { onConflict: "eventbrite_webhook_id" },
    );

    const order = await fetchEventbriteOrder(orderId, eventbriteToken);
    if (order.status && !["placed", "completed"].includes(order.status.toLowerCase())) {
      await supabase
        .from("webhook_events")
        .update({ status: "ignored", processed_at: new Date().toISOString() })
        .eq("eventbrite_webhook_id", webhookKey);
      return NextResponse.json({ ok: true, ignored: true, orderStatus: order.status });
    }

    const attendees = await fetchEventbriteAttendeesByOrder(orderId, eventbriteToken);
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
            source: "eventbrite_webhook_email",
            reference_id: `${orderId}:${attendee.id}`,
            reason: "email_send_failed",
            payload: attendee,
            error: emailResult.error,
          });
        }
      } else {
        await supabase.from("webhook_dead_letters").insert({
          source: "eventbrite_webhook",
          reference_id: `${orderId}:${attendee.id}`,
          reason: result.reason,
          payload: attendee,
          error: result.reason === "db_error" ? result.error : null,
        });
      }
    }

    await supabase
      .from("webhook_events")
      .update({ status: "processed", processed_at: new Date().toISOString() })
      .eq("eventbrite_webhook_id", webhookKey);

    return NextResponse.json({ ok: true, attendeesProcessed: processed, attendeesTotal: attendees.length });
  } catch (error) {
    console.error(error);
    await supabase.from("webhook_dead_letters").insert({
      source: "eventbrite_webhook",
      reference_id: "webhook-request",
      reason: "handler_exception",
      payload,
      error,
    });
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
