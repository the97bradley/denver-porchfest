import { NextResponse } from "next/server";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("q") || "").trim();

  if (!query) {
    return NextResponse.json(
      { ok: false, error: "missing_query" },
      { status: 400 },
    );
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return NextResponse.json({ ok: true, status: "unknown", open: true });
  }

  try {
    const searchRes = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask": "places.id,places.displayName,places.businessStatus",
        },
        body: JSON.stringify({
          textQuery: `${query} near Denver CO`,
          maxResultCount: 1,
        }),
      },
    );

    if (!searchRes.ok) {
      return NextResponse.json({ ok: true, status: "unknown", open: true });
    }

    const json = (await searchRes.json()) as {
      places?: Array<{ businessStatus?: string }>;
    };

    const status = json.places?.[0]?.businessStatus;

    if (!status) {
      return NextResponse.json({ ok: true, status: "unknown", open: true });
    }

    return NextResponse.json({
      ok: true,
      status,
      open: status === "OPERATIONAL",
    });
  } catch {
    return NextResponse.json({ ok: true, status: "unknown", open: true });
  }
}
