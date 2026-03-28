"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type Spot = {
  name: string;
  type: string;
  note: string;
  mapsUrl: string;
  photoQuery: string;
  imageUrl?: string;
};

const spots: Spot[] = [
  {
    name: "Town Hall Collaborative",
    type: "Food Hall & Bar",
    note: "Popular neighborhood gathering space.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Town+Hall+Collaborative+Denver",
    photoQuery: "Town Hall Collaborative Denver",
    imageUrl: "/businesses/town-hall-collaborative.webp",
  },
  {
    name: "Black Sky Brewery",
    type: "Brewery",
    note: "Neighborhood brewery and taproom.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Black+Sky+Brewery+Denver",
    photoQuery: "Black Sky Brewery Denver",
    imageUrl: "/businesses/black-sky-brewery.webp",
  },
  {
    name: "Novel Strand Brewery",
    type: "Brewery",
    note: "Local craft brewery.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Novel+Strand+Brewery+Denver",
    photoQuery: "Novel Strand Brewery Denver",
    imageUrl: "/businesses/novel-strand-brewery.webp",
  },
  {
    name: "Baker Market",
    type: "Market & Eatery",
    note: "Casual local stop for food and quick grabs.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Baker+Market+Denver",
    photoQuery: "Baker Market Denver",
    imageUrl: "/businesses/baker-market.webp",
  },
  {
    name: "Smokin Yards BBQ",
    type: "Restaurant",
    note: "Classic BBQ spot.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Smokin+Yards+BBQ+Denver",
    photoQuery: "Smokin Yards BBQ Denver",
    imageUrl: "/businesses/smokin-yards-bbq.webp",
  },
  {
    name: "Bar 404",
    type: "Bar",
    note: "Neighborhood bar option.",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Bar+404+Denver",
    photoQuery: "Bar 404 Denver",
    imageUrl: "/businesses/bar-404.webp",
  },
  {
    name: "Postino Broadway",
    type: "Wine Cafe",
    note: "Popular patio and wine stop.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Postino+Broadway+Denver",
    photoQuery: "Postino Broadway Denver",
    imageUrl: "/businesses/postino-broadway.webp",
  },
  {
    name: "Adventure Time",
    type: "Bar",
    note: "Included per organizer list (please confirm final listing name).",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Adventure+Time+Denver+bar",
    photoQuery: "Adventure Time bar Denver",
    imageUrl: "/businesses/adventure-time.webp",
  },
  {
    name: "Sputnik",
    type: "Bar & Grill",
    note: "Longtime neighborhood staple.",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Sputnik+Denver",
    photoQuery: "Sputnik Denver",
    imageUrl: "/businesses/sputnik.webp",
  },
  {
    name: "TRVE Brewing Company",
    type: "Brewery",
    note: "Local craft stop.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=TRVE+Brewing+Company+Denver",
    photoQuery: "TRVE Brewing Company Denver",
    imageUrl: "/businesses/trve-brewing-company.webp",
  },
  {
    name: "Historians Ale House",
    type: "Bar & Restaurant",
    note: "Large neighborhood pub space.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Historians+Ale+House+Denver",
    photoQuery: "Historians Ale House Denver",
    imageUrl: "/businesses/historians-ale-house.webp",
  },
  {
    name: "Punch Bowl Social",
    type: "Restaurant & Bar",
    note: "Food, drinks, and activities in a lively social setting.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Punch+Bowl+Social+Denver",
    photoQuery: "Punch Bowl Social Denver",
    imageUrl: "/businesses/punch-bowl-social.webp",
  },
  {
    name: "The L",
    type: "Bar",
    note: "Neighborhood bar stop.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=The+L+Denver",
    photoQuery: "The L Denver",
    imageUrl: "/businesses/the-l.webp",
  },
  {
    name: "Saint Mary Bar",
    type: "Bar",
    note: "Neighborhood bar stop.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Saint+Mary+Bar+Denver",
    photoQuery: "Saint Mary Bar Denver",
    imageUrl: "/businesses/saint-mary-bar.webp",
  },
  {
    name: "Parlor Donuts",
    type: "Cafe",
    note: "Popular sweets and coffee stop.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Parlor+Donuts+Denver",
    photoQuery: "Parlor Donuts Denver",
    imageUrl: "/businesses/parlor-donuts.webp",
  },
  {
    name: "Huckleberry Roasters",
    type: "Coffee Roaster",
    note: "Neighborhood coffee stop.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Huckleberry+Roasters+Denver",
    photoQuery: "Huckleberry Roasters Denver",
    imageUrl: "/businesses/huckleberry-roasters.webp",
  },
  {
    name: "MiddleState Coffee",
    type: "Coffee Shop",
    note: "Specialty coffee and neighborhood cafe atmosphere.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=MiddleState+Coffee+Denver",
    photoQuery: "MiddleState Coffee Denver",
    imageUrl: "/businesses/middlestate-coffee.webp",
  },
];

