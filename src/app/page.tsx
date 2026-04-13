import Image from "next/image";
import EventSnapshotMap from "@/components/EventSnapshotMap";
import NeighborhoodCarousel, { type Spot } from "@/components/NeighborhoodCarousel";
import { getNeighborhoodSpots } from "@/lib/app-content";

const hostApplicationUrl =
  "https://docs.google.com/forms/d/1hZONc8KKvk603YW_So8A-0rJE1hCDzx5L_8iI3HjKRs/viewform";
const bandApplicationUrl =
  "https://docs.google.com/forms/d/1S-mjWFTPde5L7l3qbkOzy-jtTKCzqIQLMw0alEM5zAE/viewform";
const vendorApplicationUrl =
  "https://docs.google.com/forms/d/e/1FAIpQLSdGGqud2IjV89O56-1SNxvxg5SW1Ubai81aGt7Ucf4IgLAdmw/viewform?usp=publish-editor";
const volunteerApplicationUrl =
  "https://docs.google.com/forms/d/e/1FAIpQLSckxCBSKunojnMD4xJ6aPeT5kTfH2zpEGIpAtIogYNvz8yVhQ/viewform?usp=publish-editor";
const eventSettings = {
  eventName: "Denver PorchFest",
  eventDateLabel: "Saturday, September 5th · Denver, CO",
  heroHeadline: "A front-porch music day for Denver neighbors.",
  heroBody:
    "Walk the blocks, meet your neighbors, discover local artists, and spend the day outside. Denver PorchFest is community-first, family-friendly, and free for everyone.",
  estimatedActs: "50+ artists",
  porchesStages: "15+ neighborhood sites",
  areaLabel: "Inside 1st–5th, Broadway to Santa Fe",
};

const faqItems = [
  {
    question: "What does it cost to attend?",
    answer:
      "Your PorchFest ticket is $15 for the full day. It includes access to the official PorchFest app with full schedule and location listings, a free sticker and lanyard (while supplies last), plus day-of coupons to local restaurants and bars. Every ticket directly supports local musicians and helps keep Denver’s music scene thriving.",
  },
  {
    question: "Will the artists be paid??",
    answer:
      "We know how important it is to pay musicians a fair wage. 100% of PorchFest ticket revenue goes towards artist payouts, ensuring local music is alive and well in Denver.",
  },
  {
    question: "When and where is PorchFest happening?",
    answer:
      "PorchFest takes place on Saturday, September 5th across the Baker neighborhood footprint between 1st and 5th Ave from Broadway to Santa Fe.",
  },
  {
    question: "When will the lineup and set times be announced?",
    answer:
      "The lineup will be announced on August 7th. Check back on this site for updates.",
  },
  {
    question: "Can I apply as an artist, host, vendor, or volunteer?",
    answer:
      "Absolutely. Use the application links in the 'Be Part of PorchFest' section to apply in the category that fits you.",
  },
  {
    question: "Is the festival handicap accessible?",
    answer:
      "Yes — the event takes place on city sidewalks and most areas are accessible.",
  },
  {
    question: "Can I bring pets?",
    answer:
      "Friendly pets on leash are welcome, but please remember that streets will be crowded, the temperature may be hot, and music can be loud.",
  },
  {
    question: "What if it rains?",
    answer: "PorchFest is rain or shine!",
  },
  {
    question: "Where do I park?",
    answer:
      "Free neighborhood street parking is very limited, so rideshare is strongly encouraged. We are working on coordinating a free bike parking lot - check back soon for details.",
  },
  {
    question: "Is PorchFest family friendly?",
    answer:
      "Yes — PorchFest is designed to be a community-first, family-friendly day of local music and neighborhood connection.",
  },
] as const;

const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "MusicFestival",
  name: "Denver PorchFest",
  description:
    "A front-porch music day for Denver neighbors with local artists, neighborhood porches, and community partners.",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  startDate: "2026-09-05T12:00:00-06:00",
  endDate: "2026-09-05T20:00:00-06:00",
  isAccessibleForFree: true,
  location: {
    "@type": "Place",
    name: "Denver PorchFest Footprint",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Denver",
      addressRegion: "CO",
      addressCountry: "US",
    },
  },
  organizer: {
    "@type": "Organization",
    name: "Denver PorchFest",
    url: "https://denverporchfest.com",
  },
  url: "https://denverporchfest.com",
};

