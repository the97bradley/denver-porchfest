import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type AppInfo = {
  title: string;
  body: string;
  sort_order: number;
};

export async function getAppInfo() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("app_info")
    .select("title,body,sort_order")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getAppSchedule() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("app_schedule")
    .select("id,time,title,location,sort_order")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getAppLineup() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("app_lineup")
    .select("id,artist,genre,porch,time,sort_order")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getAppMapPins() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("app_map_pins")
    .select("id,name,type,address,lat,lng,sort_order")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getAppUpdates() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("app_updates")
    .select("id,ts,text,pinned")
    .order("ts", { ascending: false })
    .limit(20);
  return data ?? [];
}
