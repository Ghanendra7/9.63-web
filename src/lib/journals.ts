import { sanityClient } from "./sanity";
import type { JournalEntry } from "../types/journal";

export const JOURNALS_QUERY = `*[_type == "journal" && !(_id in path('drafts.**'))] | order(orderRank asc) {
  _id,
  _type,
  title,
  excerpt,
  category,
  images[] {
    _key,
    _type,
    asset-> {
      _id,
      url,
      metadata {
        dimensions
      }
    },
    hotspot,
    crop,
    alt
  },
  orderRank
}`;

export async function getJournals(): Promise<JournalEntry[]> {
  try {
    const rawJournals = await sanityClient.fetch<JournalEntry[]>(JOURNALS_QUERY);
    if (rawJournals && rawJournals.length > 0) {
      return rawJournals.map((entry) => ({
        ...entry,
        images: (entry.images || []).filter((img) => Boolean(img?.asset?._id || img?.asset?.url)),
      }));
    }
  } catch (error) {
    console.warn("Failed to fetch journals from Sanity:", error);
  }

  return [];
}
