import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type AppInfo = {
  title: string;
  body: string;
  sort_order: number;
};

const INFO_SOURCE_TABLE = process.env.INFO_SOURCE_TABLE?.trim() || "info";
const SCHEDULE_SOURCE_TABLE = process.env.SCHEDULE_SOURCE_TABLE?.trim() || "schedule";
const LINEUP_SOURCE_TABLE = process.env.BANDS_SOURCE_TABLE?.trim() || process.env.APP_BANDS_SOURCE_TABLE?.trim() || process.env.APP_LINEUP_SOURCE_TABLE?.trim() || "bands";
const MAP_PINS_SOURCE_TABLE = process.env.MAP_PINS_SOURCE_TABLE?.trim() || "map_pins";
const UPDATES_SOURCE_TABLE = process.env.UPDATES_SOURCE_TABLE?.trim() || "updates";

export async function getAppInfo() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from(INFO_SOURCE_TABLE)
    .select("title,body,sort_order")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getAppSchedule() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from(SCHEDULE_SOURCE_TABLE)
    .select("id,time,title,location,sort_order")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getAppLineup() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(LINEUP_SOURCE_TABLE)
    .select("id,artist,genre,porch,time,sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to load lineup from ${LINEUP_SOURCE_TABLE}: ${error.message}`);
  }

  return data ?? [];
}

export async function getAppMapPins() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from(MAP_PINS_SOURCE_TABLE)
    .select("id,name,type,address,lat,lng,sort_order")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getAppUpdates() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from(UPDATES_SOURCE_TABLE)
    .select("id,ts,text,pinned")
    .order("ts", { ascending: false })
    .limit(20);
  return data ?? [];
}
