import { defineField, defineType } from "sanity";

export const audioType = defineType({
  name: "siteAudio",
  title: "Site Music",
  type: "document",
  fields: [
    defineField({
      name: "enabled",
      title: "Enable Music Player",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "title",
      title: "Track Title",
      type: "string",
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { audioFile?: { asset?: unknown } } | undefined;
          if (parent?.audioFile?.asset && (!value || !value.trim())) {
            return "Enter a track title to display in the header pill.";
          }
          return true;
        }),
    }),
    defineField({
      name: "audioFile",
      title: "Audio File (MP3 / M4A)",
      type: "file",
      options: {
        accept: "audio/mpeg,audio/mp4,audio/aac,audio/x-m4a,.mp3,.m4a,audio/*",
      },
    }),
  ],
  preview: {
    select: {
      title: "title",
      enabled: "enabled",
      hasFile: "audioFile.asset._ref",
    },
    prepare({ title, enabled, hasFile }) {
      const status = !hasFile ? "No file uploaded" : enabled === false ? "Hidden" : "Active";
      return {
        title: title || "Site Music",
        subtitle: status,
      };
    },
  },
});
