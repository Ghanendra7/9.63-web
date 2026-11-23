import { sanityClient } from "./sanity";
import type { Project } from "../types/project";

export const PROJECTS_QUERY = `*[_type == "project" && !(_id in path('drafts.**'))] | order(orderRank asc) {
  _id,
  _type,
  title,
  client,
  slug,
  comingSoon,
  coverImage {
    asset-> {
      _id,
      url,
      metadata {
        dimensions
      }
    },
    alt
  },
  gallery[] {
    asset-> {
      _id,
      url,
      metadata {
        dimensions
      }
    },
    alt
  },
  slideCount,
  year,
  services,
  orderRank
}`;

export async function getProjects(): Promise<Project[]> {
  try {
    const projects = await sanityClient.fetch<Project[]>(PROJECTS_QUERY);
    if (projects && projects.length > 0) {
      return projects;
    }
  } catch (error) {
    console.warn("Failed to fetch projects from Sanity:", error);
  }

  return [];
}
