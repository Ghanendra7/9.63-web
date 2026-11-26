import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./studio/schemaTypes";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";

export default defineConfig({
  name: "default",
  title: "9.63 Website",
  projectId: "0jfix9cd",
  dataset: "production",
  basePath: "/sanity",
  plugins: [
    structureTool({
      structure: (S, context) => {
        return S.list()
          .title("Content")
          .items([
            orderableDocumentListDeskItem({
              type: "project",
              title: "Projects",
              S,
              context,
            }),
            orderableDocumentListDeskItem({
              type: "journal",
              title: "Journals",
              S,
              context,
            }),
            S.listItem()
              .title("Music")
              .id("siteAudio")
              .child(S.document().schemaType("siteAudio").documentId("siteAudio")),
            ...S.documentTypeListItems().filter(
              (listItem) => !["project", "journal", "siteAudio"].includes(listItem.getId() || "")
            ),
          ]);
      },
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
});
