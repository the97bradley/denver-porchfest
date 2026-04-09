import { NextRequest, NextResponse } from "next/server";
import { requireAppAccess } from "@/lib/app-auth";
import { getAppUpdates } from "@/lib/app-content";

export async function GET(req: NextRequest) {
  const auth = await requireAppAccess(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const updates = await getAppUpdates();
  return NextResponse.json({ ok: true, updates });
}
