export type EventbriteAttendee = {
  id: string;
  order_id: string;
  profile?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    name?: string;
  };
  ticket_class_id?: string;
  status?: string;
};

const BASE = "https://www.eventbriteapi.com/v3";

async function ebFetch<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Eventbrite fetch failed (${res.status}) ${path}: ${body}`);
  }

  return (await res.json()) as T;
}

export async function fetchEventbriteAttendeesByOrder(
  orderId: string,
  token: string,
): Promise<EventbriteAttendee[]> {
  const data = await ebFetch<{ attendees?: EventbriteAttendee[] }>(`/orders/${orderId}/attendees/`, token);
  return data.attendees ?? [];
}

export async function fetchEventbriteOrder(orderId: string, token: string) {
  return ebFetch<{ id: string; status?: string; email?: string }>(`/orders/${orderId}/`, token);
}

export async function fetchRecentEventbriteAttendees(
  eventId: string,
  token: string,
  changedSinceIso: string,
): Promise<EventbriteAttendee[]> {
  const all: EventbriteAttendee[] = [];
  let continuation: string | null = null;

  const changedSince = new Date(changedSinceIso).toISOString().replace(/\.\d{3}Z$/, "Z");

  do {
    const qs = new URLSearchParams({ changed_since: changedSince });
    if (continuation) qs.set("continuation", continuation);

    const data = await ebFetch<{
      attendees?: EventbriteAttendee[];
      pagination?: { continuation?: string | null; has_more_items?: boolean };
    }>(`/events/${eventId}/attendees/?${qs.toString()}`, token);

    all.push(...(data.attendees ?? []));
    continuation = data.pagination?.has_more_items ? data.pagination?.continuation ?? null : null;
  } while (continuation);

  return all;
}
