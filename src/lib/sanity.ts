import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

const projectId = import.meta.env?.PUBLIC_SANITY_PROJECT_ID || "0jfix9cd";
const dataset = import.meta.env?.PUBLIC_SANITY_DATASET || "production";
const apiVersion = import.meta.env?.PUBLIC_SANITY_API_VERSION || "2024-03-01";
const token = import.meta.env?.SANITY_API_TOKEN;

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

const imageBuilder = createImageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return imageBuilder.image(source);
}
