import type { Metadata } from "next";
import VolunteerSignupForm from "@/components/VolunteerSignupForm";

export const metadata: Metadata = {
  title: "Volunteer",
  description:
    "Join the Denver Porchfest neighborhood team: block captains, setup helpers, greeters, and cleanup crew.",
  alternates: { canonical: "/volunteer" },
};

export default function VolunteerPage() {
  return (
    <main className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-14 md:grid-cols-2">
      <section>
        <h1 className="text-3xl font-bold text-[#1f2937]">Volunteer</h1>
        <p className="mt-3 text-[#4b5563]">
          Help make Porchfest happen. We&apos;re looking for block captains,
          setup crew, artist support, and cleanup helpers.
        </p>
      </section>
      <VolunteerSignupForm />
    </main>
  );
}
