import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sponsors",
  description:
    "Partner with Denver PorchFest as a neighborhood business or community sponsor.",
  alternates: { canonical: "/sponsors" },
};

export default function SponsorsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-14">
      <h1 className="text-3xl font-bold text-[#1f2937]">Sponsors & Partners</h1>
      <p className="mt-3 max-w-3xl text-[#4b5563]">
        Denver PorchFest is powered by local businesses and community partners.
        Sponsorship includes web placement, day-of visibility, and support for
        local artists.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href="mailto:sponsors@denverporchfest.com"
          className="inline-block rounded-full border border-[#bfdbfe] bg-white px-5 py-3 text-sm font-bold text-[#374151] transition hover:bg-[#eef5ff]"
        >
          Request Sponsorship Deck
        </a>
      </div>
    </main>
  );
}
