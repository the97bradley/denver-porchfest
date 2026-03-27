import { NextResponse } from "next/server";

type VolunteerPayload = {
  name?: string;
  email?: string;
  phone?: string;
  notes?: string;
};

const APPS_SCRIPT_URL = process.env.VOLUNTEER_APPS_SCRIPT_URL;

export async function POST(req: Request) {
  let body: VolunteerPayload;

  try {
    body = (await req.json()) as VolunteerPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const phone = (body.phone || "").trim();
  const notes = (body.notes || "").trim();

  if (!name || !email) {
    return NextResponse.json(
      { ok: false, error: "name_and_email_required" },
      { status: 400 },
    );
  }

  if (!APPS_SCRIPT_URL) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "backend_not_configured_set_VOLUNTEER_APPS_SCRIPT_URL_in_environment",
      },
      { status: 500 },
    );
  }

  try {
    const upstream = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone,
        notes,
        source: "denver-porchfest-site",
        submittedAt: new Date().toISOString(),
      }),
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { ok: false, error: "upstream_sheet_write_failed" },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "upstream_unreachable" },
      { status: 502 },
    );
  }
}
