import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const { code } = (await req.json()) as { code?: string };
  if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

  const normalized = code.trim().toUpperCase();
  const supabase = getSupabaseAdmin();

  const { data: attendee } = await supabase
    .from("attendees")
    .select("tokenUrl,status")
    .eq("accessCode", normalized)
    .maybeSingle();

  if (!attendee || attendee.status !== "active") {
    return NextResponse.json({ error: "Invalid code" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, accessLink: attendee.tokenUrl });
}
