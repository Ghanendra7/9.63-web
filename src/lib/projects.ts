import { sanityClient } from "./sanity";
import type { Project, ProjectImage } from "../types/project";

export const PROJECTS_QUERY = `*[_type == "project" && !(_id in path('drafts.**'))] | order(orderRank asc) {
  _id,
  _type,
  title,
  client,
  slug,
  comingSoon,
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
    focalPoint,
    hotspot,
    crop,
    alt
  },
  coverImage {
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
  gallery[] {
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
  slideCount,
  year,
  services,
  orderRank
}`;

export async function getProjects(): Promise<Project[]> {
  try {
    const rawProjects = await sanityClient.fetch<Project[]>(PROJECTS_QUERY);
    if (rawProjects && rawProjects.length > 0) {
      return rawProjects.map((p) => {
        const images: ProjectImage[] = (p.images && p.images.length > 0)
          ? p.images
          : [p.coverImage, ...(p.gallery || [])].filter(Boolean) as ProjectImage[];

        return {
          ...p,
          images,
          coverImage: images[0] || p.coverImage,
        };
      });
    }
  } catch (error) {
    console.warn("Failed to fetch projects from Sanity:", error);
  }

  return [];
}
