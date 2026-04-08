import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const supabase = getSupabaseAdmin();

  const appBase = process.env.APP_BASE_URL?.replace(/\/$/, "") ?? "";
  const tokenUrl = `${appBase}/go/${token}`;

  const { data: attendee } = await supabase
    .from("attendees")
    .select("email,status")
    .eq("tokenUrl", tokenUrl)
    .maybeSingle();

  const buyUrl = process.env.EVENTBRITE_EVENT_URL ?? "https://www.eventbrite.com";
  const appUrl = process.env.APP_SUCCESS_URL ?? "/";

  if (!attendee || attendee.status !== "active") {
    return NextResponse.redirect(new URL(buyUrl));
  }

  const url = new URL(appUrl, process.env.APP_BASE_URL);
  url.searchParams.set("email", attendee.email);
  return NextResponse.redirect(url);
}
