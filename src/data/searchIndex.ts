import { researchProjects } from './researchProjects';
import { allPeople } from './people';
import type {
  PersonPublication,
  PersonPublicationsSnapshot,
} from './publications';

/**
 * Search item type discriminator
 */
export type SearchItemType = 'project' | 'person';

/**
 * Unified search item interface
 * Represents both projects and people in the search index
 */
export interface SearchItem {
  id: string; // slug for project or person
  type: SearchItemType;
  title: string; // project title or person name
  summary: string; // card text / short bio
  url: string; // link to detail page
  searchableText: string; // blob of text we search against
}

// Load all publication snapshots
const publicationModules = import.meta.glob('./publications/*.json', {
  eager: true,
}) as Record<string, { default: PersonPublicationsSnapshot }>;

/**
 * Gets publications for a person by their slug
 * @param slug - The person slug
 * @returns Array of publications or empty array if not found
 */
function getPublicationsForSlug(slug: string): PersonPublication[] {
  for (const [path, mod] of Object.entries(publicationModules)) {
    // path example: "./publications/mark-gahegan.json"
    if (path.endsWith(`/publications/${slug}.json`)) {
      return mod.default.works ?? [];
    }
  }
  return [];
}

/**
 * Index projects
 */
const projectItems: SearchItem[] = researchProjects.map((project) => ({
  id: project.slug,
  type: 'project' as const,
  title: project.title,
  summary: project.shortDescription,
  url: `/project.html?project=${project.slug}`,
  searchableText: [
    project.title,
    project.shortDescription,
    project.longDescription,
    (project.tags ?? []).join(' '),
    (project.highlights ?? []).join(' '),
    (project.keyQuestions ?? []).join(' '),
  ]
    .filter(Boolean)
    .join(' \n '),
}));

/**
 * Index people with their publication metadata
 */
const personItems: SearchItem[] = allPeople.map((person) => {
  const pubs = getPublicationsForSlug(person.slug);
  const pubText = pubs
    .map((w) => `${w.title ?? ''} ${w.venue ?? ''}`)
    .join(' \n ');

  const rolePart = person.roleLabel ?? '';
  const orgPart = person.affiliation ?? '';

  return {
    id: person.slug,
    type: 'person' as const,
    title: person.name,
    summary:
      rolePart && orgPart
        ? `${rolePart} · ${orgPart}`
        : rolePart || orgPart || 'Beyond Prediction researcher',
    url: `/person.html?person=${person.slug}`,
    searchableText: [
      person.name,
      person.roleLabel,
      person.affiliation,
      person.bioShort,
      person.bioLong,
      (person.tags ?? []).join(' '),
      pubText, // publication titles + venues
    ]
      .filter(Boolean)
      .join(' \n '),
  };
});

/**
 * Unified search index containing both projects and people
 */
export const searchIndex: SearchItem[] = [...projectItems, ...personItems];

/**
 * Simple search function that filters items based on query
 * @param query - The search query string
 * @param typeFilter - Optional type filter ('project' or 'person')
 * @returns Array of matching SearchItem items
 */
export function searchItems(
  query: string,
  typeFilter?: SearchItemType
): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    // If no query, return all items (optionally filtered by type)
    return typeFilter
      ? searchIndex.filter((item) => item.type === typeFilter)
      : searchIndex;
  }

  const matches = searchIndex.filter((item) => {
    const haystack = item.searchableText.toLowerCase();
    return haystack.includes(q);
  });

  // Apply type filter if provided
  if (typeFilter) {
    return matches.filter((item) => item.type === typeFilter);
  }

  return matches;
}

