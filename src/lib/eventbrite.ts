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

export async function fetchEventbriteAttendeesByOrder(
  orderId: string,
  token: string,
): Promise<EventbriteAttendee[]> {
  const url = `${BASE}/orders/${orderId}/attendees/`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Eventbrite attendees fetch failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as { attendees?: EventbriteAttendee[] };
  return data.attendees ?? [];
}
