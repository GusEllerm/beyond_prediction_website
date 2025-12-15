/**
 * Utilities for matching publication authors to people
 */

import { allPeople, type Person } from '../data/people.js';
import type { PublicationAuthor, PersonPublication } from '../data/publications.js';

/**
 * Mapping of known name aliases/variations
 * Maps alternative names to the canonical person slug
 */
const nameAliases: Record<string, string> = {
  'augustus ellerm': 'gus-ellerm',
  'augustus (gus) ellerm': 'gus-ellerm',
  'a. ellerm': 'gus-ellerm',
  'a ellerm': 'gus-ellerm',
  'ellerm, augustus': 'gus-ellerm',
  'ellerm augustus': 'gus-ellerm',
  'benjamin adams': 'ben-adams',
  'adams, benjamin': 'ben-adams',
  'adams benjamin': 'ben-adams',
  'gahegan mark': 'mark-gahegan',
  'mark gahegan': 'mark-gahegan',
  'anderson mj': 'marti-anderson',
  'anderson m j': 'marti-anderson',
  'anderson, mj': 'marti-anderson',
  'anderson, m j': 'marti-anderson',
  'm j anderson': 'marti-anderson',
  'mj anderson': 'marti-anderson',
  'black ma': 'michael-black',
  'black, ma': 'michael-black',
  'm a black': 'michael-black',
  'm. a. black': 'michael-black',
  'link, s': 'sebastian-link',
  'link s': 'sebastian-link',
  's link': 'sebastian-link',
  's. link': 'sebastian-link',
  'link, s.': 'sebastian-link',
};

/**
 * Normalizes a name for comparison (lowercase, remove extra spaces, handle common variations)
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.,]/g, '') // Remove periods and commas
    .replace(/\bdr\b|\bprof\b|\bprofessor\b/gi, '') // Remove titles
    .trim();
}

/**
 * Extracts last name from a full name
 */
function extractLastName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '';
  // Last name is typically the last part, but could be first in "Last, First" format
  const lastPart = parts[parts.length - 1];
  // If name contains comma, first part before comma is likely last name
  if (name.includes(',')) {
    return parts[0].replace(/,/g, '').trim();
  }
  return lastPart;
}

/**
 * Checks if two names match (fuzzy matching)
 */
function namesMatch(name1: string, name2: string): boolean {
  const norm1 = normalizeName(name1);
  const norm2 = normalizeName(name2);

  // Exact match after normalization
  if (norm1 === norm2) return true;

  // Check if one contains the other (for cases like "Mark Gahegan" vs "M. Gahegan")
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    // Also check last names match
    const lastName1 = extractLastName(norm1);
    const lastName2 = extractLastName(norm2);
    if (lastName1 && lastName2 && lastName1 === lastName2) {
      return true;
    }
  }

  // Check last name match (for cases where first name might be abbreviated)
  const lastName1 = extractLastName(norm1);
  const lastName2 = extractLastName(norm2);
  if (lastName1 && lastName2 && lastName1 === lastName2 && lastName1.length > 2) {
    // If last names match and are substantial, check if first initials match
    const firstInitial1 = norm1.split(/\s+/)[0]?.[0];
    const firstInitial2 = norm2.split(/\s+/)[0]?.[0];
    if (firstInitial1 && firstInitial2 && firstInitial1 === firstInitial2) {
      return true;
    }
  }

  // Check for reversed name order (e.g., "Gahegan Mark" vs "Mark Gahegan")
  const parts1 = norm1.split(/\s+/).filter(p => p.length > 0);
  const parts2 = norm2.split(/\s+/).filter(p => p.length > 0);
  if (parts1.length === 2 && parts2.length === 2) {
    // Check if names are reversed: "last first" vs "first last"
    if ((parts1[0] === parts2[1] && parts1[1] === parts2[0]) ||
        (parts1[0] === parts2[1] && parts1[1].startsWith(parts2[0])) ||
        (parts1[1].startsWith(parts2[0]) && parts2[1] === parts1[0])) {
      return true;
    }
  }

  return false;
}

/**
 * Matches a publication author to a person by name
 */
function matchAuthorByName(
  author: PublicationAuthor,
  people: Person[]
): Person | null {
  // First check if the author name matches any known aliases
  const normalizedAuthorName = normalizeName(author.name);
  const aliasSlug = nameAliases[normalizedAuthorName];
  if (aliasSlug) {
    const person = people.find((p) => p.slug === aliasSlug);
    if (person) {
      return person;
    }
  }

  // Then try standard name matching
  for (const person of people) {
    if (namesMatch(author.name, person.name)) {
      return person;
    }
  }
  return null;
}

/**
 * Matches a publication author to a person by ORCID ID
 */
function matchAuthorByOrcid(
  author: PublicationAuthor,
  people: Person[]
): Person | null {
  if (!author.orcidId) return null;

  for (const person of people) {
    if (person.orcidId === author.orcidId) {
      return person;
    }
  }
  return null;
}

/**
 * Matches a publication author to a person (tries ORCID first, then name)
 */
export function matchAuthorToPerson(
  author: PublicationAuthor,
  people: Person[] = allPeople
): Person | null {
  // Try ORCID match first (most reliable)
  const orcidMatch = matchAuthorByOrcid(author, people);
  if (orcidMatch) return orcidMatch;

  // Fall back to name matching
  return matchAuthorByName(author, people);
}

/**
 * Gets all people who are authors of a publication
 */
export function getPublicationAuthors(
  publication: PersonPublication,
  people: Person[] = allPeople
): Person[] {
  if (!publication.authors || publication.authors.length === 0) {
    return [];
  }

  const matchedPeople: Person[] = [];
  const seenSlugs = new Set<string>();

  for (const author of publication.authors) {
    const person = matchAuthorToPerson(author, people);
    if (person && !seenSlugs.has(person.slug)) {
      matchedPeople.push(person);
      seenSlugs.add(person.slug);
    }
  }

  return matchedPeople;
}

/**
 * Gets all publications for a person (from all sources)
 */
export function getPersonPublications(
  person: Person,
  allPublications: PersonPublication[]
): PersonPublication[] {
  const personPublications: PersonPublication[] = [];

  for (const publication of allPublications) {
    if (!publication.authors) continue;

    for (const author of publication.authors) {
      // Match by ORCID first
      if (person.orcidId && author.orcidId && person.orcidId === author.orcidId) {
        personPublications.push(publication);
        break;
      }
      // Match by name (including aliases)
      const normalizedAuthorName = normalizeName(author.name);
      const aliasSlug = nameAliases[normalizedAuthorName];
      if (aliasSlug === person.slug || namesMatch(author.name, person.name)) {
        personPublications.push(publication);
        break;
      }
    }
  }

  return personPublications;
}

/**
 * Creates a mapping of publication IDs to their authors (as people)
 */
export function createPublicationToAuthorsMap(
  publications: PersonPublication[],
  people: Person[] = allPeople
): Map<string, Person[]> {
  const map = new Map<string, Person[]>();

  for (const publication of publications) {
    const authors = getPublicationAuthors(publication, people);
    if (authors.length > 0) {
      map.set(publication.id, authors);
    }
  }

  return map;
}

/**
 * Creates a mapping of people to their publications
 */
export function createPersonToPublicationsMap(
  publications: PersonPublication[],
  people: Person[] = allPeople
): Map<string, PersonPublication[]> {
  const map = new Map<string, PersonPublication[]>();

  for (const person of people) {
    const personPubs = getPersonPublications(person, publications);
    if (personPubs.length > 0) {
      map.set(person.slug, personPubs);
    }
  }

  return map;
}

