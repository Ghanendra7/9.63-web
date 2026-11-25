import { defineConfig } from "astro/config";
import sanity from "@sanity/astro";
import react from "@astrojs/react";

export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  integrations: [
    sanity({
      projectId: "0jfix9cd",
      dataset: "production",
      useCdn: false,
      studioBasePath: "/sanity",
    }),
    react(),
  ],
});
