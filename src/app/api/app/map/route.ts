import { NextRequest, NextResponse } from "next/server";
import { requireAppAccess } from "@/lib/app-auth";
import { getAppMapPins } from "@/lib/app-content";

export async function GET(req: NextRequest) {
  const auth = await requireAppAccess(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const pins = await getAppMapPins();
  return NextResponse.json({ ok: true, pins });
}
