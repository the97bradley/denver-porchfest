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

      const token = existing?.tokenUrl?.split("/go/")[1] ?? generateToken(24);
      const tokenUrl = `${appBase.replace(/\/$/, "")}/go/${token}`;
      const accessCode = existing?.accessCode ?? generateAccessCode(8);

      await supabase.from("attendees").upsert(
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
    }

    return NextResponse.json({ ok: true, action: payload.action ?? null, attendeesProcessed: attendees.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
