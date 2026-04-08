import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const supabase = getSupabaseAdmin();

  const { data: attendee } = await supabase
    .from("attendees")
    .select("email,status")
    .eq("access_link_token", token)
    .maybeSingle();

  const buyUrl = process.env.EVENTBRITE_EVENT_URL ?? "https://www.eventbrite.com";
  const appUrl = process.env.APP_SUCCESS_URL ?? "/";

  if (!attendee || attendee.status !== "active") {
    return NextResponse.redirect(new URL(buyUrl));
  }

  // MVP redirect to app success URL with identity hint.
  // Later: exchange into authenticated app session (Supabase OTP verify flow).
  const url = new URL(appUrl, process.env.APP_BASE_URL);
  url.searchParams.set("email", attendee.email);
  return NextResponse.redirect(url);
}
