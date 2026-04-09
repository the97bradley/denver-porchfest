import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EventbriteAttendee } from "@/lib/eventbrite";

type UpdateCall = {
  table: string;
  values: Record<string, unknown>;
  eq: { column: string; value: string };
};

type InsertCall = { table: string; values: Record<string, unknown> };

type PendingEmailRow = {
  eventbriteAttendeeId: string;
  eventbriteOrderId: string;
  email: string;
  firstName?: string;
  tokenUrl: string;
  accessCode: string;
};

const state = {
  pendingEmailRows: [] as PendingEmailRow[],
  updateCalls: [] as UpdateCall[],
  insertCalls: [] as InsertCall[],
};

function resetState() {
  state.pendingEmailRows = [];
  state.updateCalls = [];
  state.insertCalls = [];
}

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
                      return Promise.resolve({ data: state.pendingEmailRows });
                    },
                  };
                },
              };
            },
          };
        },
        upsert() {
          return Promise.resolve({ error: null });
        },
        update(values: Record<string, unknown>) {
          return {
            eq(column: string, value: string) {
              state.updateCalls.push({ table, values, eq: { column, value } });
              return Promise.resolve({ error: null });
            },
          };
        },
        insert(values: Record<string, unknown>) {
          state.insertCalls.push({ table, values });
          return Promise.resolve({ error: null });
        },
      };
    },
  };
}

const fetchRecentEventbriteAttendeesMock = vi.fn();
const fetchEventbriteOrderMock = vi.fn();
const upsertEventbriteAttendeeMock = vi.fn();
const sendAccessEmailMock = vi.fn();
const notifyAccessEmailFailureMock = vi.fn();

vi.mock("@/lib/supabase-admin", () => ({
  getSupabaseAdmin: () => createSupabaseMock(),
}));

vi.mock("@/lib/eventbrite", () => ({
  fetchRecentEventbriteAttendees: (...args: unknown[]) => fetchRecentEventbriteAttendeesMock(...args),
  fetchEventbriteOrder: (...args: unknown[]) => fetchEventbriteOrderMock(...args),
}));

vi.mock("@/lib/attendee-sync", () => ({
  upsertEventbriteAttendee: (...args: unknown[]) => upsertEventbriteAttendeeMock(...args),
}));

vi.mock("@/lib/email", () => ({
  sendAccessEmail: (...args: unknown[]) => sendAccessEmailMock(...args),
}));

vi.mock("@/lib/email-alerts", () => ({
  notifyAccessEmailFailure: (...args: unknown[]) => notifyAccessEmailFailureMock(...args),
}));

function attendee(
  id: string,
  orderId: string,
  first: string,
  last: string,
  email: string,
  status = "Attending",
): EventbriteAttendee {
  return {
    id,
    order_id: orderId,
    profile: {
      first_name: first,
      last_name: last,
      email,
      name: `${first} ${last}`,
    },
    status,
  };
}

function upsertResultFor(a: EventbriteAttendee, overrides: Partial<Record<string, unknown>> = {}) {
  return {
    ok: true,
    attendeeId: a.id,
    email: a.profile?.email,
    firstName: a.profile?.first_name,
    tokenUrl: `https://www.denverporchfest.com/go/${a.id}`,
    accessCode: "ABC12345",
    status: "active",
    alreadyEmailed: false,
    ...overrides,
  };
}

async function runPoll() {
  const { GET } = await import("@/app/api/internal/poll-eventbrite/route");
  const req = new NextRequest("https://www.denverporchfest.com/api/internal/poll-eventbrite", {
    method: "GET",
    headers: { authorization: "Bearer test-cron-secret" },
  });
  const res = await GET(req);
  return { res, json: (await res.json()) as Record<string, unknown> };
}

