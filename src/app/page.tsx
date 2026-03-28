import Image from "next/image";
import { groq } from "next-sanity";
import EventSnapshotMap from "@/components/EventSnapshotMap";
import NeighborhoodCarousel from "@/components/NeighborhoodCarousel";
import { hasSanityConfig } from "@/sanity/env";
import { sanityClient } from "@/sanity/lib/client";

const hostApplicationUrl =
  "https://docs.google.com/forms/d/e/1FAIpQLSd7XD6FEIOBmv6uYaSdJf8daQmZf2d54nl3Y6_qpMLz3532uQ/viewform?usp=pp_url";
const bandApplicationUrl =
  "https://docs.google.com/forms/d/1S-mjWFTPde5L7l3qbkOzy-jtTKCzqIQLMw0alEM5zAE/viewform";
const vendorHostApplicationUrl =
  "https://docs.google.com/forms/d/e/1FAIpQLSdFdtOr5p7PJ1zxT_roKwjgxFCcnhDG0yOmUBWUmKqv3-5Kow/viewform?usp=pp_url";
const vendorApplicationUrl =
  "https://forms.gle/REPLACE_WITH_VENDOR_APPLICATION_FORM";
const volunteerApplicationUrl =
  "https://forms.gle/REPLACE_WITH_VOLUNTEER_SIGNUP_FORM";

type EventSettings = {
  eventName?: string;
  eventDateLabel?: string;
  heroHeadline?: string;
  heroBody?: string;
  estimatedActs?: string;
  porchesStages?: string;
  areaLabel?: string;
};

const defaultEventSettings: Required<EventSettings> = {
  eventName: "Denver Porchfest",
  eventDateLabel: "Saturday, October 10 · Denver, CO",
  heroHeadline: "A front-porch music day for Denver neighbors.",
  heroBody:
    "Walk the blocks, meet your neighbors, discover local artists, and spend the day outside. Denver Porchfest is community-first, family-friendly, and free for everyone.",
  estimatedActs: "100+ artists",
  porchesStages: "15+ neighborhood sites",
  areaLabel: "Inside 1st–5th, Broadway to Santa Fe",
};

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

export default async function Home() {
  let cmsSettings: EventSettings | null = null;

  if (hasSanityConfig && sanityClient) {
    try {
      cmsSettings = await sanityClient.fetch<EventSettings | null>(
        groq`*[_type == "eventSettings"][0]{
          eventName,
          eventDateLabel,
          heroHeadline,
          heroBody,
          estimatedActs,
          porchesStages,
          areaLabel
        }`,
      );
    } catch {
      cmsSettings = null;
    }
  }

  const s = { ...defaultEventSettings, ...(cmsSettings || {}) };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f3f8ff] via-[#eef6ff] to-[#eaf4ff] text-[#1f2937]">
      <header className="border-b border-[#bfdbfe] bg-[#f8fbff]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <p className="text-base font-bold tracking-[0.08em] text-[#1d4ed8]">
            {s.eventName.toUpperCase()}
          </p>
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
              {s.heroBody}
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
                <span className="font-semibold">Saturday, October 10</span>
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
          <h2 className="text-2xl font-bold text-[#1f2937]">Be Part of Porchfest</h2>
          <p className="mt-3 max-w-3xl text-[#4b5563]">
            Whether you have a great outdoor space, a great setlist, or
            something interesting or tasty to sell, we&apos;d love for you to be
            involved.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            <article className="flex h-full flex-col rounded-xl border border-[#dbe7ff] bg-white p-5">
              <h3 className="text-lg font-semibold text-[#1f2937]">Music Host Application</h3>
              <p className="mt-2 flex-1 text-sm text-[#4b5563]">
                Open your porch, yard, or shared outdoor space to support local
                music in your neighborhood.
              </p>
              <a
                href={hostApplicationUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex w-fit rounded-full bg-[#1f2937] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#111827]"
              >
                Apply to Host Music
              </a>
            </article>

            <article className="flex h-full flex-col rounded-xl border border-[#dbe7ff] bg-white p-5">
              <h3 className="text-lg font-semibold text-[#1f2937]">Artist Application</h3>
              <p className="mt-2 flex-1 text-sm text-[#4b5563]">
                Submit your act for consideration in the 2026 Denver Porchfest
                lineup.
              </p>
              <a
                href={bandApplicationUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex w-fit rounded-full bg-[#3b7a57] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#2f6447]"
              >
                Apply as an Artist
              </a>
            </article>


            <article className="flex h-full flex-col rounded-xl border border-[#dbe7ff] bg-white p-5">
              <h3 className="text-lg font-semibold text-[#1f2937]">Vendor Application</h3>
              <p className="mt-2 flex-1 text-sm text-[#4b5563]">
                Food, art, goods, or pop-up experiences that fit Porchfest?
                Apply to be a featured vendor.
              </p>
              <a
                href={vendorApplicationUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex w-fit rounded-full bg-[#ea580c] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#c2410c]"
              >
                Apply as a Vendor
              </a>
            </article>
            <article className="flex h-full flex-col rounded-xl border border-[#dbe7ff] bg-white p-5">
              <h3 className="text-lg font-semibold text-[#1f2937]">Vendor Host Application</h3>
              <p className="mt-2 flex-1 text-sm text-[#4b5563]">
                Willing to host local vendors during the event? Let us know.
              </p>
              <a
                href={vendorHostApplicationUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex w-fit whitespace-nowrap rounded-full bg-[#7c3aed] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#6d28d9]"
              >
                Apply to Host Vendors
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
                className="mt-6 inline-flex w-fit rounded-full bg-[#3b7a57] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#2f6447]"
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
              <NeighborhoodCarousel />
            </div>
          </div>
        </section>

        <section id="sponsor" className="mx-auto w-full max-w-6xl px-6 py-14">
          <h2 className="text-2xl font-bold text-[#1f2937]">Local Sponsors & Partners</h2>
          <p className="mt-3 max-w-2xl text-[#4b5563]">
            Porchfest is powered by neighborhood businesses, community groups,
            and local supporters who want to invest in Denver&apos;s creative scene.
          </p>
          <a
            href="mailto:sponsors@denverporchfest.com"
            className="mt-5 inline-block rounded-full border border-[#bfdbfe] bg-white px-5 py-3 text-sm font-bold text-[#374151] transition hover:bg-[#eef5ff]"
          >
            Request Sponsorship Deck
          </a>
        </section>
      </main>

    </div>
  );
}
