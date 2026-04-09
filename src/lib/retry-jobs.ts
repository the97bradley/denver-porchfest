import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function enqueueOrderRetries(orderId: string) {
  const supabase = getSupabaseAdmin();
  const now = Date.now();
  const scheduleMinutes = [2, 10, 30];

  for (let i = 0; i < scheduleMinutes.length; i += 1) {
    const runAt = new Date(now + scheduleMinutes[i] * 60_000).toISOString();
    await supabase.from("retry_jobs").upsert(
      {
        job_key: `order:${orderId}:attempt:${i + 1}`,
        kind: "order_sync",
        payload: { orderId },
        run_at: runAt,
        status: "pending",
      },
      { onConflict: "job_key" },
    );
  }
}

export async function markRetryJobDone(id: string) {
  const supabase = getSupabaseAdmin();
  await supabase.from("retry_jobs").update({ status: "done", processed_at: new Date().toISOString() }).eq("id", id);
}

export async function markRetryJobFailed(id: string, error: unknown) {
  const supabase = getSupabaseAdmin();
  await supabase
    .from("retry_jobs")
    .update({ status: "failed", processed_at: new Date().toISOString(), error })
    .eq("id", id);
}
