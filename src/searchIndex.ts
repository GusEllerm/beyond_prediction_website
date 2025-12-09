/**
 * Search record interface for searchable items
 */
export interface SearchRecord {
  slug: string; // Unique identifier, used for linking to project pages
  title: string;
  summary: string;
  tags?: string[];
  href: string; // Final URL to navigate to (e.g. /project.html?project=slug)
}

import { researchProjects } from './data/researchProjects';

/**
 * Search index built from research project details
 * Uses project details (preferred) to build a searchable index
 */
export const searchIndex: SearchRecord[] = researchProjects.map((project) => ({
  slug: project.slug,
  title: project.title,
  summary: project.shortDescription ?? '',
  tags: project.highlights,
  href: `/project.html?project=${encodeURIComponent(project.slug)}`,
}));

/**
 * Simple search function that filters records based on query
 * Searches in title, summary, and tags (case-insensitive substring match)
 * @param query - The search query string
 * @returns Array of matching SearchRecord items
 */
export function searchRecords(query: string): SearchRecord[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return searchIndex.filter((item) => {
    const inTitle = item.title.toLowerCase().includes(q);
    const inSummary = item.summary.toLowerCase().includes(q);
    const inTags = (item.tags ?? []).some((tag) => tag.toLowerCase().includes(q));

    return inTitle || inSummary || inTags;
  });
}

