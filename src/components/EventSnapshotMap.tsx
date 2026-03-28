"use client";

const PUBLIC_BOUNDARY_MAP_URL =
  "https://www.google.com/maps/d/viewer?mid=1kMz1441dwvdGMiIVmdIYmaqobOUzFQ4&ll=39.7209%2C-104.9929&z=14.6";

const EMBED_BOUNDARY_MAP_URL =
  "https://www.google.com/maps/d/embed?mid=1kMz1441dwvdGMiIVmdIYmaqobOUzFQ4&ll=39.7209%2C-104.9929&z=14.6";

export default function EventSnapshotMap() {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-[#dbe7ff] bg-white">
      <iframe
        title="Denver PorchFest Full Map"
        src={EMBED_BOUNDARY_MAP_URL}
        className="h-80 w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="border-t border-[#dbe7ff] bg-[#f8fbff] p-3">
        <a
          href={PUBLIC_BOUNDARY_MAP_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-full border border-[#bfdbfe] bg-white px-4 py-2 text-xs font-semibold text-[#1f2937] transition hover:bg-[#eef5ff]"
        >
          Open Full Map
        </a>
      </div>
    </div>
  );
}