const colors = [
  "from-[#d7b38b] to-[#9f7f5a]",
  "from-[#b9cfba] to-[#7da07f]",
  "from-[#c8b6d9] to-[#8f75ac]",
  "from-[#b6cadf] to-[#6f8fb1]",
];

export default function NeighborhoodCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [imageFailed, setImageFailed] = useState<Record<string, boolean>>({});
  const [visibleSpots, setVisibleSpots] = useState<Spot[]>(spots);

  const perPage = 8;

  useEffect(() => {
    let cancelled = false;

    async function filterClosedBusinesses() {
      const checks = await Promise.all(
        spots.map(async (spot) => {
          try {
            const res = await fetch(
              `/api/place-open?q=${encodeURIComponent(spot.photoQuery)}`,
            );
            const json = (await res.json()) as { open?: boolean };
            return { spot, open: json.open !== false };
          } catch {
            return { spot, open: true };
          }
        }),
      );

      if (cancelled) return;
      setVisibleSpots(checks.filter((c) => c.open).map((c) => c.spot));
    }

    filterClosedBusinesses();

    return () => {
      cancelled = true;
    };
  }, []);

  const pages = useMemo(() => {
    const out: Spot[][] = [];
    for (let i = 0; i < visibleSpots.length; i += perPage) {
      out.push(visibleSpots.slice(i, i + perPage));
    }
    return out;
  }, [visibleSpots]);

  function slide(direction: "prev" | "next") {
    if (!trackRef.current) return;
    const amount = trackRef.current.clientWidth;
    trackRef.current.scrollBy({
      left: direction === "next" ? amount : -amount,
      behavior: "smooth",
    });
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => slide("prev")}
            className="rounded-full border border-[#bfdbfe] bg-white px-3 py-1 text-sm font-semibold text-[#374151] hover:bg-[#eef5ff]"
            aria-label="Previous businesses"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => slide("next")}
            className="rounded-full border border-[#bfdbfe] bg-white px-3 py-1 text-sm font-semibold text-[#374151] hover:bg-[#eef5ff]"
            aria-label="Next businesses"
          >
            →
          </button>
        </div>
      </div>

      {visibleSpots.length === 0 ? (
        <p className="rounded-xl border border-[#dbe7ff] bg-white p-4 text-sm text-[#6b7280]">
          We&apos;re refreshing local listings right now. Check back shortly.
        </p>
      ) : (
        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
        >
          {pages.map((pageSpots, pageIndex) => (
            <div key={pageIndex} className="w-full shrink-0 snap-start">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {pageSpots.map((spot, index) => (
                  <a
                    key={spot.name}
                    href={spot.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-xl border border-[#dbe7ff] bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    {!imageFailed[spot.name] ? (
                      <div className="relative mb-3 h-28 overflow-hidden rounded-lg border border-[#dbe7ff]">
                        <Image
                          src={
                            spot.imageUrl ||
                            `/api/business-photo?q=${encodeURIComponent(
                              spot.photoQuery,
                            )}`
                          }
                          alt={`${spot.name} storefront`}
                          fill
                          unoptimized
                          className="object-cover"
                          onError={() =>
                            setImageFailed((prev) => ({
                              ...prev,
                              [spot.name]: true,
                            }))
                          }
                        />
                      </div>
                    ) : (
                      <div
                        className={`mb-3 h-28 rounded-lg bg-gradient-to-br ${
                          colors[index % colors.length]
                        }`}
                      />
                    )}
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#2563eb]">
                      {spot.type}
                    </p>
                    <h3 className="mt-1 font-semibold text-[#1f2937]">
                      {spot.name}
                    </h3>
                    <p className="mt-1 text-sm text-[#6b7280]">{spot.note}</p>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
