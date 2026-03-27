"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (
          element: HTMLElement,
          options: Record<string, unknown>,
        ) => unknown;
        Polygon: new (options: Record<string, unknown>) => {
          setMap: (map: unknown) => void;
        };
      };
    };
  }
}

const MAP_ID = "denver-porchfest-map";

export default function EventSnapshotMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !mapRef.current) return;

    const initMap = () => {
      if (!window.google || !mapRef.current) return;

      const center = { lat: 39.7208, lng: -104.9927 };
      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 14.5,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      const eventBoundary = [
        { lat: 39.7183, lng: -104.9872 }, // 1st & Broadway (approx)
        { lat: 39.7183, lng: -104.9988 }, // 1st & Santa Fe (approx)
        { lat: 39.7254, lng: -104.9988 }, // 5th & Santa Fe (approx)
        { lat: 39.7254, lng: -104.9872 }, // 5th & Broadway (approx)
      ];

      const polygon = new window.google.maps.Polygon({
        paths: eventBoundary,
        strokeColor: "#8B5E34",
        strokeOpacity: 0.95,
        strokeWeight: 2,
        fillColor: "#3B7A57",
        fillOpacity: 0.2,
      });

      polygon.setMap(map);
    };

    if (window.google?.maps) {
      initMap();
      return;
    }

    const existing = document.getElementById(MAP_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", initMap);
      return () => existing.removeEventListener("load", initMap);
    }

    const script = document.createElement("script");
    script.id = MAP_ID;
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.addEventListener("load", initMap);
    document.head.appendChild(script);

    return () => script.removeEventListener("load", initMap);
  }, []);

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <p className="mt-3 rounded-lg border border-[#eee4d3] bg-[#fffaf1] p-3 text-xs text-[#6b7280]">
        Add <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to enable the event area
        map overlay.
      </p>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-[#e6dccb] bg-white">
      <div ref={mapRef} className="h-80 w-full" />
    </div>
  );
}
