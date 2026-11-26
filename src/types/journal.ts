import type { ProjectImage } from "./project";

export const JOURNAL_CATEGORIES = [
  "Brand Identity",
  "Editorial or Print",
  "Editorial",
  "Brand Positioning",
  "Digital Design",
  "Case Study",
  "Press & Feature",
  "In Another Form",
  "Project Spotlights",
] as const;

export type JournalCategory = (typeof JOURNAL_CATEGORIES)[number];

export interface JournalEntry {
  _id: string;
  _type?: "journal";
  title: string;
  excerpt: string;
  categories: string[];
  category?: string;
  images: ProjectImage[];
  orderRank?: string | number;
}
