import type { PersonPublication } from '../data/publications';
import { allPeople } from '../data/people';
import { renderPublicationCard } from '../components/publicationCard';

export type { PersonPublication };

// Load all publication snapshots to create a lookup by publication ID
const openAlexSnapshots = import.meta.glob(
  '../data/publications/openalex/*.json',
  {
    eager: true,
  }
) as Record<string, { default: { works: PersonPublication[] } }>;

const orcidSnapshots = import.meta.glob('../data/publications/orcid/*.json', {
  eager: true,
}) as Record<string, { default: { works: PersonPublication[] } }>;

// Load DOI-based publications (individual publication files)
const doiPublications = import.meta.glob('../data/publications/doi/*.json', {
  eager: true,
}) as Record<string, { default: PersonPublication }>;

/**
 * Creates a lookup map of publications by their ID and DOI
 * @returns Map of publication ID/DOI to publication object
 */
export function createPublicationLookup(): Map<string, PersonPublication> {
  const lookup = new Map<string, PersonPublication>();

  // Process OpenAlex snapshots
  for (const mod of Object.values(openAlexSnapshots)) {
    const snapshot = mod.default;
    if (snapshot?.works) {
      for (const work of snapshot.works) {
        if (work.id) {
          lookup.set(work.id, work);
        }
        // Also index by DOI if available
        if (work.doi) {
          const doiUrl = work.doi.startsWith('http') ? work.doi : `https://doi.org/${work.doi}`;
          if (!lookup.has(doiUrl)) {
            lookup.set(doiUrl, work);
          }
          // Also index without https:// prefix
          const cleanDoi = work.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '');
          const doiKey = `https://doi.org/${cleanDoi}`;
          if (doiKey !== doiUrl && !lookup.has(doiKey)) {
            lookup.set(doiKey, work);
          }
        }
      }
    }
  }

  // Process ORCID snapshots
  for (const mod of Object.values(orcidSnapshots)) {
    const snapshot = mod.default;
    if (snapshot?.works) {
      for (const work of snapshot.works) {
        if (work.id) {
          // Only add if not already in map (OpenAlex takes precedence)
          if (!lookup.has(work.id)) {
            lookup.set(work.id, work);
          }
        }
        // Also index by DOI if available
        if (work.doi) {
          const doiUrl = work.doi.startsWith('http') ? work.doi : `https://doi.org/${work.doi}`;
          if (!lookup.has(doiUrl)) {
            lookup.set(doiUrl, work);
          }
        }
      }
    }
  }

  // Process DOI-based publications (standalone files)
  for (const mod of Object.values(doiPublications)) {
    const publication = mod.default;
    if (publication) {
      // Index by OpenAlex ID or custom ID
      if (publication.id && !lookup.has(publication.id)) {
        lookup.set(publication.id, publication);
      }
      // Index by DOI
      if (publication.doi) {
        const doiUrl = publication.doi.startsWith('http') 
          ? publication.doi 
          : `https://doi.org/${publication.doi}`;
        if (!lookup.has(doiUrl)) {
          lookup.set(doiUrl, publication);
        }
        // Also index http://dx.doi.org format
        const dxDoiUrl = publication.doi.startsWith('http') 
          ? publication.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, 'http://dx.doi.org/')
          : `http://dx.doi.org/${publication.doi}`;
        if (dxDoiUrl !== doiUrl && !lookup.has(dxDoiUrl)) {
          lookup.set(dxDoiUrl, publication);
        }
      }
    }
  }

  return lookup;
}

/**
 * Gets publications by their IDs or DOIs
 * @param publicationIds - Array of publication IDs (OpenAlex work IDs) or DOIs (in any format)
 * @returns Array of publication objects
 */
export function getPublicationsByIds(publicationIds: string[]): PersonPublication[] {
  const lookup = createPublicationLookup();
  const publications: PersonPublication[] = [];
  
  for (const id of publicationIds) {
    const pub = lookup.get(id);
    if (pub) {
      publications.push(pub);
    }
  }
  
  return publications;
}

/**
 * Gets the best available URL for a publication
 * @param work - The publication work
 * @returns The best available URL
 */
export function getPublicationUrl(work: PersonPublication): string {
  if (work.openAccessUrl) return work.openAccessUrl;
  if (work.doi) {
    const cleanDoi = work.doi.replace(/^doi:/i, '').trim();
    return `https://doi.org/${cleanDoi}`;
  }
  // Only use id as URL if it's a valid URL (starts with http:// or https://)
  if (work.id && (work.id.startsWith('http://') || work.id.startsWith('https://'))) {
    return work.id;
  }
  return '#';
}

/**
 * Renders the publications section
 * @param publications - Array of publications
 * @returns HTML string for the publications section
 */
export function renderPublicationsSection(publications: PersonPublication[]): string {
  if (!publications || publications.length === 0) {
    return '';
  }

  const cardsHtml = publications
    .map((work) => renderPublicationCard(work, {
      showAuthors: true,
      showAuthorPhotos: true,
      showVenue: true,
      showYear: true,
      withMargin: true,
      allPeopleForMatching: allPeople,
    }))
    .join('');

  return `
    <section class="mt-4">
      <h2 class="h4 mb-3">Research Outputs</h2>
      <div class="bp-publications-container">
        ${cardsHtml}
      </div>
    </section>
  `;
}

