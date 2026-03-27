import Image from "next/image";
import EventSnapshotMap from "@/components/EventSnapshotMap";
import NeighborhoodCarousel from "@/components/NeighborhoodCarousel";
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

const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "MusicFestival",
  name: "Denver Porchfest",
  description:
    "A front-porch music day for Denver neighbors with local artists, neighborhood porches, and community partners.",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  startDate: "2026-10-10T12:00:00-06:00",
  endDate: "2026-10-10T20:00:00-06:00",
  isAccessibleForFree: true,
  location: {
    "@type": "Place",
    name: "Denver Porchfest Footprint",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Denver",
      addressRegion: "CO",
      addressCountry: "US",
    },
  },
  organizer: {
    "@type": "Organization",
    name: "Denver Porchfest",
    url: "https://denverporchfest.com",
  },
  url: "https://denverporchfest.com",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8f5ef] text-[#1f2937]">
      <header className="border-b border-[#d7cdbd] bg-[#fffaf1]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <p className="text-sm font-bold tracking-[0.16em] text-[#8b5e34]">
            DENVER PORCHFEST
          </p>
          <nav className="hidden items-center gap-4 text-sm text-[#4b5563] md:flex">
            <a href="/lineup" className="hover:text-[#1f2937]">Lineup</a>
            <a href="/volunteer" className="hover:text-[#1f2937]">Volunteer</a>
            <a href="/sponsors" className="hover:text-[#1f2937]">Sponsors</a>
          </nav>
          <a
            href="/volunteer"
            className="rounded-full bg-[#3b7a57] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2f6447]"
          >
            Volunteer
          </a>
        </div>
      </header>

      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
        />

        <section className="mx-auto w-full max-w-6xl px-6 pt-8">
          <div className="overflow-hidden rounded-2xl border border-[#d8cab3] bg-white shadow-sm">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/9/94/Sunrise_Over_Denver_Skyline.jpg"
              alt="Denver skyline at sunrise"
              className="h-52 w-full object-cover md:h-72"
              style={{ objectPosition: "50% calc(100% + 25px)" }}
              loading="eager"
            />
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:py-20">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8b5e34]">
              Saturday, October 10 · Denver, CO
            </p>
            <h1 className="text-4xl font-extrabold leading-tight text-[#1f2937] sm:text-5xl">
              A front-porch music day for Denver neighbors.
            </h1>
            <p className="max-w-xl text-lg text-[#4b5563]">
              Walk the blocks, meet your neighbors, discover local artists, and
              spend the day outside. Denver Porchfest is community-first,
              family-friendly, and free for everyone.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#lineup"
                className="rounded-full bg-[#1f2937] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#111827]"
              >
                See Lineup
              </a>
              <a
                href="#volunteer"
                className="rounded-full border border-[#c9b69d] bg-white px-5 py-3 text-sm font-bold text-[#374151] transition hover:bg-[#f3eee4]"
              >
                Join the Neighborhood Team
              </a>
            </div>
            <p className="text-sm text-[#6b7280]">
              Bring a lawn chair, walking shoes, and your favorite local coffee.
            </p>
          </div>

          <div className="rounded-2xl border border-[#d8cab3] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#8b5e34]">
              Event Snapshot
            </h2>
            <ul className="space-y-3 text-sm text-[#374151]">
              <li className="flex justify-between border-b border-[#eee4d3] pb-2">
                <span>Date</span>
                <span className="font-semibold">Saturday, October 10</span>
              </li>
              <li className="flex justify-between border-b border-[#eee4d3] pb-2">
                <span>Estimated Acts</span>
                <span className="font-semibold">100+ artists</span>
              </li>
              <li className="flex justify-between border-b border-[#eee4d3] pb-2">
                <span>Porches / Stages</span>
                <span className="font-semibold">15+ neighborhood sites</span>
              </li>
              <li className="flex justify-between border-b border-[#eee4d3] pb-2">
                <span>Area</span>
                <span className="font-semibold">Inside 1st–5th, Broadway to Santa Fe</span>
              </li>
              <li className="flex justify-between">
                <span>Admission</span>
                <span className="font-semibold text-[#3b7a57]">Free</span>
              </li>
            </ul>
            <EventSnapshotMap />
          </div>
        </section>

        <div className="mx-auto flex w-full max-w-6xl justify-center px-6 py-6">
          <Image
            src="/divider-porch.svg"
            alt="porch divider"
            width={120}
            height={20}
          />
        </div>

        <section id="lineup" className="border-y border-[#e3d8c5] bg-[#fffdf8]">
          <div className="mx-auto w-full max-w-6xl px-6 py-14">
            <h2 className="mb-2 text-2xl font-bold text-[#1f2937]">Lineup Preview</h2>
            <p className="mb-6 text-[#6b7280]">
              Expect a mix of neighborhood favorites, new local artists, and
              community collaborations across the day.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lineup.map((act) => (
                <article
                  key={act.name}
                  className="rounded-xl border border-[#e6dccb] bg-white p-4"
                >
                  <p className="text-sm font-medium text-[#8b5e34]">{act.time}</p>
                  <h3 className="mt-1 font-semibold text-[#1f2937]">{act.name}</h3>
                  <p className="text-sm text-[#6b7280]">{act.genre}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="schedule" className="mx-auto w-full max-w-6xl px-6 py-14">
          <h2 className="mb-2 text-2xl font-bold text-[#1f2937]">Neighborhood Porches</h2>
          <p className="mb-6 text-[#6b7280]">
            Think of each porch as a mini stage hosted by your neighbors,
            across the footprint between 1st & 5th Ave from Broadway to Santa
            Fe. Full map and timing will be posted closer to event day.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {venues.map((venue) => (
              <div
                key={venue.name}
                className="rounded-xl border border-[#e6dccb] bg-white p-5"
              >
                <div className="mb-2 flex items-center gap-2">
                  <Image
                    src="/icon-map-pin.svg"
                    alt="map pin"
                    width={18}
                    height={18}
                  />
                  <h3 className="font-semibold text-[#1f2937]">{venue.name}</h3>
                </div>
                <p className="mt-1 text-sm text-[#4b5563]">{venue.area}</p>
                <p className="mt-2 text-sm text-[#3b7a57]">
                  {venue.acts} scheduled acts
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="volunteer" className="border-y border-[#e3d8c5] bg-[#f2eadf]">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-14 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold text-[#1f2937]">Neighborhood Team</h2>
              <p className="mt-3 text-[#4b5563]">
                We’re looking for block captains, setup helpers, greeters,
                artist runners, and cleanup crew. If you care about community,
                there’s a role for you.
              </p>
            </div>
            <VolunteerSignupForm />
          </div>
        </section>

        <section id="applications" className="mx-auto w-full max-w-6xl px-6 py-14">
          <h2 className="text-2xl font-bold text-[#1f2937]">Be Part of Porchfest</h2>
          <p className="mt-3 max-w-3xl text-[#4b5563]">
            Whether you have a great porch or a great setlist, we’d love to
            hear from you.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-[#e6dccb] bg-white p-5">
              <h3 className="text-lg font-semibold text-[#1f2937]">Host Application</h3>
              <p className="mt-2 text-sm text-[#4b5563]">
                Open your porch, yard, or shared outdoor space to support local
                music in your neighborhood.
              </p>
              <a
                href={hostApplicationUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block rounded-full bg-[#1f2937] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#111827]"
              >
                Apply to Host
              </a>
            </article>

            <article className="rounded-xl border border-[#e6dccb] bg-white p-5">
              <h3 className="text-lg font-semibold text-[#1f2937]">Band Application</h3>
              <p className="mt-2 text-sm text-[#4b5563]">
                Submit your act for consideration in the 2026 Denver Porchfest
                lineup.
              </p>
              <a
                href={bandApplicationUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block rounded-full bg-[#3b7a57] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#2f6447]"
              >
                Apply as an Artist
              </a>
            </article>
          </div>
        </section>

        <section
          id="neighborhood"
          className="border-y border-[#e3d8c5] bg-[#fffdf8]"
        >
          <div className="mx-auto w-full max-w-6xl px-6 py-14">
            <h2 className="text-2xl font-bold text-[#1f2937]">The Neighborhood</h2>
            <p className="mt-3 max-w-3xl text-[#4b5563]">
              Bars, restaurants, and local gathering spots in the event area.
              Featured spots are within the event footprint (1st–5th, Broadway
              to Santa Fe) or within about a two-block buffer.
            </p>

            <div className="mt-6">
              <NeighborhoodCarousel />
            </div>
          </div>
        </section>

        <section id="sponsor" className="mx-auto w-full max-w-6xl px-6 pb-14">
          <h2 className="text-2xl font-bold text-[#1f2937]">Local Sponsors & Partners</h2>
          <p className="mt-3 max-w-2xl text-[#4b5563]">
            Porchfest is powered by neighborhood businesses, community groups,
            and local supporters who want to invest in Denver&apos;s creative scene.
          </p>
          <a
            href="mailto:sponsors@denverporchfest.com"
            className="mt-5 inline-block rounded-full border border-[#c9b69d] bg-white px-5 py-3 text-sm font-bold text-[#374151] transition hover:bg-[#f3eee4]"
          >
            Request Sponsorship Deck
          </a>
        </section>
      </main>

      <footer className="border-t border-[#d7cdbd] bg-[#fffaf1] py-8 text-center text-sm text-[#6b7280]">
        Denver Porchfest · Built with Next.js · Free-hosting ready
      </footer>
    </div>
  );
}
