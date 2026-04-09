import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

type UpdateCall = { table: string; values: Record<string, unknown>; eq: { column: string; value: string } };

const updateCalls: UpdateCall[] = [];
const insertCalls: Array<{ table: string; values: Record<string, unknown> }> = [];

function createSupabaseMock() {
  return {
    from(table: string) {
      return {
        select() {
          return {
            eq() {
              return {
                is() {
                  return {
                    limit() {
                      return Promise.resolve({ data: [] });
                    },
                  };
                },
              };
            },
          };
        },
        update(values: Record<string, unknown>) {
          return {
            eq(column: string, value: string) {
              updateCalls.push({ table, values, eq: { column, value } });
              return Promise.resolve({ error: null });
            },
          };
        },
        insert(values: Record<string, unknown>) {
          insertCalls.push({ table, values });
          return Promise.resolve({ error: null });
        },
      };
    },
  };
}

vi.mock("@/lib/supabase-admin", () => ({
  getSupabaseAdmin: () => createSupabaseMock(),
}));

const attendeesFixture = [
  {
    id: "att-1",
    order_id: "order-1",
    profile: { first_name: "John", last_name: "Smith", email: "johnsmith@gmail.com", name: "John Smith" },
    status: "Attending",
  },
  {
    id: "att-2",
    order_id: "order-1",
    profile: { first_name: "Bob", last_name: "Jones", email: "bobjones@gmail.com", name: "Bob Jones" },
    status: "Attending",
  },
  {
    id: "att-3",
    order_id: "order-2",
    profile: { first_name: "George", last_name: "Harrison", email: "gh@gmail.com", name: "George Harrison" },
    status: "Attending",
  },
];

vi.mock("@/lib/eventbrite", () => ({
  fetchRecentEventbriteAttendees: vi.fn(async () => attendeesFixture),
  fetchEventbriteOrder: vi.fn(async () => ({ status: "placed" })),
}));

vi.mock("@/lib/attendee-sync", () => ({
  upsertEventbriteAttendee: vi.fn(async (attendee: (typeof attendeesFixture)[number]) => ({
    ok: true,
    attendeeId: attendee.id,
    email: attendee.profile.email,
    firstName: attendee.profile.first_name,
    tokenUrl: `https://www.denverporchfest.com/go/${attendee.id}`,
    accessCode: "ABC12345",
    status: "active",
    alreadyEmailed: false,
  })),
}));

const sendAccessEmailMock = vi.fn(async () => ({ ok: true }));

vi.mock("@/lib/email", () => ({
  sendAccessEmail: (...args: unknown[]) => sendAccessEmailMock(...args),
}));

vi.mock("@/lib/email-alerts", () => ({
  notifyAccessEmailFailure: vi.fn(async () => undefined),
}));

describe("GET /api/internal/poll-eventbrite", () => {
  beforeEach(() => {
    updateCalls.length = 0;
    insertCalls.length = 0;
    sendAccessEmailMock.mockClear();

    process.env.CRON_SECRET = "test-cron-secret";
    process.env.EVENTBRITE_PRIVATE_TOKEN = "test-token";
    process.env.APP_BASE_URL = "https://www.denverporchfest.com";
    process.env.EVENTBRITE_EVENT_ID = "evt-1";
    process.env.EVENTBRITE_POLL_LOOKBACK_MINUTES = "180";
  });

  it("polls eventbrite and processes 2 orders / 3 new attendees", async () => {
    const { GET } = await import("@/app/api/internal/poll-eventbrite/route");

    const req = new NextRequest("https://www.denverporchfest.com/api/internal/poll-eventbrite", {
      method: "GET",
      headers: { authorization: "Bearer test-cron-secret" },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = (await res.json()) as Record<string, unknown>;
    expect(json.ok).toBe(true);
    expect(json.attendeesFound).toBe(3);
    expect(json.attendeesProcessed).toBe(3);
    expect(json.accessEmailsSent).toBe(3);

    expect(sendAccessEmailMock).toHaveBeenCalledTimes(3);
    expect(sendAccessEmailMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ to: "johnsmith@gmail.com", firstName: "John" }),
    );
    expect(sendAccessEmailMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ to: "bobjones@gmail.com", firstName: "Bob" }),
    );
    expect(sendAccessEmailMock).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ to: "gh@gmail.com", firstName: "George" }),
    );

    const attendeeUpdateCalls = updateCalls.filter((c) => c.table === "attendees");
    expect(attendeeUpdateCalls.length).toBe(3);
    expect(attendeeUpdateCalls.every((c) => c.values.accessEmailSentAt)).toBe(true);
    expect(insertCalls.length).toBe(0);
  });
});
