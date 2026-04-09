import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: "Eventbrite webhooks are disabled. System uses scheduled polling.",
    },
    { status: 410 },
  );
}
