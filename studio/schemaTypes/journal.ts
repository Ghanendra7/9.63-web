import { defineField, defineType } from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { TwoColumnCategoriesInput } from "../components/TwoColumnCategoriesInput";

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
      name: "categories",
      title: "Categories",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: JOURNAL_CATEGORY_OPTIONS,
        layout: "grid",
      },
      components: {
        input: TwoColumnCategoriesInput,
      },
      validation: (rule) => rule.min(1).error("Select at least 1 category"),
    }),
    defineField({
      name: "images",
      title: "Images",
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
      categories: "categories",
      media: "images.0",
    },
    prepare({ title, categories, media }) {
      const subtitle = Array.isArray(categories) ? categories.join(", ") : "";
      return {
        title: title || "Untitled",
        subtitle,
        media,
      };
    },
  },
});
