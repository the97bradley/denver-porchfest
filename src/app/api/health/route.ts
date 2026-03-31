import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function configuredEnvStatus() {
  return {
    volunteerWebhookConfigured: Boolean(process.env.VOLUNTEER_APPS_SCRIPT_URL),
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
  const env = configuredEnvStatus();
  const criticalDependencyHealthy = env.volunteerWebhookConfigured;

  const status = criticalDependencyHealthy ? "ok" : "degraded";

  const response = NextResponse.json(
    {
      ok: status === "ok",
      status,
      service: "denver-porchfest-site",
      timestamp: new Date().toISOString(),
      version: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
      checks: env,
    },
    {
      status: criticalDependencyHealthy ? 200 : 503,
    },
  );

  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function HEAD() {
  const volunteerWebhookConfigured = Boolean(process.env.VOLUNTEER_APPS_SCRIPT_URL);

  return new NextResponse(null, {
    status: volunteerWebhookConfigured ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
