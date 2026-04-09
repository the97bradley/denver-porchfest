type OpsAlertInput = {
  subject: string;
  message: string;
};

export async function sendOpsAlert(input: OpsAlertInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ACCESS_EMAIL_FROM ?? "Denver PorchFest <info@denverporchfest.com>";
  const to = process.env.ACCESS_ALERT_TO ?? "info@denverporchfest.com";

  if (!apiKey || !to) return { ok: false as const, error: "Missing RESEND_API_KEY or ACCESS_ALERT_TO" };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: input.subject,
      text: input.message,
      html: `<pre style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; white-space: pre-wrap;">${input.message}</pre>`,
    }),
  });

  const body = await res.text();
  if (!res.ok) return { ok: false as const, error: body };
  return { ok: true as const };
}
