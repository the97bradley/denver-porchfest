import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function configuredEnvStatus() {
  return {
    googleMapsServerKeyConfigured: Boolean(process.env.GOOGLE_MAPS_API_KEY),
    googleMapsBrowserKeyConfigured: Boolean(
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    ),
    sanityConfigured: Boolean(
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
        process.env.NEXT_PUBLIC_SANITY_DATASET,
    ),
  };
}

export async function GET() {
  const response = NextResponse.json(
    {
      ok: true,
      status: "ok",
      service: "denver-porchfest-site",
      timestamp: new Date().toISOString(),
      version: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
      checks: configuredEnvStatus(),
    },
    {
      status: 200,
    },
  );

  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}
