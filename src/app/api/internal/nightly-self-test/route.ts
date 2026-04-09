import { NextRequest, NextResponse } from "next/server";
import { sendOpsAlert } from "@/lib/ops-alerts";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET ?? process.env.INTERNAL_CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const base = (process.env.APP_BASE_URL ?? "https://denverporchfest.com").replace(/\/$/, "");

  const [cronHealthRes, smokeRes] = await Promise.all([
    fetch(`${base}/api/internal/cron-health`, { cache: "no-store" }),
    fetch(`${base}/api/internal/smoke-access`, { cache: "no-store" }),
  ]);

  const cronHealth = await cronHealthRes.json().catch(() => ({}));
  const smoke = await smokeRes.json().catch(() => ({}));

  const failures: string[] = [];
  if (!cronHealthRes.ok) failures.push(`cron-health status=${cronHealthRes.status}`);
  if (!smokeRes.ok) failures.push(`smoke-access status=${smokeRes.status}`);
  if (cronHealth?.stale) failures.push("cron-health stale=true");
  if (cronHealth?.status && cronHealth.status !== "ok") failures.push(`cron-health status field=${cronHealth.status}`);
  if (smoke?.ok === false) failures.push("smoke-access ok=false");

  if (failures.length > 0) {
    await sendOpsAlert({
      subject: "[PorchFest] Nightly self-test failed",
      message: [
        `Detected ${failures.length} failure(s):`,
        ...failures.map((f) => `- ${f}`),
        "",
        `cron-health response: ${JSON.stringify(cronHealth, null, 2)}`,
        `smoke-access response: ${JSON.stringify(smoke, null, 2)}`,
      ].join("\n"),
    });

    return NextResponse.json({ ok: false, failures, cronHealth, smoke }, { status: 503 });
  }

  return NextResponse.json({ ok: true, cronHealth, smoke, timestamp: new Date().toISOString() });
}
