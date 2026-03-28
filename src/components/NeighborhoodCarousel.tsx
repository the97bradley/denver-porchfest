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
    note: "Popular gathering space.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Town+Hall+Collaborative+Denver",
    photoQuery: "Town Hall Collaborative Denver",
    imageUrl: "/businesses/town-hall-collaborative.webp",
  },
  {
    name: "Black Sky Brewery",
    type: "Brewery",
    note: "Brewery and taproom with rotating local beers.",
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
    note: "BBQ restaurant known for smoked meats and sides.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Smokin+Yards+BBQ+Denver",
    photoQuery: "Smokin Yards BBQ Denver",
    imageUrl: "/businesses/smokin-yards-bbq.webp",
  },
  {
    name: "Bar 404",
    type: "Bar",
    note: "Bar with cocktails, beer, and casual hangout vibes.",
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
    note: "Rotating-theme bar with creative drinks and a playful atmosphere.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Adventure+Time+Denver+bar",
    photoQuery: "Adventure Time bar Denver",
    imageUrl: "/businesses/adventure-time.webp",
  },
  {
    name: "Sputnik",
    type: "Bar & Grill",
    note: "Bar and grill with late-night bites and drinks.",
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
    note: "Large pub with beer selection and full food menu.",
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
    note: "Bar known for drinks and laid-back atmosphere.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=The+L+Denver",
    photoQuery: "The L Denver",
    imageUrl: "/businesses/the-l.webp",
  },
  {
    name: "Saint Mary Bar",
    type: "Bar",
    note: "Bar known for drinks and laid-back atmosphere.",
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
    name: "Sweet Action",
    type: "Ice Cream Shop",
    note: "Local ice cream shop on South Broadway.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Sweet+Action+Denver",
    photoQuery: "Sweet Action Denver",
    imageUrl:
      "https://lh3.googleusercontent.com/gps-cs-s/AHVAwerse8DhYD-wm97U3lvFC0DYGOXN_7hF0JEF8NgxVuW1hhWWDd8pJAlb0ONBjD6hq7xMVZ7ykVmYXhlK_y7-3foHXRoTISt6xatGJyOlp4nnrFon_HXViQXKll6Ne3WlWLrvug_Dyg=s1360-w1360-h1020-rw",
  },
  {
    name: "L.A. Lovely Vintage",
    type: "Vintage Shop",
    note: "Vintage clothing and curated finds in the neighborhood.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=LA+Lovely+Vintage+Denver",
    photoQuery: "LA Lovely Vintage Denver",
    imageUrl:
      "https://lh3.googleusercontent.com/gps-cs-s/AHVAwerz7sW-Q4gye5Qs_je8W7Y2RsJmRugF7LW5qOBAkwFTV1J3ZhygJtOLUxY6OYRajoae8b1VwfmaHaOYiDjw6DZDxX6cOZgBGDjkn0bKitz5d0oxrILVlTfEOz1G7mi4mj3s-Hz4ww=s1360-w1360-h1020-rw",
  },
  {
    name: "Full Afterburner Calzones",
    type: "Restaurant",
    note: "Calzone spot serving hearty, hand-crafted options.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Full+Afterburner+Calzones+Denver",
    photoQuery: "Full Afterburner Calzones Denver",
    imageUrl:
      "https://lh3.googleusercontent.com/p/AF1QipMM-rQKRXxgN6QEP5eHnhlHntNtddbrW3r8y0Tw=s1360-w1360-h1020-rw",
  },
  {
    name: "FM",
    type: "Local Spot",
    note: "Featured neighborhood stop.",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=FM+Denver",
    photoQuery: "FM Denver",
    imageUrl:
      "https://lh3.googleusercontent.com/p/AF1QipM4Z7HJX059YpWS_flcg3Cj3Ixe2ngazR-IVW5H=s1360-w1360-h1020-rw",
  },
  {
    name: "Snooze, an A.M. Eatery",
    type: "Breakfast Restaurant",
    note: "Popular brunch and breakfast spot.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Snooze,+an+A.M.+Eatery+Denver",
    photoQuery: "Snooze, an A.M. Eatery Denver",
    imageUrl:
      "https://lh3.googleusercontent.com/gps-cs-s/AHVAwer6ILMs5cfrJdPPsP_ohuxjd2Rw4bXdIZ4LbTqWilj43PZGlifp0zy1Tgkrm_7ftyy6NxsY1dfqA9V4KJLLjw5N0-WgwRcQMxPTIs2pwhmMpjg1VpxekprVL9h6eAQkv_1U6lZ3=s1360-w1360-h1020-rw",
  },
  {
    name: "Goldmine Vintage",
    type: "Vintage Shop",
    note: "Vintage shop with curated apparel and accessories.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Goldmine+Vintage+Denver",
    photoQuery: "Goldmine Vintage Denver",
    imageUrl:
      "https://lh3.googleusercontent.com/gps-cs-s/AHVAweqtNRH-OLT1jzAijN0JNHJZS3NrvXQ1nNK4ZR0v5RZ1cgPSweFKKLnD9FLx3ZDfya976rwgfGL-7Bchz6amRGDJqL4zgXsOjqjKhFHXugUE6xyVfYdWXnorKKz5nM_ehCm0tsKO=s1360-w1360-h1020-rw",
  },
  {
    name: "Huckleberry Roasters",
    type: "Coffee Roaster",
    note: "Coffee roaster and cafe for espresso and pastries.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Huckleberry+Roasters+Denver",
    photoQuery: "Huckleberry Roasters Denver",
    imageUrl: "/businesses/huckleberry-roasters.webp",
  },
  {
    name: "MiddleState Coffee",
    type: "Coffee Shop",
    note: "Specialty coffee shop with house-roasted beans.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=MiddleState+Coffee+Denver",
    photoQuery: "MiddleState Coffee Denver",
    imageUrl: "/businesses/middlestate-coffee.webp",
  },
  {
    name: "Walter's303 Pizzeria & Publik House",
    type: "Pizzeria & Pub",
    note: "Pizza spot with drinks and casual dine-in seating.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Walter%27s303+Pizzeria+%26+Publik+House+Denver",
    photoQuery: "Walter's303 Pizzeria & Publik House Denver",
    imageUrl: "/businesses/walters-303.webp",
  },
  {
    name: "The Argentos Empanadas",
    type: "Restaurant",
    note: "Casual dining spot with a full-service menu.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=The+Argentos+Empanadas+Denver",
    photoQuery: "The Argentos Empanadas Denver",
    imageUrl: "/businesses/the-argentos.webp",
  },
  {
    name: "Pho Social",
    type: "Restaurant",
    note: "Vietnamese-focused menu with soups, noodles, and shareables.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Pho+Social+Denver",
    photoQuery: "Pho Social Denver",
    imageUrl: "/businesses/pho-social.webp",
  },
  {
    name: "Dae Gee Korean BBQ",
    type: "Restaurant",
    note: "Korean BBQ restaurant with grilled meats and classic sides.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Dae+Gee+Korean+BBQ+Denver",
    photoQuery: "Dae Gee Korean BBQ Denver",
    imageUrl: "/businesses/dae-gee-korean-bbq.webp",
  },
  {
    name: "SPACE Gallery",
    type: "Gallery",
    note: "Contemporary art gallery and event space.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=SPACE+Gallery+Denver",
    photoQuery: "SPACE Gallery Denver",
    imageUrl: "/businesses/space-gallery.webp",
  },
  {
    name: "Ti Cafe",
    type: "Cafe",
    note: "Cafe with coffee, tea, and light Vietnamese bites.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Ti+Cafe+Denver",
    photoQuery: "Ti Cafe Denver",
    imageUrl: "/businesses/ti-cafe.webp",
  },
  {
    name: "Trade",
    type: "Bar",
    note: "Cocktail-focused bar with lounge-style seating.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Trade+Denver",
    photoQuery: "Trade Denver",
    imageUrl: "/businesses/trade.webp",
  },
  {
    name: "Miya Moon",
    type: "Restaurant",
    note: "Asian-inspired restaurant with a modern casual menu.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Miya+Moon+Denver",
    photoQuery: "Miya Moon Denver",
    imageUrl: "/businesses/miya-moon.webp",
  },
  {
    name: "Lucky Noodles",
    type: "Restaurant",
    note: "Noodle-focused spot with quick, flavorful bowls.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Lucky+Noodles+Denver",
    photoQuery: "Lucky Noodles Denver",
    imageUrl: "/businesses/lucky-noodles.webp",
  },
  {
    name: "MAKfam",
    type: "Restaurant",
    note: "Modern Chinese restaurant with shareable plates.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=MAKfam+Denver",
    photoQuery: "MAKfam Denver",
    imageUrl: "/businesses/makfam.webp",
  },
  {
    name: "Moxie Eatery",
    type: "Cafe",
    note: "All-day cafe with breakfast, sandwiches, and coffee.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Moxie+Eatery+Denver",
    photoQuery: "Moxie Eatery Denver",
    imageUrl: "/businesses/moxie-eatery.webp",
  },
  {
    name: "Brewery Bar II",
    type: "Restaurant & Bar",
    note: "Classic Mexican restaurant with margaritas and casual dining.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Brewery+Bar+II+Denver",
    photoQuery: "Brewery Bar II Denver",
    imageUrl: "/businesses/brewery-bar-ii.webp",
  },
  {
    name: "Moonrise Coffee Roasters",
    type: "Coffee Roaster",
    note: "Coffee roaster and cafe with espresso and pastries.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Moonrise+Coffee+Roasters+Denver",
    photoQuery: "Moonrise Coffee Roasters Denver",
    imageUrl: "/businesses/moonrise-coffee-roasters.webp",
  },
];

const colors = [
  "from-[#d7b38b] to-[#9f7f5a]",
  "from-[#b9cfba] to-[#7da07f]",
  "from-[#c8b6d9] to-[#8f75ac]",
  "from-[#b6cadf] to-[#6f8fb1]",
];


function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function NeighborhoodCarousel() {
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
      setVisibleSpots(
        shuffleArray(checks.filter((c) => c.open).map((c) => c.spot)),
      );
      setSpotsReady(true);
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
        <p className="rounded-xl border border-[#dbe7ff] bg-white p-4 text-sm text-[#6b7280]">
          Loading local listings…
        </p>
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
                    key={spot.name}
                    href={spot.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-full min-h-[250px] flex-col rounded-xl border border-[#dbe7ff] bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
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
