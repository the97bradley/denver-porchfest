"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

export type Spot = {
  id: string;
  name: string;
  type: string;
  note: string;
  mapsUrl: string;
  photoQuery: string;
  imageUrl?: string;
};

type NeighborhoodCarouselProps = {
  spots: Spot[];
};

const colors = [
  "from-[#d7b38b] to-[#9f7f5a]",
  "from-[#b9cfba] to-[#7da07f]",
  "from-[#c8b6d9] to-[#8f75ac]",
  "from-[#b6cadf] to-[#6f8fb1]",
];

const featuredSpotNames = new Set([
  "Sweet Action",
  "L.A. Lovely Vintage",
  "Full Afterburner Calzones",
  "FM",
  "Snooze, an A.M. Eatery",
  "Goldmine Vintage",
  "The Ten Penny Store",
  "The Wizard's Chest",
  "Explore Glass Gallery",
  "Be a Good Person HQ",
]);

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function NeighborhoodCarousel({ spots }: NeighborhoodCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [imageFailed, setImageFailed] = useState<Record<string, boolean>>({});
  const [visibleSpots, setVisibleSpots] = useState<Spot[]>([]);
  const [spotsReady, setSpotsReady] = useState(false);
  const [perPage, setPerPage] = useState(8);

  useEffect(() => {
    const syncPerPage = () => {
      if (typeof window === "undefined") return;
      setPerPage(window.innerWidth < 768 ? 3 : 8);
    };

    syncPerPage();
    window.addEventListener("resize", syncPerPage);
    return () => window.removeEventListener("resize", syncPerPage);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function filterClosedBusinesses() {
      const checks = await Promise.all(
        spots.map(async (spot) => {
          try {
            const res = await fetch(`/api/place-open?q=${encodeURIComponent(spot.photoQuery)}`);
            const json = (await res.json()) as { open?: boolean };
            return {
              spot,
              open: featuredSpotNames.has(spot.name) ? true : json.open !== false,
            };
          } catch {
            return { spot, open: true };
          }
        }),
      );

      if (cancelled) return;
      const openSpots = checks.filter((c) => c.open).map((c) => c.spot);
      setVisibleSpots(shuffleArray(openSpots));
      setSpotsReady(true);
    }

    filterClosedBusinesses();
    return () => {
      cancelled = true;
    };
  }, [spots]);

  const pages = useMemo(() => {
    const out: Spot[][] = [];
    for (let i = 0; i < visibleSpots.length; i += perPage) {
      out.push(visibleSpots.slice(i, i + perPage));
    }
    return out;
  }, [visibleSpots, perPage]);

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
      <div className="mb-4 hidden items-center justify-end md:flex">
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

      {!spotsReady ? (
        <p className="rounded-xl border border-[#dbe7ff] bg-white p-4 text-sm text-[#6b7280]">Loading local listings…</p>
      ) : visibleSpots.length === 0 ? (
        <p className="rounded-xl border border-[#dbe7ff] bg-white p-4 text-sm text-[#6b7280]">
          We&apos;re refreshing local listings right now. Check back shortly.
        </p>
      ) : (
        <div
          ref={trackRef}
          className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-visible scroll-smooth pt-1 pb-2"
        >
          {pages.map((pageSpots, pageIndex) => (
            <div key={pageIndex} className="w-full shrink-0 snap-start">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {pageSpots.map((spot, index) => (
                  <a
                    key={spot.id}
                    href={spot.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-full min-h-[250px] flex-col rounded-xl border border-[#dbe7ff] bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    {!imageFailed[spot.id] ? (
                      <div className="relative mb-3 h-28 overflow-hidden rounded-lg border border-[#dbe7ff]">
                        <Image
                          src={spot.imageUrl || `/api/business-photo?q=${encodeURIComponent(spot.photoQuery)}`}
                          alt={`${spot.name} storefront`}
                          fill
                          unoptimized
                          className="object-cover"
                          onError={() =>
                            setImageFailed((prev) => ({
                              ...prev,
                              [spot.id]: true,
                            }))
                          }
                        />
                      </div>
                    ) : (
                      <div className={`mb-3 h-28 rounded-lg bg-gradient-to-br ${colors[index % colors.length]}`} />
                    )}
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#2563eb]">{spot.type}</p>
                    <h3 className="mt-1 font-semibold text-[#1f2937]">{spot.name}</h3>
                    <p className="mt-1 min-h-[40px] text-sm text-[#6b7280]">{spot.note}</p>
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
