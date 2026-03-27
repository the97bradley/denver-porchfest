import VolunteerSignupForm from "@/components/VolunteerSignupForm";

const lineup = [
  { name: "The Sidewalk Saints", genre: "Indie Folk", time: "12:00 PM" },
  { name: "Mile High Brass", genre: "Brass Funk", time: "1:15 PM" },
  { name: "Cherry Creek Revival", genre: "Alt Country", time: "2:30 PM" },
  { name: "Capitol Groove Co.", genre: "Soul / R&B", time: "3:45 PM" },
  { name: "Sunset on Colfax", genre: "Dream Pop", time: "5:00 PM" },
  { name: "Front Porch Finale", genre: "Community Jam", time: "6:30 PM" },
];

const venues = [
  { name: "Porch A", area: "Congress Park", acts: 3 },
  { name: "Porch B", area: "City Park West", acts: 4 },
  { name: "Porch C", area: "Capitol Hill", acts: 3 },
  { name: "Porch D", area: "Cheesman Park", acts: 4 },
];

const hostApplicationUrl =
  "https://forms.gle/REPLACE_WITH_HOST_APPLICATION_FORM";
const bandApplicationUrl =
  "https://forms.gle/REPLACE_WITH_BAND_APPLICATION_FORM";

export default function Home() {
  return (
    <div className="bg-neutral-950 text-neutral-100">
      <header className="border-b border-white/10 bg-neutral-950/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <p className="text-sm font-semibold tracking-[0.18em] text-emerald-300">
            DENVER PORCHFEST
          </p>
          <a
            href="#volunteer"
            className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-emerald-300"
          >
            Volunteer
          </a>
        </div>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
              October 2026 · Denver, CO
            </p>
            <h1 className="text-4xl font-black leading-tight sm:text-5xl">
              Music on porches.
              <br />
              Neighbors in the streets.
            </h1>
            <p className="max-w-xl text-lg text-neutral-300">
              A one-day neighborhood music festival connecting Denver artists,
              local businesses, and community blocks.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#lineup"
                className="rounded-full bg-white px-5 py-3 text-sm font-bold text-neutral-900 transition hover:bg-neutral-200"
              >
                See Lineup
              </a>
              <a
                href="#sponsor"
                className="rounded-full border border-white/30 px-5 py-3 text-sm font-bold transition hover:bg-white/10"
              >
                Become a Sponsor
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-2xl shadow-emerald-400/10">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Event Snapshot
            </h2>
            <ul className="space-y-3 text-sm text-neutral-200">
              <li className="flex justify-between border-b border-white/10 pb-2">
                <span>Date</span>
                <span className="font-semibold">Saturday, October 10</span>
              </li>
              <li className="flex justify-between border-b border-white/10 pb-2">
                <span>Estimated Acts</span>
                <span className="font-semibold">100+ artists</span>
              </li>
              <li className="flex justify-between border-b border-white/10 pb-2">
                <span>Porches / Stages</span>
                <span className="font-semibold">15+ neighborhood sites</span>
              </li>
              <li className="flex justify-between">
                <span>Admission</span>
                <span className="font-semibold text-emerald-300">Free</span>
              </li>
            </ul>
          </div>
        </section>

        <section id="lineup" className="border-y border-white/10 bg-neutral-900/60">
          <div className="mx-auto w-full max-w-6xl px-6 py-14">
            <h2 className="mb-6 text-2xl font-bold">Sample Lineup</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lineup.map((act) => (
                <article
                  key={act.name}
                  className="rounded-xl border border-white/10 bg-neutral-950 p-4"
                >
                  <p className="text-sm text-emerald-300">{act.time}</p>
                  <h3 className="mt-1 font-semibold">{act.name}</h3>
                  <p className="text-sm text-neutral-400">{act.genre}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="schedule" className="mx-auto w-full max-w-6xl px-6 py-14">
          <h2 className="mb-6 text-2xl font-bold">Neighborhood Porches</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {venues.map((venue) => (
              <div
                key={venue.name}
                className="rounded-xl border border-white/10 bg-neutral-900 p-5"
              >
                <h3 className="font-semibold">{venue.name}</h3>
                <p className="mt-1 text-sm text-neutral-300">{venue.area}</p>
                <p className="mt-2 text-sm text-emerald-300">
                  {venue.acts} scheduled acts
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="volunteer"
          className="border-y border-white/10 bg-gradient-to-r from-emerald-500/15 via-transparent to-cyan-500/10"
        >
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-14 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold">Volunteer with us</h2>
              <p className="mt-3 text-neutral-300">
                Help with artist support, wayfinding, setup, and neighborhood
                logistics. Perfect for music lovers who want to make Porchfest
                happen.
              </p>
            </div>
            <VolunteerSignupForm />
          </div>
        </section>

        <section id="applications" className="mx-auto w-full max-w-6xl px-6 py-14">
          <h2 className="text-2xl font-bold">Applications</h2>
          <p className="mt-3 max-w-3xl text-neutral-300">
            Interested in hosting a porch or performing as an artist? Apply
            using the forms below.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-white/10 bg-neutral-900 p-5">
              <h3 className="text-lg font-semibold">Host Application</h3>
              <p className="mt-2 text-sm text-neutral-300">
                Open your porch, yard, or shared outdoor space to support local
                music in your neighborhood.
              </p>
              <a
                href={hostApplicationUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block rounded-full bg-white px-4 py-2 text-sm font-bold text-neutral-900 transition hover:bg-neutral-200"
              >
                Apply to Host
              </a>
            </article>

            <article className="rounded-xl border border-white/10 bg-neutral-900 p-5">
              <h3 className="text-lg font-semibold">Band Application</h3>
              <p className="mt-2 text-sm text-neutral-300">
                Submit your act for consideration in the 2026 Denver Porchfest
                lineup.
              </p>
              <a
                href={bandApplicationUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block rounded-full bg-emerald-400 px-4 py-2 text-sm font-bold text-neutral-900 transition hover:bg-emerald-300"
              >
                Apply as an Artist
              </a>
            </article>
          </div>
        </section>

        <section id="sponsor" className="mx-auto w-full max-w-6xl px-6 py-14">
          <h2 className="text-2xl font-bold">Sponsors & Partners</h2>
          <p className="mt-3 max-w-2xl text-neutral-300">
            We&apos;re building a community-first event with support from local
            businesses. Sponsorship packages include stage mentions, web
            placement, and day-of activations.
          </p>
          <a
            href="mailto:sponsors@denverporchfest.com"
            className="mt-5 inline-block rounded-full border border-white/30 px-5 py-3 text-sm font-bold transition hover:bg-white/10"
          >
            Request Sponsorship Deck
          </a>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-neutral-400">
        Denver Porchfest · Built with Next.js · Free-hosting ready
      </footer>
    </div>
  );
}
