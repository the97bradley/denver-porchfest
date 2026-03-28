"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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
    note: "High-traffic local gathering space near Broadway.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Town+Hall+Collaborative+Denver",
    photoQuery: "Town Hall Collaborative Denver",
    imageUrl: "/businesses/town-hall-collaborative.webp",
  },
  {
    name: "Black Sky Brewery",
    type: "Brewery",
    note: "Neighborhood brewery and taproom close to Santa Fe.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Black+Sky+Brewery+Denver",
    photoQuery: "Black Sky Brewery Denver",
    imageUrl: "/businesses/black-sky-brewery.webp",
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
    note: "Classic BBQ option on the edge of the footprint.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Smokin+Yards+BBQ+Denver",
    photoQuery: "Smokin Yards BBQ Denver",
    imageUrl: "/businesses/smokin-yards-bbq.webp",
  },
  {
    name: "Bar 404",
    type: "Bar",
    note: "Neighborhood bar option right off Broadway.",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Bar+404+Denver",
    photoQuery: "Bar 404 Denver",
    imageUrl: "/businesses/bar-404.webp",
  },
  {
    name: "Postino Broadway",
    type: "Wine Cafe",
    note: "Popular patio and wine stop in the district.",
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
    note: "Longtime South Broadway neighborhood staple.",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Sputnik+Denver",
    photoQuery: "Sputnik Denver",
    imageUrl: "/businesses/sputnik.webp",
  },
  {
    name: "TRVE Brewing Company",
    type: "Brewery",
    note: "Local craft stop within the broader two-block buffer.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=TRVE+Brewing+Company+Denver",
    photoQuery: "TRVE Brewing Company Denver",
  },
  {
    name: "Historians Ale House",
    type: "Bar & Restaurant",
    note: "Large neighborhood pub space on South Broadway.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Historians+Ale+House+Denver",
    photoQuery: "Historians Ale House Denver",
  },
  {
    name: "Illegal Pete’s (Broadway)",
    type: "Restaurant & Bar",
    note: "Fast, easy stop for festival foot traffic.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Illegal+Petes+Broadway+Denver",
    photoQuery: "Illegal Petes Broadway Denver",
  },
  {
    name: "BAERE Brewing Company",
    type: "Brewery",
    note: "Small-batch neighborhood brewery near the event area.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=BAERE+Brewing+Company+Denver",
    photoQuery: "BAERE Brewing Company Denver",
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

  function slide(direction: "prev" | "next") {
    if (!trackRef.current) return;
    const amount = trackRef.current.clientWidth * 0.92;
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
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pt-1 pb-2"
        >
          {visibleSpots.map((spot, index) => (
            <a
              key={spot.name}
              href={spot.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="block w-[85%] shrink-0 snap-start rounded-xl border border-[#dbe7ff] bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-sm sm:w-[48%] lg:w-[calc((100%-3rem)/4)]"
            >
              {!imageFailed[spot.name] ? (
                <div className="relative mb-3 h-28 overflow-hidden rounded-lg border border-[#dbe7ff]">
                  <Image
                    src={
                      spot.imageUrl ||
                      `/api/business-photo?q=${encodeURIComponent(spot.photoQuery)}`
                    }
                    alt={`${spot.name} storefront`}
                    fill
                    unoptimized
                    className="object-cover"
                    onError={() =>
                      setImageFailed((prev) => ({ ...prev, [spot.name]: true }))
                    }
                  />
                </div>
              ) : (
                <div
                  className={`mb-3 h-28 rounded-lg bg-gradient-to-br ${colors[index % colors.length]}`}
                />
              )}
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#2563eb]">
                {spot.type}
              </p>
              <h3 className="mt-1 font-semibold text-[#1f2937]">{spot.name}</h3>
              <p className="mt-1 text-sm text-[#6b7280]">{spot.note}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
