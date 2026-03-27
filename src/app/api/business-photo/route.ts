import { NextResponse } from "next/server";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("q") || "").trim();

  if (!query) {
    return NextResponse.json({ ok: false, error: "missing_query" }, { status: 400 });
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return NextResponse.json(
      { ok: false, error: "missing_GOOGLE_MAPS_API_KEY" },
      { status: 500 },
    );
  }

  try {
    const searchRes = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask": "places.id,places.displayName,places.photos.name",
        },
        body: JSON.stringify({
          textQuery: `${query} near Denver CO`,
          maxResultCount: 1,
        }),
      },
    );

    if (!searchRes.ok) {
      return NextResponse.json(
        { ok: false, error: "places_search_failed" },
        { status: 502 },
      );
    }

    const searchJson = (await searchRes.json()) as {
      places?: Array<{ photos?: Array<{ name?: string }> }>;
    };

    const photoName = searchJson.places?.[0]?.photos?.[0]?.name;
    if (!photoName) {
      return NextResponse.json({ ok: false, error: "no_photo_found" }, { status: 404 });
    }

    const photoRes = await fetch(
      `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=900&skipHttpRedirect=true&key=${GOOGLE_MAPS_API_KEY}`,
    );

    if (!photoRes.ok) {
      return NextResponse.json(
        { ok: false, error: "places_photo_lookup_failed" },
        { status: 502 },
      );
    }

    const photoJson = (await photoRes.json()) as { photoUri?: string };
    if (!photoJson.photoUri) {
      return NextResponse.json({ ok: false, error: "missing_photo_uri" }, { status: 404 });
    }

    return NextResponse.redirect(photoJson.photoUri, 302);
  } catch {
    return NextResponse.json(
      { ok: false, error: "places_photo_exception" },
      { status: 502 },
    );
  }
}
