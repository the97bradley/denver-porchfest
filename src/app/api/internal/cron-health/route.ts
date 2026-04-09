import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const JOB_NAME = "eventbrite_poll";

export async function GET() {
  const supabase = getSupabaseAdmin();

  const [{ data: cronRow }, { count: pendingUnsentCount }, { count: deadLetters24hCount }] = await Promise.all([
    supabase.from("cron_status").select("*").eq("job_name", JOB_NAME).maybeSingle(),
    supabase
      .from("attendees")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .is("accessEmailSentAt", null),
    supabase
      .from("pipeline_errors")
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 24 * 3600 * 1000).toISOString()),
  ]);

  const nowMs = Date.now();
  const lastFinishedMs = cronRow?.last_finished_at ? new Date(cronRow.last_finished_at).getTime() : null;
  const maxStaleMinutes = 25;
  const stale = lastFinishedMs === null || nowMs - lastFinishedMs > maxStaleMinutes * 60 * 1000;

  const json = {
    ok: true,
    job: JOB_NAME,
    status: cronRow?.last_status ?? "unknown",
    stale,
    maxStaleMinutes,
    lastStartedAt: cronRow?.last_started_at ?? null,
    lastFinishedAt: cronRow?.last_finished_at ?? null,
    lastError: cronRow?.last_error ?? null,
    metrics: {
      attendeesFound: cronRow?.attendees_found ?? 0,
      attendeesProcessed: cronRow?.attendees_processed ?? 0,
      attendeesIgnored: cronRow?.attendees_ignored ?? 0,
      accessEmailsSent: cronRow?.emails_sent ?? 0,
      dbSweepFound: cronRow?.db_sweep_found ?? 0,
      dbSweepEmailed: cronRow?.db_sweep_emailed ?? 0,
      pendingUnsentActiveAttendees: pendingUnsentCount ?? 0,
      deadLettersLast24h: deadLetters24hCount ?? 0,
    },
    timestamp: new Date().toISOString(),
  };

  const response = NextResponse.json(json, { status: stale ? 503 : 200 });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
