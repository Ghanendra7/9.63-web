import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

export const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || "0jfix9cd",
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || "production",
  apiVersion: import.meta.env.PUBLIC_SANITY_API_VERSION || "2024-03-01",
  useCdn: true,
});

const imageBuilder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return imageBuilder.image(source);
}
