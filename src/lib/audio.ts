import { sanityClient } from "./sanity";
import type { SanitySiteAudioDoc, SiteAudio } from "../types/audio";

export const SITE_AUDIO_QUERY = `*[_type == "siteAudio" && !(_id in path('drafts.**'))] | order(_updatedAt desc)[0] {
  _id,
  enabled,
  title,
  audioFile {
    asset-> {
      _id,
      url,
      originalFilename,
      mimeType
    }
  }
}`;

export function normalizeSiteAudio(doc: SanitySiteAudioDoc | null | undefined): SiteAudio | null {
  if (!doc || doc.enabled === false) {
    return null;
  }

  const url = doc.audioFile?.asset?.url;
  if (!url) {
    return null;
  }

  const fallbackName = doc.audioFile?.asset?.originalFilename?.replace(/\.[^.]+$/, "") || "Audio";
  const title = (doc.title || fallbackName).trim() || "Audio";

  return { title, url };
}

export async function getSiteAudio(): Promise<SiteAudio | null> {
  try {
    const doc = await sanityClient.fetch<SanitySiteAudioDoc | null>(SITE_AUDIO_QUERY);
    return normalizeSiteAudio(doc);
  } catch (error) {
    console.warn("Failed to fetch site audio from Sanity:", error);
    return null;
  }
}
