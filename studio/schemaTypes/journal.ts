import { defineField, defineType } from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";

export const JOURNAL_CATEGORY_OPTIONS = [
  { title: "Brand Identity", value: "Brand Identity" },
  { title: "Editorial or Print", value: "Editorial or Print" },
  { title: "Editorial", value: "Editorial" },
  { title: "Brand Positioning", value: "Brand Positioning" },
  { title: "Digital Design", value: "Digital Design" },
  { title: "Case Study", value: "Case Study" },
  { title: "Press & Feature", value: "Press & Feature" },
  { title: "In Another Form", value: "In Another Form" },
  { title: "Project Spotlights", value: "Project Spotlights" },
];

export const journalType = defineType({
  name: "journal",
  title: "Journal",
  type: "document",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "journal" }),
    defineField({
      name: "entryNumber",
      title: "Entry Number",
      description: "Optional display number (e.g. 33, 32, 31).",
      type: "string",
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Description",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: JOURNAL_CATEGORY_OPTIONS,
        layout: "dropdown",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "images",
      title: "Images",
      description: "First image is shown as active initially; additional images appear in the slider.",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alternative Text",
              type: "string",
            }),
          ],
        },
      ],
      options: {
        layout: "grid",
      },
      validation: (rule) => rule.min(1).error("Add at least 1 image"),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "category",
      entryNumber: "entryNumber",
      media: "images.0",
    },
    prepare({ title, subtitle, entryNumber, media }) {
      const prefix = entryNumber ? `${entryNumber} — ` : "";
      return {
        title: `${prefix}${title || "Untitled"}`,
        subtitle: subtitle || "",
        media,
      };
    },
  },
});
