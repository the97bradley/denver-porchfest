"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "saving" | "success" | "error";

export default function VolunteerSignupForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") || "").trim(),
      email: String(form.get("email") || "").trim(),
      phone: String(form.get("phone") || "").trim(),
      notes: String(form.get("notes") || "").trim(),
    };

    try {
      const res = await fetch("/api/volunteer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || !json.ok) {
        setStatus("error");
        setMessage(
          json.error || "Could not submit right now. Please try again shortly.",
        );
        return;
      }

      setStatus("success");
      setMessage("Thanks! You’re on the volunteer list.");
      event.currentTarget.reset();
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3 rounded-xl border border-[#d8cab3] bg-white p-5 shadow-sm"
    >
      <input
        name="name"
        required
        className="w-full rounded-lg border border-[#d8cab3] bg-[#fffdf8] px-3 py-2 text-[#1f2937] placeholder:text-[#9ca3af]"
        placeholder="Name"
      />
      <input
        name="email"
        required
        type="email"
        className="w-full rounded-lg border border-[#d8cab3] bg-[#fffdf8] px-3 py-2 text-[#1f2937] placeholder:text-[#9ca3af]"
        placeholder="Email"
      />
      <input
        name="phone"
        className="w-full rounded-lg border border-[#d8cab3] bg-[#fffdf8] px-3 py-2 text-[#1f2937] placeholder:text-[#9ca3af]"
        placeholder="Phone (optional)"
      />
      <textarea
        name="notes"
        rows={3}
        className="w-full rounded-lg border border-[#d8cab3] bg-[#fffdf8] px-3 py-2 text-[#1f2937] placeholder:text-[#9ca3af]"
        placeholder="Anything you want us to know (optional)"
      />
      <button
        type="submit"
        disabled={status === "saving"}
        className="w-full rounded-lg bg-[#3b7a57] px-4 py-2 font-semibold text-white transition hover:bg-[#2f6447] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "saving" ? "Submitting..." : "Join Volunteer List"}
      </button>

      {message ? (
        <p
          className={`text-sm ${
            status === "success" ? "text-[#3b7a57]" : "text-[#b91c1c]"
          }`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
