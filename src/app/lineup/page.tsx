import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lineup",
  description:
    "Preview artists and set times for Denver Porchfest. Full running order coming soon.",
  alternates: { canonical: "/lineup" },
};

const lineup = [
  { name: "The Sidewalk Saints", genre: "Indie Folk", time: "12:00 PM" },
  { name: "Mile High Brass", genre: "Brass Funk", time: "1:15 PM" },
  { name: "Cherry Creek Revival", genre: "Alt Country", time: "2:30 PM" },
  { name: "Capitol Groove Co.", genre: "Soul / R&B", time: "3:45 PM" },
  { name: "Sunset on Colfax", genre: "Dream Pop", time: "5:00 PM" },
  { name: "Front Porch Finale", genre: "Community Jam", time: "6:30 PM" },
];

export default function LineupPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-14">
      <h1 className="text-3xl font-bold text-[#1f2937]">Denver Porchfest Lineup</h1>
      <p className="mt-3 text-[#4b5563]">
        Early lineup preview. Final stage-by-stage schedule will be posted as we
        get closer to October 10.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lineup.map((act) => (
          <article
            key={act.name}
            className="rounded-xl border border-[#e6dccb] bg-white p-4"
          >
            <p className="text-sm font-medium text-[#8b5e34]">{act.time}</p>
            <h2 className="mt-1 font-semibold text-[#1f2937]">{act.name}</h2>
            <p className="text-sm text-[#6b7280]">{act.genre}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