export default async function Home() {
  const s = eventSettings;
  const neighborhoodRows = await getNeighborhoodSpots();
  const neighborhoodSpots: Spot[] = neighborhoodRows.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type || "Neighborhood Spot",
    note: row.description || "Local neighborhood business.",
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${row.name} ${row.address ?? "Denver"}`)}`,
    photoQuery: `${row.name} Denver`,
    imageUrl: row.image || undefined,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f3f8ff] via-[#eef6ff] to-[#eaf4ff] text-[#1f2937]">
      <header className="border-b border-[#bfdbfe] bg-[#f8fbff]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <p className="text-base font-bold tracking-[0.08em] text-[#1d4ed8]">
            {s.eventName.toUpperCase()}
          </p>
          <a
            href="https://www.instagram.com/denverporchfest/"
            target="_blank"
            rel="noreferrer"
            aria-label="Follow Denver PorchFest on Instagram"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#dbe7ff] bg-white text-[#e1306c] transition hover:bg-[#fff1f7] hover:text-[#c2255c]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm0 2h10c1.65 0 3 1.35 3 3v10c0 1.65-1.35 3-3 3H7c-1.65 0-3-1.35-3-3V7c0-1.65 1.35-3 3-3zm11.5 1a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM12 7a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z" />
            </svg>
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
              className="hero-banner-image h-52 w-full object-cover md:h-72"
              loading="eager"
            />
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:py-20">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1d4ed8]">
              {s.eventDateLabel}
            </p>
            <h1 className="text-4xl font-extrabold leading-tight text-[#1f2937] sm:text-5xl">
              {s.heroHeadline}
            </h1>
            <p className="max-w-xl text-lg text-[#4b5563]">
              Welcome to the inaugural Denver PorchFest, a great opportunity to
              meet your neighbors, discover local artists and spend the day
              outside. Denver PorchFest is community first and family friendly.
              Tickets are $15 per person, with all revenue going directly toward paying local musicians.
              We will also be
              collecting donations and raising awareness for{" "}
              <a
                href="https://www.east7tharts.org/"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[#1d4ed8] underline decoration-[#93c5fd] underline-offset-2 hover:text-[#1e40af]"
              >
                East 7th Arts
              </a>
              , a local nonprofit which helps children with autism
              by providing art and music therapy.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#lineup"
                className="rounded-full bg-[#ea580c] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c2410c]"
              >
                See Lineup
              </a>
              <a
                href="#applications"
                className="rounded-full border border-[#f59e0b] bg-white px-5 py-3 text-sm font-bold text-[#374151] transition hover:bg-[#fff4d6]"
              >
                Join the Neighborhood Team
              </a>
            </div>

          </div>

          <div className="rounded-2xl border border-[#cfe0ff] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#2563eb]">
              Event Snapshot
            </h2>
            <ul className="space-y-3 text-sm text-[#374151]">
              <li className="flex justify-between border-b border-[#dbe7ff] pb-2">
                <span>Date</span>
                <span className="font-semibold">Saturday, September 5th · 12 PM - 7 PM</span>
              </li>
              <li className="flex justify-between border-b border-[#dbe7ff] pb-2">
                <span>Estimated Acts</span>
                <span className="font-semibold">{s.estimatedActs}</span>
              </li>
              <li className="flex justify-between border-b border-[#dbe7ff] pb-2">
                <span>Porches / Stages</span>
                <span className="font-semibold">{s.porchesStages}</span>
              </li>
              <li className="flex justify-between border-b border-[#dbe7ff] pb-2">
                <span>Area</span>
                <span className="font-semibold">{s.areaLabel}</span>
              </li>
              <li className="flex justify-between">
                <span>Admission</span>
                <span className="font-semibold text-[#3b7a57]">$15</span>
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

        <section id="lineup" className="border-y border-[#bfdbfe] bg-[#f4f9ff]">
          <div className="mx-auto w-full max-w-6xl px-6 py-14">
            <h2 className="mb-2 text-2xl font-bold text-[#1f2937]">Lineup Preview</h2>
            <p className="mb-6 text-[#6b7280]">
              Expect a mix of neighborhood favorites, new local artists, and
              community collaborations across the day.
            </p>
            <div className="rounded-xl border border-[#dbe7ff] bg-white p-6 text-center">
              <p className="text-lg font-semibold text-[#1f2937]">TBA</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                Full lineup and set times coming soon.
              </p>
            </div>
          </div>
        </section>

        <section id="schedule" className="mx-auto w-full max-w-6xl px-6 py-14">
          <h2 className="mb-2 text-2xl font-bold text-[#1f2937]">Neighborhood Porches</h2>
          <p className="mb-6 text-[#6b7280]">
            Think of each porch as a mini stage hosted by your neighbors,
            across the Baker neighborhood. Full map and timing will be posted
            closer to event day.
          </p>
          <div className="rounded-xl border border-[#dbe7ff] bg-white p-6 text-center">
            <p className="text-lg font-semibold text-[#1f2937]">TBA</p>
            <p className="mt-1 text-sm text-[#6b7280]">
              Porch locations and neighborhood stage details coming soon.
            </p>
          </div>
        </section>

        <section id="applications" className="mx-auto w-full max-w-6xl px-6 py-14">
          <h2 className="text-2xl font-bold text-[#1f2937]">Be Part of PorchFest</h2>
          <p className="mt-3 max-w-3xl text-[#4b5563]">
            Whether you have a great outdoor space, a great setlist, or
            something interesting or tasty to sell, we&apos;d love for you to be
            involved.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <article className="flex h-full flex-col rounded-xl border border-[#dbe7ff] bg-white p-5">
              <h3 className="text-lg font-semibold text-[#1f2937]">Artist Application</h3>
              <p className="mt-2 flex-1 text-sm text-[#4b5563]">
                Submit your act for consideration in the 2026 Denver PorchFest
                lineup.
              </p>
              <a
                href={bandApplicationUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex w-fit self-center rounded-full bg-[#3b7a57] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#2f6447]"
              >
                Apply as an Artist
              </a>
            </article>

            <article className="flex h-full flex-col rounded-xl border border-[#dbe7ff] bg-white p-5">
              <h3 className="text-lg font-semibold text-[#1f2937]">Host Application</h3>
              <p className="mt-2 flex-1 text-sm text-[#4b5563]">
                Open your porch, yard, or shared outdoor space to host music,
                vendors, or both.
              </p>
              <a
                href={hostApplicationUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex w-fit self-center rounded-full bg-[#1f2937] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#111827]"
              >
                Apply as a Host
              </a>
            </article>

            <article className="flex h-full flex-col rounded-xl border border-[#dbe7ff] bg-white p-5">
              <h3 className="text-lg font-semibold text-[#1f2937]">Vendor Application</h3>
              <p className="mt-2 flex-1 text-sm text-[#4b5563]">
                Food, art, or pop-up experiences that fit PorchFest?
                Apply to be a vendor.
              </p>
              <a
                href={vendorApplicationUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex w-fit self-center rounded-full bg-[#ea580c] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#c2410c]"
              >
                Apply as a Vendor
              </a>
            </article>

            <article className="flex h-full flex-col rounded-xl border border-[#dbe7ff] bg-white p-5">
              <h3 className="text-lg font-semibold text-[#1f2937]">Volunteer Sign Up</h3>
              <p className="mt-2 flex-1 text-sm text-[#4b5563]">
                Join the day-of team for setup, wayfinding, artist support, and cleanup.
              </p>
              <a
                href={volunteerApplicationUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex w-fit self-center rounded-full bg-[#3b7a57] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#2f6447]"
              >
                Sign Up to Volunteer
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
              Bars, restaurants, and local hangouts in and around the event
              area.
            </p>

            <div className="mt-6">
              <NeighborhoodCarousel spots={neighborhoodSpots} />
            </div>
          </div>
        </section>

        <section id="sponsor" className="mx-auto w-full max-w-6xl px-6 py-14">
          <h2 className="text-2xl font-bold text-[#1f2937]">Local Sponsors & Partners</h2>
          <p className="mt-3 max-w-3xl text-[#4b5563]">
            PorchFest is powered by neighborhood businesses, community groups,
            and local supporters who want to invest in Denver&apos;s creative scene.
            We are currently accepting both individual and business sponsors.
          </p>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[#4b5563]">
            <li>Brand visibility across event signage, website, and social media</li>
            <li>Direct connection with local music fans, families, and neighbors</li>
            <li>Support for free, community-centered arts programming in Denver</li>
          </ul>
          <p className="mt-5 text-sm text-[#4b5563]">
            To request sponsorship information, email us at{" "}
            <a
              href="mailto:info@denverporchfest.com"
              className="font-semibold text-[#1f2937] underline decoration-[#93c5fd] underline-offset-2"
            >
              info@denverporchfest.com
            </a>
            .
          </p>
        </section>

        <section id="faq" className="border-t border-[#bfdbfe] bg-[#f8fbff]">
          <div className="mx-auto w-full max-w-6xl px-6 py-14">
            <h2 className="text-3xl font-bold text-[#1f2937]">FAQ</h2>
            <p className="mt-3 max-w-2xl text-lg text-[#4b5563]">
              Quick answers to common PorchFest questions.
            </p>

            <div className="mt-6 space-y-3">
              {faqItems.map((item) => (
                <details
                  key={item.question}
                  className="rounded-xl border border-[#dbe7ff] bg-white p-4"
                >
                  <summary className="cursor-pointer list-none pr-6 text-lg font-semibold text-[#1f2937] [&::-webkit-details-marker]:hidden">
                    {item.question}
                  </summary>
                  <p className="mt-3 text-lg leading-8 text-[#4b5563]">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
