import { defineField, defineType } from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";

export const projectType = defineType({
  name: "project",
  title: "Project",
  type: "document",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "project" }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "client",
      title: "Subtitle",
      type: "string",
    }),
    defineField({
      name: "images",
      title: "Project Images",
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
    defineField({
      name: "comingSoon",
      title: "Coming Soon",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      hidden: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "client",
      media: "images.0",
      fallbackMedia: "coverImage",
    },
    prepare({ title, subtitle, media, fallbackMedia }) {
      return {
        title: title || "Untitled",
        subtitle: subtitle || "",
        media: media || fallbackMedia,
      };
    },
  },
});
