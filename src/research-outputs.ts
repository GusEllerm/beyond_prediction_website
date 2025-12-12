// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Import Bootstrap JS (for navbar toggle and other interactive components)
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Import custom styles
import './styles.css';

// Import components
import { renderNavbar } from './components/navbar';
import { renderFooter } from './components/footer';
import { partners } from './data/partners';
import { researchProjects } from './data/researchProjects';
import { allPeople } from './data/people';
import { createPublicationLookup, getPublicationUrl, type PersonPublication } from './utils/publications';
import { getPublicationAuthors } from './utils/authorMatching';

const navbarContainer = document.querySelector<HTMLElement>('#navbar');
const app = document.querySelector<HTMLElement>('#app');
const footerContainer = document.querySelector<HTMLElement>('#footer');

if (!navbarContainer || !app || !footerContainer) {
  throw new Error('Layout containers not found on Research Outputs page');
}

renderNavbar(navbarContainer);
footerContainer.innerHTML = renderFooter(partners);

/**
 * Escapes HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Extended publication with project association
 */
interface PublicationWithProject extends PersonPublication {
  projectSlug: string;
  projectTitle: string;
}

/**
 * Gets all publications from all projects
 */
function getAllPublications(): PublicationWithProject[] {
  const publications: PublicationWithProject[] = [];
  const lookup = createPublicationLookup();
  const seenPublicationIds = new Set<string>(); // Track publications we've already added

  for (const project of researchProjects) {
    if (project.publicationIds && project.publicationIds.length > 0) {
      for (const pubId of project.publicationIds) {
        const pub = lookup.get(pubId);
        if (pub && !seenPublicationIds.has(pub.id)) {
          seenPublicationIds.add(pub.id);
          publications.push({
            ...pub,
            projectSlug: project.slug,
            projectTitle: project.title,
          });
        }
      }
    }
  }

  // Sort by year (newest first), then by title
  return publications.sort((a, b) => {
    if (a.year !== b.year) {
      if (!a.year) return 1;
      if (!b.year) return -1;
      return b.year - a.year;
    }
    return a.title.localeCompare(b.title);
  });
}

/**
 * Filters publications based on selected filters
 */
function filterPublications(
  publications: PublicationWithProject[],
  selectedYear: number | null,
  selectedProject: string | null,
  selectedAuthor: string | null
): PublicationWithProject[] {
  let filtered = publications;

  if (selectedYear !== null) {
    filtered = filtered.filter((pub) => pub.year === selectedYear);
  }

  if (selectedProject !== null) {
    filtered = filtered.filter((pub) => pub.projectSlug === selectedProject);
  }

  if (selectedAuthor !== null) {
    filtered = filtered.filter((pub) => {
      const authors = getPublicationAuthors(pub, allPeople);
      return authors.some((author) => author.slug === selectedAuthor);
    });
  }

  return filtered;
}

/**
 * Gets unique years from publications (sorted descending)
 */
function getUniqueYears(publications: PublicationWithProject[]): number[] {
  const years = new Set<number>();
  for (const pub of publications) {
    if (pub.year) {
      years.add(pub.year);
    }
  }
  return Array.from(years).sort((a, b) => b - a);
}

/**
 * Renders the Research Outputs page
 */
