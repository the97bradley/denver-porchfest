import { NextRequest } from "next/server";
import { describe, expect, it, vi, beforeEach } from "vitest";

const maybeSingleMock = vi.fn();
const updateEqMock = vi.fn();

vi.mock("@/lib/supabase-admin", () => ({
  getSupabaseAdmin: () => ({
    from: (table: string) => {
      if (table !== "attendees") throw new Error("unexpected table");
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: maybeSingleMock,
          }),
        }),
        update: () => ({
          eq: updateEqMock,
        }),
      };
    },
  }),
}));

async function callRedeem(body: Record<string, unknown>) {
  const { POST } = await import("@/app/api/access/redeem/route");
  const req = new NextRequest("https://denverporchfest.com/api/access/redeem", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
  const res = await POST(req);
  return { status: res.status, json: await res.json() };
}

describe("POST /api/access/redeem device binding", () => {
  beforeEach(() => {
    maybeSingleMock.mockReset();
    updateEqMock.mockReset();
    updateEqMock.mockResolvedValue({ error: null });
  });

  it("binds device on first redeem", async () => {
    maybeSingleMock.mockResolvedValue({
      data: { eventbriteAttendeeId: "att-1", tokenUrl: "https://x/go/abc", status: "active", deviceId: null },
    });

    const { status, json } = await callRedeem({ code: "ABCD1234", deviceId: "device-1" });

    expect(status).toBe(200);
    expect(json.ok).toBe(true);
    expect(updateEqMock).toHaveBeenCalled();
  });

  it("rejects different device when already bound", async () => {
    maybeSingleMock.mockResolvedValue({
      data: { eventbriteAttendeeId: "att-1", tokenUrl: "https://x/go/abc", status: "active", deviceId: "device-1" },
    });

    const { status, json } = await callRedeem({ code: "ABCD1234", deviceId: "device-2" });

    expect(status).toBe(409);
    expect(json.error).toContain("another device");
  });

  it("allows same device to redeem again", async () => {
    maybeSingleMock.mockResolvedValue({
      data: { eventbriteAttendeeId: "att-1", tokenUrl: "https://x/go/abc", status: "active", deviceId: "device-1" },
    });

    const { status, json } = await callRedeem({ code: "ABCD1234", deviceId: "device-1" });

    expect(status).toBe(200);
    expect(json.ok).toBe(true);
  });
});
