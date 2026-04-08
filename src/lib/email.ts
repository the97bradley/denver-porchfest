type AccessEmailInput = {
  to: string;
  firstName?: string;
  tokenUrl: string;
  accessCode: string;
};

export async function sendAccessEmail(input: AccessEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ACCESS_EMAIL_FROM ?? "Denver PorchFest <info@denverporchfest.com>";

  if (!apiKey) {
    return { ok: false as const, error: "Missing RESEND_API_KEY" };
  }

  const first = input.firstName?.trim() || "there";
  const subject = "Your Denver PorchFest app access";
  const html = `
    <div style="font-family: Arial, sans-serif; color:#1f2937; line-height:1.5;">
      <p>Hey ${first},</p>
      <p>Thanks for supporting Denver PorchFest. Your app access is ready.</p>
      <p>
        <a href="${input.tokenUrl}" style="display:inline-block;padding:10px 14px;background:#1d4ed8;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
          Open PorchFest App Access
        </a>
      </p>
      <p><strong>Backup access code:</strong> ${input.accessCode}</p>
      <p>If the button doesn't work, copy and paste this link:</p>
      <p><a href="${input.tokenUrl}">${input.tokenUrl}</a></p>
      <p>— Denver PorchFest</p>
    </div>
  `;

  const text = `Hey ${first},\n\nThanks for supporting Denver PorchFest. Your app access is ready.\n\nOpen link: ${input.tokenUrl}\nBackup access code: ${input.accessCode}\n\n— Denver PorchFest`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject,
      html,
      text,
    }),
  });

  const body = await res.text();
  if (!res.ok) {
    return { ok: false as const, error: body };
  }

  return { ok: true as const, response: body };
}
