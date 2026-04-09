import { NextRequest, NextResponse } from "next/server";
import { requireAppAccess } from "@/lib/app-auth";

export async function GET(req: NextRequest) {
  const auth = await requireAppAccess(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  return NextResponse.json({
    ok: true,
    pins: [
      { id: "m1", name: "Info Booth", type: "info", address: "12th Ave & Columbine St" },
      { id: "m2", name: "Porch A", type: "porch", address: "1250 Cook St" },
      { id: "m3", name: "Vendor Row", type: "vendor", address: "1300 Steele St" },
    ],
  });
}
