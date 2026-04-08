type AccessEmailAlertInput = {
  attendeeEmail: string;
  attendeeName?: string;
  eventbriteOrderId?: string;
  eventbriteAttendeeId?: string;
  reason: string;
};

export async function notifyAccessEmailFailure(input: AccessEmailAlertInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ACCESS_EMAIL_FROM ?? "Denver PorchFest <info@denverporchfest.com>";
  const to = process.env.ACCESS_ALERT_TO ?? "info@denverporchfest.com";

  if (!apiKey || !to) return { ok: false as const, error: "Missing RESEND_API_KEY or ACCESS_ALERT_TO" };

  const subject = `PorchFest access email failed: ${input.attendeeEmail}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color:#1f2937; line-height:1.5;">
      <p><strong>Access email delivery failed.</strong></p>
      <ul>
        <li>Attendee email: ${input.attendeeEmail}</li>
        <li>Attendee name: ${input.attendeeName ?? "(unknown)"}</li>
        <li>Eventbrite order: ${input.eventbriteOrderId ?? "(unknown)"}</li>
        <li>Eventbrite attendee: ${input.eventbriteAttendeeId ?? "(unknown)"}</li>
      </ul>
      <p><strong>Error:</strong> ${input.reason}</p>
      <p>Recommended action: contact attendee manually and run /api/admin/resend-access-email once corrected.</p>
    </div>
  `;

  const text = `Access email delivery failed\n\nAttendee email: ${input.attendeeEmail}\nAttendee name: ${input.attendeeName ?? "(unknown)"}\nEventbrite order: ${input.eventbriteOrderId ?? "(unknown)"}\nEventbrite attendee: ${input.eventbriteAttendeeId ?? "(unknown)"}\n\nError: ${input.reason}`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  const body = await res.text();
  if (!res.ok) return { ok: false as const, error: body };
  return { ok: true as const };
}
