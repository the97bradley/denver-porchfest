import { NextRequest, NextResponse } from "next/server";
import { requireAppAccess } from "@/lib/app-auth";

export async function GET(req: NextRequest) {
  const auth = await requireAppAccess(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  return NextResponse.json({
    ok: true,
    schedule: [
      { id: "s1", time: "12:00 PM", title: "Neighborhood kickoff", location: "Info Booth" },
      { id: "s2", time: "1:00 PM", title: "Live porch sets", location: "Congress Park + Hale" },
      { id: "s3", time: "4:30 PM", title: "Vendors + food popups", location: "Main cluster" },
    ],
  });
}