function renderResearchOutputsPage(): void {
  if (!app) {
    throw new Error('App container not found');
  }

  const allPublications = getAllPublications();
  const uniqueYears = getUniqueYears(allPublications);

  // Get filter params from URL
  const urlParams = new URLSearchParams(window.location.search);
  const selectedYearParam = urlParams.get('year');
  const selectedYear = selectedYearParam ? parseInt(selectedYearParam, 10) : null;
  const selectedProject = urlParams.get('project');
  const selectedAuthor = urlParams.get('author');

  const filteredPublications = filterPublications(
    allPublications,
    selectedYear,
    selectedProject,
    selectedAuthor
  );

  // Render filter section
  const yearFilterHtml = `
    <div class="mb-3">
      <label for="year-filter" class="form-label fw-semibold mb-2">Filter by Year</label>
      <select id="year-filter" class="form-select">
        <option value="">All Years</option>
        ${uniqueYears
          .map(
            (year) => `
          <option value="${year}" ${selectedYear === year ? 'selected' : ''}>${year}</option>
        `
          )
          .join('')}
      </select>
    </div>
  `;

  const projectFilterHtml = `
    <div class="mb-3">
      <label for="project-filter" class="form-label fw-semibold mb-2">Filter by Theme</label>
      <select id="project-filter" class="form-select">
        <option value="">All Projects</option>
        ${researchProjects
          .filter((p) => p.publicationIds && p.publicationIds.length > 0)
          .map(
            (project) => `
          <option value="${project.slug}" ${selectedProject === project.slug ? 'selected' : ''}>
            ${escapeHtml(project.title)}
          </option>
        `
          )
          .join('')}
      </select>
    </div>
  `;

  // Get people who have publications
  const peopleWithPublications = allPeople.filter((person) => {
    return allPublications.some((pub) => {
      const authors = getPublicationAuthors(pub, allPeople);
      return authors.some((author) => author.slug === person.slug);
    });
  }).sort((a, b) => a.name.localeCompare(b.name));

  const authorFilterHtml = `
    <div class="mb-3">
      <label for="author-filter" class="form-label fw-semibold mb-2">Filter by Author</label>
      <select id="author-filter" class="form-select">
        <option value="">All Authors</option>
        ${peopleWithPublications
          .map(
            (person) => `
          <option value="${person.slug}" ${selectedAuthor === person.slug ? 'selected' : ''}>
            ${escapeHtml(person.name)}
          </option>
        `
          )
          .join('')}
      </select>
    </div>
  `;

  // Render publications list
  const publicationsHtml =
    filteredPublications.length === 0
      ? `
    <div class="alert alert-info" role="alert">
      No publications found matching the selected filters.
    </div>
  `
      : filteredPublications
          .map((pub) => {
            const url = getPublicationUrl(pub);
            const yearDisplay = pub.year ? ` (${pub.year})` : '';
            const venueDisplay = pub.venue ? ` ${escapeHtml(pub.venue)}` : '';
            const projectUrl = `/project.html?project=${encodeURIComponent(pub.projectSlug)}`;
            
            // Get matched authors for this publication
            const authors = getPublicationAuthors(pub, allPeople);
            
            // Check if there are additional authors not in people.ts
            const totalAuthors = pub.authors?.length || 0;
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
                      ${escapeHtml(pub.title)}
                    </a>
                  </h5>
                  <p class="card-text small text-muted mb-2">
                    ${yearDisplay}${venueDisplay}
                  </p>
                  ${authorsHtml}
                  <p class="card-text small mb-0">
                    <span class="text-muted">Theme:</span>
                    <a href="${escapeHtml(projectUrl)}" class="text-decoration-none">
                      ${escapeHtml(pub.projectTitle)}
                    </a>
                  </p>
                </div>
                ${authorPhotosHtml}
              </div>
            </div>
          </div>
        `;
          })
          .join('');

  const pageHtml = `
    <div class="container py-5">
               <header class="mb-4">
                 <h1 class="mb-3">Research Outputs</h1>
                 <p class="lead text-muted mb-2">Browse Beyond Prediction's research outputs</p>
                 <p class="small text-muted mb-4"><em>This is an incomplete list, and is being actively added to.</em></p>
               </header>

      <div class="row">
        <div class="col-lg-3 mb-4 mb-lg-0">
          <div class="bg-light rounded p-3">
            <h2 class="h6 mb-3">Filters</h2>
            ${yearFilterHtml}
            ${projectFilterHtml}
            ${authorFilterHtml}
            <button id="clear-filters" class="btn btn-outline-secondary btn-sm w-100">
              Clear Filters
            </button>
          </div>
        </div>

        <div class="col-lg-9">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <p class="text-muted small mb-0">
              Showing ${filteredPublications.length} of ${allPublications.length} publication${allPublications.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div id="publications-list" class="bp-publications-container">
            ${publicationsHtml}
          </div>
        </div>
      </div>
    </div>
  `;

  app.innerHTML = pageHtml;

  // Set up filter event listeners
  const yearFilter = document.getElementById('year-filter') as HTMLSelectElement;
  const projectFilter = document.getElementById('project-filter') as HTMLSelectElement;
  const authorFilter = document.getElementById('author-filter') as HTMLSelectElement;
  const clearFiltersBtn = document.getElementById('clear-filters') as HTMLButtonElement;

  if (yearFilter) {
    yearFilter.addEventListener('change', () => {
      updateFilters();
    });
  }

  if (projectFilter) {
    projectFilter.addEventListener('change', () => {
      updateFilters();
    });
  }

  if (authorFilter) {
    authorFilter.addEventListener('change', () => {
      updateFilters();
    });
  }

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      window.location.href = '/research-outputs.html';
    });
  }

  function updateFilters(): void {
    const params = new URLSearchParams();
    const year = yearFilter?.value;
    const project = projectFilter?.value;
    const author = authorFilter?.value;

    if (year) {
      params.set('year', year);
    }
    if (project) {
      params.set('project', project);
    }
    if (author) {
      params.set('author', author);
    }

    const newUrl = params.toString()
      ? `/research-outputs.html?${params.toString()}`
      : '/research-outputs.html';
    window.location.href = newUrl;
  }
}

// Render page
renderResearchOutputsPage();
