import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type AppInfo = {
  title: string;
  body: string;
  sort_order: number;
};

const INFO_SOURCE_TABLE = process.env.INFO_SOURCE_TABLE?.trim() || "info";
const SCHEDULE_SOURCE_TABLE = process.env.SCHEDULE_SOURCE_TABLE?.trim() || "schedule";
const LINEUP_SOURCE_TABLE = process.env.APP_LINEUP_SOURCE_TABLE?.trim() || process.env.APP_BANDS_SOURCE_TABLE?.trim() || process.env.BANDS_SOURCE_TABLE?.trim() || "bands";
const UPDATES_SOURCE_TABLE = process.env.UPDATES_SOURCE_TABLE?.trim() || "updates";
const COUPONS_SOURCE_TABLE = process.env.COUPONS_SOURCE_TABLE?.trim() || "coupons";
const IS_TEST_ENV = /test/i.test(`${process.env.DATA_ENV ?? ""} ${process.env.APP_ENV ?? ""}`);


export async function getAppInfo() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from(INFO_SOURCE_TABLE)
    .select("title,body,sort_order")
    .order("sort_order", { ascending: true });
  const rows = data ?? [];
  if (rows.length === 0 && IS_TEST_ENV) {
    return [
      { title: "Welcome", body: "Welcome to Denver PorchFest app access.", sort_order: 1 },
      { title: "Testing Mode", body: "This preview environment is using testing defaults.", sort_order: 2 },
    ];
  }
  return rows;
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

  const tableCandidates = [
    process.env.APP_LINEUP_SOURCE_TABLE?.trim(),
    process.env.APP_BANDS_SOURCE_TABLE?.trim(),
    process.env.BANDS_SOURCE_TABLE?.trim(),
    "bands",
  ].filter(Boolean) as string[];

  for (const tableName of [...new Set(tableCandidates)]) {
    const { data, error } = await supabase
      .from(tableName)
      .select("id,artist,genre,porch,time,sort_order")
      .order("sort_order", { ascending: true });

    if (!error) return data ?? [];

    console.error(`Lineup query failed for table ${tableName}: ${error.message}`);
  }

  // Fallback schema used by newer app tables.
  const { data: slots, error: slotsError } = await supabase
    .from("location_artists")
    .select("id,slot_label,sort_order,artist:artists(name,genre),location:locations(name)")
    .eq("status", "active")
    .order("sort_order", { ascending: true });

  if (!slotsError) {
    return (slots ?? []).map((row) => {
      const artist = Array.isArray(row.artist) ? row.artist[0] : row.artist;
      const location = Array.isArray(row.location) ? row.location[0] : row.location;

      return {
        id: row.id,
        artist: artist?.name ?? "Artist TBD",
        genre: artist?.genre ?? "",
        porch: location?.name ?? "Location TBD",
        time: row.slot_label ?? "Time TBD",
        sort_order: row.sort_order ?? null,
      };
    });
  }

  console.error(`Lineup fallback query failed for location_artists: ${slotsError.message}`);

  if (IS_TEST_ENV) {
    return [
      { id: "test-1", artist: "The Sidewalk Saints", genre: "Indie Folk", porch: "Porch A", time: "12:00 PM", sort_order: 1 },
      { id: "test-2", artist: "Mile High Brass", genre: "Brass Funk", porch: "Porch B", time: "1:15 PM", sort_order: 2 },
      { id: "test-3", artist: "Cherry Creek Revival", genre: "Alt Country", porch: "Porch C", time: "2:30 PM", sort_order: 3 },
    ];
  }

  return [];
}

export async function getAppMapPins() {
  const supabase = getSupabaseAdmin();

  const [{ data: locations }, { data: vendors }] = await Promise.all([
    supabase
      .from("locations")
      .select("id,name,address,lat,lng")
      .eq("status", "active")
      .order("name", { ascending: true }),
    supabase
      .from("vendors")
      .select("id,business_name,booth_location")
      .eq("status", "active")
      .order("business_name", { ascending: true }),
  ]);

  const locationPins = (locations ?? []).map((l) => ({
    id: `location-${l.id}`,
    name: l.name || l.address,
    type: "porch",
    address: l.address,
    lat: l.lat ?? null,
    lng: l.lng ?? null,
  }));

  const vendorPins = (vendors ?? []).map((v) => ({
    id: `vendor-${v.id}`,
    name: v.business_name,
    type: "vendor",
    address: v.booth_location || "Address TBD",
    lat: null,
    lng: null,
  }));

  return [...locationPins, ...vendorPins];
}

export type NeighborhoodSpot = {
  id: string;
  name: string;
  type: string | null;
  address: string | null;
  description: string | null;
  image: string | null;
};

export async function getNeighborhoodSpots() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("locations")
    .select("id,name,type,address,description,image")
    .eq("status", "active")
    .order("name", { ascending: true });

  return (data ?? []) as NeighborhoodSpot[];
}


export async function getAppCoupons(deviceId?: string) {
  const supabase = getSupabaseAdmin();
  const { data: coupons } = await supabase
    .from(COUPONS_SOURCE_TABLE)
    .select("id,deal,location_id,location:locations!coupons_location_id_fkey(id,name,address,image,description)")
    .order("id", { ascending: true });

  const normalized = (coupons ?? [])
    .filter((c) => c.location)
    .map((c) => ({
      id: c.id,
      deal: c.deal,
      location_id: c.location_id,
      location: c.location,
    }));

  const couponIds = normalized.map((c) => c.id);
  if (!couponIds.length) return [];

  if (!deviceId) {
    return normalized.map((c) => ({ ...c, has_been_used: false }));
  }

  const { data: redemptions } = await supabase
    .from("coupon_redemptions")
    .select("coupon_id")
    .eq("device_id", deviceId)
    .in("coupon_id", couponIds);

  const usedSet = new Set((redemptions ?? []).map((r) => r.coupon_id));

  return normalized.map((c) => ({
    ...c,
    has_been_used: usedSet.has(c.id),
  }));
}

export async function getAppArtists() {
  const supabase = getSupabaseAdmin();

  const [{ data: artists }, { data: slots }] = await Promise.all([
    supabase
      .from("artists")
      .select("id,name,genre,description,bio,image,social_url,spotify_url,status")
      .eq("status", "active")
      .order("name", { ascending: true }),
    supabase
      .from("location_artists")
      .select("artist_id,slot_label,sort_order,location:locations(id,name,address,image)")
      .eq("status", "active")
      .order("sort_order", { ascending: true }),
  ]);

  const slotsByArtist = new Map<string, Array<{ time: string; sort_order: number | null; location: { id: string; name: string; address: string | null; image: string | null } }>>();

  for (const slot of slots ?? []) {
    const key = slot.artist_id;
    const loc = Array.isArray(slot.location) ? slot.location[0] : slot.location;
    if (!loc) continue;

    if (!slotsByArtist.has(key)) slotsByArtist.set(key, []);
    slotsByArtist.get(key)!.push({
      time: slot.slot_label || "Time TBD",
      sort_order: slot.sort_order ?? null,
      location: {
        id: loc.id,
        name: loc.name,
        address: loc.address ?? null,
        image: loc.image ?? null,
      },
    });
  }

  return (artists ?? []).map((artist) => ({
    ...artist,
    sets: (slotsByArtist.get(artist.id) ?? []).map((s) => ({
      time: s.time,
      location: s.location,
    })),
  }));
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
