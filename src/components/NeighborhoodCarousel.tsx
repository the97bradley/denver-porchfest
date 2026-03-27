"use client";

import { useMemo, useState } from "react";

type Spot = {
  name: string;
  type: string;
  note: string;
  mapsUrl: string;
};

const spots: Spot[] = [
  {
    name: "Town Hall Collaborative",
    type: "Food Hall & Bar",
    note: "High-traffic local gathering space near Broadway.",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Town+Hall+Collaborative+Denver",
  },
  {
    name: "Black Sky Brewery",
    type: "Brewery",
    note: "Neighborhood brewery and taproom close to Santa Fe.",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Black+Sky+Brewery+Denver",
  },
  {
    name: "Baker Market",
    type: "Market & Eatery",
    note: "Casual local stop for food and quick grabs.",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Baker+Market+Denver",
  },
  {
    name: "Smokin Yards BBQ",
    type: "Restaurant",
    note: "Classic BBQ option on the edge of the footprint.",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Smokin+Yards+BBQ+Denver",
  },
  {
    name: "Bar 404",
    type: "Bar",
    note: "Neighborhood bar option right off Broadway.",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Bar+404+Denver",
  },
  {
    name: "Postino Broadway",
    type: "Wine Cafe",
    note: "Popular patio and wine stop in the district.",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Postino+Broadway+Denver",
  },
  {
    name: "Adventure Time",
    type: "Bar",
    note: "Included per organizer list (please confirm final listing name).",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Adventure+Time+Denver+bar",
  },
  {
    name: "Sputnik",
    type: "Bar & Grill",
    note: "Longtime South Broadway neighborhood staple.",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Sputnik+Denver",
  },
  {
    name: "TRVE Brewing Company",
    type: "Brewery",
    note: "Local craft stop within the broader two-block buffer.",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=TRVE+Brewing+Company+Denver",
  },
  {
    name: "Historians Ale House",
    type: "Bar & Restaurant",
    note: "Large neighborhood pub space on South Broadway.",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Historians+Ale+House+Denver",
  },
  {
    name: "Illegal Pete’s (Broadway)",
    type: "Restaurant & Bar",
    note: "Fast, easy stop for festival foot traffic.",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Illegal+Petes+Broadway+Denver",
  },
  {
    name: "BAERE Brewing Company",
    type: "Brewery",
    note: "Small-batch neighborhood brewery near the event area.",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=BAERE+Brewing+Company+Denver",
  },
];

const colors = [
  "from-[#d7b38b] to-[#9f7f5a]",
  "from-[#b9cfba] to-[#7da07f]",
  "from-[#c8b6d9] to-[#8f75ac]",
  "from-[#b6cadf] to-[#6f8fb1]",
];

export default function NeighborhoodCarousel() {
  const perPage = 4;
  const pages = Math.ceil(spots.length / perPage);
  const [page, setPage] = useState(0);

  const visible = useMemo(
    () => spots.slice(page * perPage, page * perPage + perPage),
    [page],
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-[#8b5e34]">Showing {page * perPage + 1}-{Math.min((page + 1) * perPage, spots.length)} of {spots.length}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => (p - 1 + pages) % pages)}
            className="rounded-full border border-[#c9b69d] bg-white px-3 py-1 text-sm font-semibold text-[#374151] hover:bg-[#f3eee4]"
            aria-label="Previous businesses"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => (p + 1) % pages)}
            className="rounded-full border border-[#c9b69d] bg-white px-3 py-1 text-sm font-semibold text-[#374151] hover:bg-[#f3eee4]"
            aria-label="Next businesses"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((spot, index) => (
          <article
            key={spot.name}
            className="rounded-xl border border-[#e6dccb] bg-white p-4"
          >
            <div
              className={`mb-3 h-28 rounded-lg bg-gradient-to-br ${colors[(page * perPage + index) % colors.length]}`}
            />
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#8b5e34]">
              {spot.type}
            </p>
            <h3 className="mt-1 font-semibold text-[#1f2937]">{spot.name}</h3>
            <p className="mt-1 text-sm text-[#6b7280]">{spot.note}</p>
            <a
              href={spot.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm font-semibold text-[#3b7a57] hover:underline"
            >
              View on Google Maps
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
