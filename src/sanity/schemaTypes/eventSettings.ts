import { defineField, defineType } from "sanity";

export const eventSettingsType = defineType({
  name: "eventSettings",
  title: "Event Settings",
  type: "document",
  fields: [
    defineField({
      name: "eventName",
      title: "Event Name",
      type: "string",
      initialValue: "Denver Porchfest",
    }),
    defineField({
      name: "eventDateLabel",
      title: "Event Date Label",
      type: "string",
      initialValue: "Saturday, October 10 · Denver, CO",
    }),
    defineField({
      name: "heroHeadline",
      title: "Hero Headline",
      type: "string",
      initialValue: "A front-porch music day for Denver neighbors.",
    }),
    defineField({
      name: "heroBody",
      title: "Hero Body",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "estimatedActs",
      title: "Estimated Acts",
      type: "string",
      initialValue: "100+ artists",
    }),
    defineField({
      name: "porchesStages",
      title: "Porches / Stages",
      type: "string",
      initialValue: "15+ neighborhood sites",
    }),
    defineField({
      name: "areaLabel",
      title: "Area Label",
      type: "string",
      initialValue: "Inside 1st–5th, Broadway to Santa Fe",
    }),
  ],
  preview: {
    select: { title: "eventName", subtitle: "eventDateLabel" },
  },
});
