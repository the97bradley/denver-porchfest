import { defineField, defineType } from "sanity";

export const neighborhoodSpotType = defineType({
  name: "neighborhoodSpot",
  title: "Neighborhood Spot",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "type", title: "Type", type: "string" }),
    defineField({ name: "note", title: "Short Note", type: "text", rows: 2 }),
    defineField({ name: "mapsUrl", title: "Google Maps URL", type: "url" }),
    defineField({ name: "photoQuery", title: "Photo Query", type: "string" }),
    defineField({ name: "featured", title: "Featured", type: "boolean", initialValue: true }),
    defineField({ name: "sortOrder", title: "Sort Order", type: "number" }),
  ],
  orderings: [
    { title: "Sort Order", name: "sortOrderAsc", by: [{ field: "sortOrder", direction: "asc" }] },
  ],
  preview: {
    select: { title: "name", subtitle: "type" },
  },
});
