import type { PersonPublication } from '../data/publications';
import { getPublicationUrl } from '../utils/publications';
import { getPublicationAuthors } from '../utils/authorMatching';
import { allPeople, type Person } from '../data/people';
import { escapeHtml } from '../utils/dom';

/**
 * Options for rendering a publication card
 */
export interface PublicationCardOptions {
  /** Whether to show author names (default: true) */
  showAuthors?: boolean;
  /** Whether to show author photos (default: false, only for research-outputs style) */
  showAuthorPhotos?: boolean;
  /** Whether to show venue/journal name (default: true) */
  showVenue?: boolean;
  /** Whether to show year (default: true) */
  showYear?: boolean;
  /** Whether to use compact styling (default: false) */
  compact?: boolean;
  /** Optional project/theme context to display */
  projectContext?: {
    title: string;
    slug: string;
  };
  /** Optional list of Person objects for author matching (default: allPeople) */
  allPeopleForMatching?: Person[];
  /** Heading level for the title (default: 'h5', can be 'h3', 'h4', 'h5', 'h6') */
  headingLevel?: 'h3' | 'h4' | 'h5' | 'h6';
  /** Whether card should have margin-bottom (default: true for research-outputs style, false otherwise) */
  withMargin?: boolean;
}

/**
 * Renders a single publication card
 * @param work - The publication work to render
 * @param options - Optional configuration for card rendering
 * @returns HTML string for the publication card
 */
export function renderPublicationCard(
  work: PersonPublication,
  options: PublicationCardOptions = {}
): string {
  const {
    showAuthors = true,
    showAuthorPhotos = false,
    showVenue = true,
    showYear = true,
    compact = false,
    projectContext,
    allPeopleForMatching = allPeople,
    headingLevel = 'h5',
    withMargin = false,
  } = options;

  const title = escapeHtml(work.title);
  const url = getPublicationUrl(work);
  const year = work.year;
  const venue = work.venue ? escapeHtml(work.venue) : '';

  // Get matched authors
  const authors = showAuthors ? getPublicationAuthors(work, allPeopleForMatching) : [];
  const totalAuthors = work.authors?.length || 0;
  const matchedAuthorsCount = authors.length;
  const hasAdditionalAuthors = totalAuthors > matchedAuthorsCount;
  const additionalAuthorsCount = totalAuthors - matchedAuthorsCount;

  // Build venue and year display
  const venueYearParts: string[] = [];
  if (venue && showVenue) {
    venueYearParts.push(venue);
  }
  if (typeof year === 'number' && showYear) {
    venueYearParts.push(String(year));
  }

  // Determine margin for venue/year line based on what comes after
  let venueYearMargin = '0';
  if (venueYearParts.length > 0) {
    if (showAuthors && authors.length > 0) {
      venueYearMargin = '2';
    } else if (projectContext) {
      venueYearMargin = '2';
    }
  }

  const venueYearHtml = venueYearParts.length
    ? `<p class="card-text small text-muted mb-${venueYearMargin}">${venueYearParts.join(' • ')}</p>`
    : '';

  // Build authors HTML (names only)
  const authorsMargin = projectContext ? '2' : '0';
  const authorsHtml =
    showAuthors && authors.length > 0
      ? `<p class="card-text small mb-${authorsMargin}">
          <span class="text-muted">Authors:</span>
          ${authors
            .map(
              (author) =>
                `<a href="/person.html?person=${encodeURIComponent(author.slug)}" class="text-decoration-none">${escapeHtml(author.name)}</a>`
            )
            .join(', ')}
          ${hasAdditionalAuthors ? ` <span class="text-muted">and ${additionalAuthorsCount} other${additionalAuthorsCount !== 1 ? 's' : ''}</span>` : ''}
        </p>`
      : '';

  // Build author photos HTML (only if showAuthorPhotos is true)
  const authorPhotosHtml =
    showAuthorPhotos && authors.length > 0
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

  // Build project context HTML
  const projectContextHtml = projectContext
    ? `<p class="card-text small mb-0">
        <span class="text-muted">Theme:</span>
        <a href="/project.html?project=${encodeURIComponent(projectContext.slug)}" class="text-decoration-none">
          ${escapeHtml(projectContext.title)}
        </a>
      </p>`
    : '';

  // Build card content - handle two layouts: with author photos vs without
  const cardContent =
    showAuthorPhotos && authors.length > 0
      ? `
        <div class="row g-3">
          <div class="col">
            <${headingLevel} class="card-title mb-2">
              <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                ${title}
              </a>
            </${headingLevel}>
            ${venueYearHtml}
            ${authorsHtml}
            ${projectContextHtml}
          </div>
          ${authorPhotosHtml}
        </div>
      `
      : `
        <${headingLevel} class="card-title mb-${venueYearHtml || authorsHtml ? '2' : '0'}">
          <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="text-decoration-none stretched-link">
            ${title}
          </a>
        </${headingLevel}>
        ${venueYearHtml}
        ${authorsHtml}
        ${projectContextHtml}
      `;

  // Determine card classes based on options
  let cardClasses = 'card';
  if (withMargin || showAuthorPhotos) {
    cardClasses += ' mb-3';
  } else {
    cardClasses += ' h-100 border-0 shadow-sm';
  }
  if (compact) {
    cardClasses += ' small';
  }

  return `
    <article class="${cardClasses}">
      <div class="card-body ${showAuthorPhotos ? '' : 'position-relative'}">
        ${cardContent}
      </div>
    </article>
  `;
}
