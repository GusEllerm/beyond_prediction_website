import type { PersonPublication } from '../data/publications';
import { getPublicationAuthors } from './authorMatching';
import { allPeople } from '../data/people';

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

  /**
   * Escapes HTML special characters to prevent XSS
   */
  function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  const cardsHtml = publications
    .map((work) => {
      const url = getPublicationUrl(work);
      const yearDisplay = work.year ? ` (${work.year})` : '';
      const venueDisplay = work.venue ? ` ${escapeHtml(work.venue)}` : '';
      
      // Get matched authors for this publication
      const authors = getPublicationAuthors(work, allPeople);
      
      // Check if there are additional authors not in people.ts
      const totalAuthors = work.authors?.length || 0;
      const matchedAuthorsCount = authors.length;
      const hasAdditionalAuthors = totalAuthors > matchedAuthorsCount;
      const additionalAuthorsCount = totalAuthors - matchedAuthorsCount;
      
      // Author photos HTML (small circular photos on the right)
      const authorPhotosHtml = authors.length > 0
        ? `<div class="col-auto">
            <div class="d-flex flex-wrap gap-2 align-items-center">
              ${authors
                .slice(0, 6) // Limit to 6 authors to avoid clutter
                .map((author) => {
                  const personUrl = `/person.html?person=${encodeURIComponent(author.slug)}`;
                  if (author.photoUrl) {
                    return `
                      <a href="${escapeHtml(personUrl)}" class="text-decoration-none" title="${escapeHtml(author.name)}">
                        <img 
                          src="${escapeHtml(author.photoUrl)}" 
                          alt="${escapeHtml(author.name)}" 
                          class="rounded-circle border border-2 border-light"
                          style="width: 40px; height: 40px; object-fit: cover;"
                          loading="lazy"
                        />
                      </a>
                    `;
                  } else {
                    // Fallback: show initials in a circle
                    const initials = author.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);
                    return `
                      <a href="${escapeHtml(personUrl)}" class="text-decoration-none d-inline-flex align-items-center justify-content-center rounded-circle border border-2 border-light bg-light text-dark" 
                         style="width: 40px; height: 40px; font-size: 0.75rem; font-weight: 600;" 
                         title="${escapeHtml(author.name)}">
                        ${escapeHtml(initials)}
                      </a>
                    `;
                  }
                })
                .join('')}
              ${authors.length > 6 ? `<span class="text-muted small">+${authors.length - 6}</span>` : ''}
              ${hasAdditionalAuthors && authors.length <= 6 ? `<span class="text-muted small" title="${additionalAuthorsCount} additional author${additionalAuthorsCount !== 1 ? 's' : ''} not in our database">+${additionalAuthorsCount}</span>` : ''}
            </div>
          </div>`
        : '';

      // Author names HTML (text list)
      const authorsHtml = authors.length > 0
        ? `<p class="card-text small mb-2">
            <span class="text-muted">Authors:</span>
            ${authors.map((author) => 
              `<a href="/person.html?person=${encodeURIComponent(author.slug)}" class="text-decoration-none">${escapeHtml(author.name)}</a>`
            ).join(', ')}
            ${hasAdditionalAuthors ? ` <span class="text-muted">and ${additionalAuthorsCount} other${additionalAuthorsCount !== 1 ? 's' : ''}</span>` : ''}
          </p>`
        : '';

      return `
        <div class="card mb-3">
          <div class="card-body">
            <div class="row g-3">
              <div class="${authors.length > 0 ? 'col' : 'col-12'}">
                <h5 class="card-title mb-2">
                  <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                    ${escapeHtml(work.title)}
                  </a>
                </h5>
                <p class="card-text small text-muted mb-2">
                  ${yearDisplay}${venueDisplay}
                </p>
                ${authorsHtml}
              </div>
              ${authorPhotosHtml}
            </div>
          </div>
        </div>
      `;
    })
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

