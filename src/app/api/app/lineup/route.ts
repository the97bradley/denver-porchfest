import { NextRequest, NextResponse } from "next/server";
import { requireAppAccess } from "@/lib/app-auth";

export async function GET(req: NextRequest) {
  const auth = await requireAppAccess(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  return NextResponse.json({
    ok: true,
    lineup: [
      { id: "l1", artist: "The Park Sessions", genre: "Indie", porch: "Porch A", time: "1:00 PM" },
      { id: "l2", artist: "Mile High Brass", genre: "Brass", porch: "Porch D", time: "2:30 PM" },
      { id: "l3", artist: "Sunset Folk Trio", genre: "Folk", porch: "Porch F", time: "4:00 PM" },
    ],
  });
}
