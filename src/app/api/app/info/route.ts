import { NextRequest, NextResponse } from "next/server";
import { requireAppAccess } from "@/lib/app-auth";

export async function GET(req: NextRequest) {
  const auth = await requireAppAccess(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  return NextResponse.json({
    ok: true,
    info: {
      title: "Denver PorchFest",
      date: "October 3",
      hours: "12:00 PM - 7:00 PM",
      perks: ["Sticker + lanyard pickup at info booth"],
      faq: [
        "Daytime event with neighborhood-first approach.",
        "Please respect homes, pets, and parking.",
      ],
    },
  });
}