describe("GET /api/internal/poll-eventbrite", () => {
  beforeEach(() => {
    resetState();
    vi.clearAllMocks();

    process.env.CRON_SECRET = "test-cron-secret";
    process.env.EVENTBRITE_PRIVATE_TOKEN = "test-token";
    process.env.APP_BASE_URL = "https://www.denverporchfest.com";
    process.env.EVENTBRITE_EVENT_ID = "evt-1";
    process.env.EVENTBRITE_POLL_LOOKBACK_MINUTES = "180";

    fetchEventbriteOrderMock.mockResolvedValue({ status: "placed" });
    sendAccessEmailMock.mockResolvedValue({ ok: true });
    notifyAccessEmailFailureMock.mockResolvedValue(undefined);
  });

  it("processes one single-attendee order", async () => {
    const a1 = attendee("att-1", "order-1", "George", "Harrison", "gh@gmail.com");
    fetchRecentEventbriteAttendeesMock.mockResolvedValue([a1]);
    upsertEventbriteAttendeeMock.mockResolvedValue(upsertResultFor(a1));

    const { json } = await runPoll();

    expect(json.attendeesFound).toBe(1);
    expect(json.attendeesProcessed).toBe(1);
    expect(json.accessEmailsSent).toBe(1);
    expect(sendAccessEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: "gh@gmail.com", firstName: "George" }),
    );
  });

  it("processes one multi-attendee order", async () => {
    const a1 = attendee("att-1", "order-1", "John", "Smith", "johnsmith@gmail.com");
    const a2 = attendee("att-2", "order-1", "Bob", "Jones", "bobjones@gmail.com");
    fetchRecentEventbriteAttendeesMock.mockResolvedValue([a1, a2]);
    upsertEventbriteAttendeeMock
      .mockResolvedValueOnce(upsertResultFor(a1))
      .mockResolvedValueOnce(upsertResultFor(a2));

    const { json } = await runPoll();

    expect(json.attendeesFound).toBe(2);
    expect(json.accessEmailsSent).toBe(2);
    expect(sendAccessEmailMock).toHaveBeenCalledTimes(2);
  });

  it("revokes and clears token/accessCode for refunded orders and does not email", async () => {
    const a1 = attendee("att-r1", "order-r", "Refunded", "User", "refund@example.com");
    fetchRecentEventbriteAttendeesMock.mockResolvedValue([a1]);
    upsertEventbriteAttendeeMock.mockResolvedValue(upsertResultFor(a1));
    fetchEventbriteOrderMock.mockResolvedValue({ status: "refunded" });

    const { json } = await runPoll();

    expect(json.accessEmailsSent).toBe(0);
    expect(sendAccessEmailMock).not.toHaveBeenCalled();

    const revokeUpdate = state.updateCalls.find(
      (c) =>
        c.table === "attendees" &&
        c.eq.value === "att-r1" &&
        c.values.status === "revoked" &&
        c.values.tokenUrl === null &&
        c.values.accessCode === null,
    );
    expect(revokeUpdate).toBeTruthy();
  });

  it("DB sweep emails active attendees missing accessEmailSentAt", async () => {
    fetchRecentEventbriteAttendeesMock.mockResolvedValue([]);

    state.pendingEmailRows = [
      {
        eventbriteAttendeeId: "att-db-1",
        eventbriteOrderId: "order-db-1",
        email: "unsent@example.com",
        firstName: "Unsent",
        tokenUrl: "https://www.denverporchfest.com/go/att-db-1",
        accessCode: "ZXCV1234",
      },
    ];

    const { json } = await runPoll();

    expect(json.dbSweepFound).toBe(1);
    expect(json.dbSweepEmailed).toBe(1);
    expect(sendAccessEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: "unsent@example.com", firstName: "Unsent" }),
    );
  });

  it("does not email revoked people found in DB sweep", async () => {
    fetchRecentEventbriteAttendeesMock.mockResolvedValue([]);
    fetchEventbriteOrderMock.mockResolvedValue({ status: "refunded" });

    state.pendingEmailRows = [
      {
        eventbriteAttendeeId: "att-db-r",
        eventbriteOrderId: "order-db-r",
        email: "revoked@example.com",
        firstName: "Revoked",
        tokenUrl: "https://www.denverporchfest.com/go/att-db-r",
        accessCode: "QWER1234",
      },
    ];

    const { json } = await runPoll();

    expect(json.dbSweepFound).toBe(1);
    expect(json.dbSweepEmailed).toBe(0);
    expect(sendAccessEmailMock).not.toHaveBeenCalled();

    const revokeUpdate = state.updateCalls.find(
      (c) => c.eq.value === "att-db-r" && c.values.status === "revoked",
    );
    expect(revokeUpdate).toBeTruthy();
  });

  it("does not send email when attendee already emailed", async () => {
    const a1 = attendee("att-ae", "order-ae", "Already", "Emailed", "already@example.com");
    fetchRecentEventbriteAttendeesMock.mockResolvedValue([a1]);
    upsertEventbriteAttendeeMock.mockResolvedValue(upsertResultFor(a1, { alreadyEmailed: true }));

    const { json } = await runPoll();

    expect(json.attendeesProcessed).toBe(1);
    expect(json.attendeesIgnored).toBe(1);
    expect(json.accessEmailsSent).toBe(0);
    expect(sendAccessEmailMock).not.toHaveBeenCalled();
  });

  it("handles email send failures by recording error + notifying alerts", async () => {
    const a1 = attendee("att-f", "order-f", "Fail", "Case", "fail@example.com");
    fetchRecentEventbriteAttendeesMock.mockResolvedValue([a1]);
    upsertEventbriteAttendeeMock.mockResolvedValue(upsertResultFor(a1));
    sendAccessEmailMock.mockResolvedValue({ ok: false, error: "smtp timeout" });

    const { json } = await runPoll();

    expect(json.accessEmailsSent).toBe(0);

    const attendeeErrorUpdate = state.updateCalls.find(
      (c) => c.table === "attendees" && c.eq.value === "att-f" && c.values.accessEmailError === "smtp timeout",
    );
    expect(attendeeErrorUpdate).toBeTruthy();

    const deadLetter = state.insertCalls.find(
      (c) => c.table === "webhook_dead_letters" && c.values.reason === "email_send_failed",
    );
    expect(deadLetter).toBeTruthy();

    expect(notifyAccessEmailFailureMock).toHaveBeenCalledWith(
      expect.objectContaining({
        attendeeEmail: "fail@example.com",
        eventbriteOrderId: "order-f",
        reason: "smtp timeout",
      }),
    );
  });

  it("rejects unauthorized cron calls", async () => {
    const { GET } = await import("@/app/api/internal/poll-eventbrite/route");
    const req = new NextRequest("https://www.denverporchfest.com/api/internal/poll-eventbrite", {
      method: "GET",
      headers: { authorization: "Bearer wrong" },
    });

    const res = await GET(req);
    expect(res.status).toBe(401);
    expect(sendAccessEmailMock).not.toHaveBeenCalled();
  });
});
