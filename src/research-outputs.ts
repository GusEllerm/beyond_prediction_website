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
 * Filter state interface
 */
interface ResearchOutputFilters {
  years: Set<number>;
  themes: Set<string>;
  authors: Set<string>;
  titleQuery: string;
}

/**
 * Global state
 */
let allOutputs: PublicationWithProject[] = [];
let filters: ResearchOutputFilters = {
  years: new Set(),
  themes: new Set(),
  authors: new Set(),
  titleQuery: '',
};

/**
 * Debounce helper function
 */
function debounce<F extends (...args: any[]) => void>(fn: F, delay: number): F {
  let timeout: number | undefined;
  return function(this: unknown, ...args: any[]) {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => fn.apply(this, args), delay);
  } as F;
}

/**
 * Gets all publications from all projects
 */
function loadResearchOutputsData(): PublicationWithProject[] {
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
 * Pure filtering function - checks if an output matches the current filters
 */
function matchesFilters(output: PublicationWithProject, filters: ResearchOutputFilters): boolean {
  // Years: if any years selected, require output.year to be in the set
  if (filters.years.size > 0) {
    if (!output.year || !filters.years.has(output.year)) {
      return false;
    }
  }

  // Themes: if any themes selected, require at least one match
  if (filters.themes.size > 0) {
    if (output.projectSlug && !filters.themes.has(output.projectSlug)) {
      return false;
    }
  }

  // Authors: if any authors selected, require at least one match
  if (filters.authors.size > 0) {
    const authors = getPublicationAuthors(output, allPeople);
    const hasAuthor = authors.some((author) => filters.authors.has(author.slug));
    if (!hasAuthor) {
      return false;
    }
  }

  // Title search: case-insensitive substring match
  const query = filters.titleQuery.trim().toLowerCase();
  if (query) {
    const title = output.title.toLowerCase();
    if (!title.includes(query)) {
      return false;
    }
  }

  return true;
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
 * Renders a single publication card
 */
function renderPublicationCard(pub: PublicationWithProject): string {
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
}

/**
 * Renders the publications list
 */
function renderOutputsList(outputs: PublicationWithProject[]): void {
  const listContainer = document.getElementById('publications-list');
  if (!listContainer) return;

  const countContainer = document.getElementById('publications-count');
  if (countContainer) {
    countContainer.textContent = `Showing ${outputs.length} of ${allOutputs.length} publication${allOutputs.length !== 1 ? 's' : ''}`;
  }

  if (outputs.length === 0) {
    listContainer.innerHTML = `
      <div class="alert alert-info" role="alert">
        No publications found matching the selected filters.
      </div>
    `;
    return;
  }

  listContainer.innerHTML = outputs.map(renderPublicationCard).join('');
}

/**
 * Renders active filter tags
 */
function renderActiveFilterTags(): void {
  const tagsContainer = document.getElementById('bp-active-filters');
  if (!tagsContainer) return;

  const tags: string[] = [];

  // Year tags
  Array.from(filters.years).sort((a, b) => b - a).forEach((year) => {
    tags.push(`
      <span class="badge rounded-pill text-bg-primary me-2 mb-2 d-inline-flex align-items-center">
        Year: ${year}
        <button type="button" class="btn-close btn-close-white btn-sm ms-1" aria-label="Remove year ${year}" data-filter-type="year" data-filter-value="${year}"></button>
      </span>
    `);
  });

  // Theme tags
  Array.from(filters.themes).forEach((themeSlug) => {
    const theme = researchProjects.find((p) => p.slug === themeSlug);
    const themeName = theme?.title || themeSlug;
    tags.push(`
      <span class="badge rounded-pill text-bg-primary me-2 mb-2 d-inline-flex align-items-center">
        Theme: ${escapeHtml(themeName)}
        <button type="button" class="btn-close btn-close-white btn-sm ms-1" aria-label="Remove theme ${escapeHtml(themeName)}" data-filter-type="theme" data-filter-value="${escapeHtml(themeSlug)}"></button>
      </span>
    `);
  });

  // Author tags
  Array.from(filters.authors).forEach((authorSlug) => {
    const author = allPeople.find((p) => p.slug === authorSlug);
    const authorName = author?.name || authorSlug;
    tags.push(`
      <span class="badge rounded-pill text-bg-primary me-2 mb-2 d-inline-flex align-items-center">
        Author: ${escapeHtml(authorName)}
        <button type="button" class="btn-close btn-close-white btn-sm ms-1" aria-label="Remove author ${escapeHtml(authorName)}" data-filter-type="author" data-filter-value="${escapeHtml(authorSlug)}"></button>
      </span>
    `);
  });

  // Title search tag
  if (filters.titleQuery.trim()) {
    tags.push(`
      <span class="badge rounded-pill text-bg-primary me-2 mb-2 d-inline-flex align-items-center">
        Search: "${escapeHtml(filters.titleQuery)}"
        <button type="button" class="btn-close btn-close-white btn-sm ms-1" aria-label="Clear search" data-filter-type="title"></button>
      </span>
    `);
  }

  if (tags.length === 0) {
    tagsContainer.innerHTML = '';
    return;
  }

  tagsContainer.innerHTML = tags.join('');

  // Attach event listeners to close buttons
  tagsContainer.querySelectorAll('button[data-filter-type]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLButtonElement;
      const filterType = target.getAttribute('data-filter-type');
      const filterValue = target.getAttribute('data-filter-value');

      if (filterType === 'year' && filterValue) {
        filters.years.delete(Number.parseInt(filterValue, 10));
      } else if (filterType === 'theme' && filterValue) {
        filters.themes.delete(filterValue);
      } else if (filterType === 'author' && filterValue) {
        filters.authors.delete(filterValue);
      } else if (filterType === 'title') {
        filters.titleQuery = '';
        const searchInput = document.getElementById('bp-title-search') as HTMLInputElement | null;
        if (searchInput) {
          searchInput.value = '';
        }
      }

      updateFilterUI();
      applyFiltersAndRender();
    });
  });
}

/**
 * Updates URL from current filters
 */
function updateUrlFromFilters(): void {
  const params = new URLSearchParams();

  if (filters.years.size > 0) {
    params.set('years', Array.from(filters.years).sort((a, b) => b - a).join(','));
  }
  if (filters.themes.size > 0) {
    params.set('themes', Array.from(filters.themes).join(','));
  }
  if (filters.authors.size > 0) {
    params.set('authors', Array.from(filters.authors).join(','));
  }
  if (filters.titleQuery.trim()) {
    params.set('title', filters.titleQuery.trim());
  }

  const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
  window.history.replaceState({}, '', newUrl);
}

/**
 * Initializes filters from URL parameters
 */
function initFiltersFromUrl(): void {
  const params = new URLSearchParams(window.location.search);
  
  const yearsParam = params.get('years');
  const themesParam = params.get('themes');
  const authorsParam = params.get('authors');
  const titleParam = params.get('title');

  filters.years = new Set(
    yearsParam ? yearsParam.split(',').map((y) => Number.parseInt(y, 10)).filter(Number.isFinite) : []
  );
  filters.themes = new Set(themesParam ? themesParam.split(',') : []);
  filters.authors = new Set(authorsParam ? authorsParam.split(',') : []);
  filters.titleQuery = titleParam ?? '';
}

/**
 * Applies filters and renders the results
 */
function applyFiltersAndRender(): void {
  const filtered = allOutputs.filter((o) => matchesFilters(o, filters));
  renderOutputsList(filtered);
  renderActiveFilterTags();
  updateUrlFromFilters();
}

/**
 * Updates filter UI to reflect current filter state
 */
function updateFilterUI(): void {
  // Update year buttons
  document.querySelectorAll<HTMLButtonElement>('[data-filter-year]').forEach((btn) => {
    const year = Number.parseInt(btn.getAttribute('data-filter-year') || '0', 10);
    if (filters.years.has(year)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update theme buttons
  document.querySelectorAll<HTMLButtonElement>('[data-filter-theme]').forEach((btn) => {
    const theme = btn.getAttribute('data-filter-theme') || '';
    if (filters.themes.has(theme)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update author buttons
  document.querySelectorAll<HTMLButtonElement>('[data-filter-author]').forEach((btn) => {
    const author = btn.getAttribute('data-filter-author') || '';
    if (filters.authors.has(author)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update search input
  const searchInput = document.getElementById('bp-title-search') as HTMLInputElement | null;
  if (searchInput) {
    searchInput.value = filters.titleQuery;
  }
}

/**
 * Toggle functions for filters
 */
function toggleYear(year: number): void {
  if (filters.years.has(year)) {
    filters.years.delete(year);
  } else {
    filters.years.add(year);
  }
  updateFilterUI();
  applyFiltersAndRender();
}

function toggleTheme(themeSlug: string): void {
  if (filters.themes.has(themeSlug)) {
    filters.themes.delete(themeSlug);
  } else {
    filters.themes.add(themeSlug);
  }
  updateFilterUI();
  applyFiltersAndRender();
}

function toggleAuthor(authorSlug: string): void {
  if (filters.authors.has(authorSlug)) {
    filters.authors.delete(authorSlug);
  } else {
    filters.authors.add(authorSlug);
  }
  updateFilterUI();
  applyFiltersAndRender();
}

/**
 * Clears all filters
 */
function clearAllFilters(): void {
  filters.years.clear();
  filters.themes.clear();
  filters.authors.clear();
  filters.titleQuery = '';
  
  const searchInput = document.getElementById('bp-title-search') as HTMLInputElement | null;
  if (searchInput) {
    searchInput.value = '';
  }
  
  updateFilterUI();
  applyFiltersAndRender();
}

/**
 * Renders the filter controls
 */
function renderFilterControls(): string {
  const uniqueYears = getUniqueYears(allOutputs);
  
  // Get people who have publications
  const peopleWithPublications = allPeople.filter((person) => {
    return allOutputs.some((pub) => {
      const authors = getPublicationAuthors(pub, allPeople);
      return authors.some((author) => author.slug === person.slug);
    });
  }).sort((a, b) => a.name.localeCompare(b.name));

  // Get projects with publications
  const projectsWithPublications = researchProjects
    .filter((p) => p.publicationIds && p.publicationIds.length > 0)
    .sort((a, b) => a.title.localeCompare(b.title));

  // Year filter buttons
  const yearFilterHtml = `
    <div class="mb-3">
      <label class="form-label fw-semibold mb-2">Filter by Year</label>
      <div class="d-flex flex-wrap gap-2">
        ${uniqueYears.map((year) => `
          <button 
            type="button" 
            class="btn btn-sm ${filters.years.has(year) ? 'btn-primary' : 'btn-outline-primary'}"
            data-filter-year="${year}"
          >
            ${year}
          </button>
        `).join('')}
      </div>
    </div>
  `;

  // Theme filter buttons
  const themeFilterHtml = `
    <div class="mb-3">
      <label class="form-label fw-semibold mb-2">Filter by Theme</label>
      <div class="d-flex flex-column gap-2" style="max-height: 300px; overflow-y: auto;">
        ${projectsWithPublications.map((project) => `
          <button 
            type="button" 
            class="btn btn-sm text-start ${filters.themes.has(project.slug) ? 'btn-primary' : 'btn-outline-primary'}"
            data-filter-theme="${escapeHtml(project.slug)}"
            title="${escapeHtml(project.title)}"
          >
            ${escapeHtml(project.title)}
          </button>
        `).join('')}
      </div>
    </div>
  `;

  // Author filter buttons
  const authorFilterHtml = `
    <div class="mb-3">
      <label class="form-label fw-semibold mb-2">Filter by Author</label>
      <div class="d-flex flex-column gap-2" style="max-height: 300px; overflow-y: auto;">
        ${peopleWithPublications.map((person) => `
          <button 
            type="button" 
            class="btn btn-sm text-start ${filters.authors.has(person.slug) ? 'btn-primary' : 'btn-outline-primary'}"
            data-filter-author="${escapeHtml(person.slug)}"
          >
            ${escapeHtml(person.name)}
          </button>
        `).join('')}
      </div>
    </div>
  `;

  // Title search
  const titleSearchHtml = `
    <div class="mb-3">
      <label for="bp-title-search" class="form-label fw-semibold mb-2">Search by Title</label>
      <input 
        type="search" 
        id="bp-title-search" 
        class="form-control" 
        placeholder="Search by title..."
        value="${escapeHtml(filters.titleQuery)}"
      />
    </div>
  `;

  return `
    <div class="bg-light rounded p-3">
      <h2 class="h6 mb-3">Filters</h2>
      ${titleSearchHtml}
      ${yearFilterHtml}
      ${themeFilterHtml}
      ${authorFilterHtml}
      <button id="clear-filters" class="btn btn-outline-secondary btn-sm w-100">
        Clear All Filters
      </button>
    </div>
  `;
}

/**
 * Initializes filter control event listeners
 */
function initFilterControls(): void {
  // Year filter buttons
  document.querySelectorAll<HTMLButtonElement>('[data-filter-year]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const year = Number.parseInt(btn.getAttribute('data-filter-year') || '0', 10);
      toggleYear(year);
    });
  });

  // Theme filter buttons
  document.querySelectorAll<HTMLButtonElement>('[data-filter-theme]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const theme = btn.getAttribute('data-filter-theme') || '';
      toggleTheme(theme);
    });
  });

  // Author filter buttons
  document.querySelectorAll<HTMLButtonElement>('[data-filter-author]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const author = btn.getAttribute('data-filter-author') || '';
      toggleAuthor(author);
    });
  });

  // Title search input
  const searchInput = document.getElementById('bp-title-search') as HTMLInputElement | null;
  if (searchInput) {
    const handleInput = debounce(() => {
      filters.titleQuery = searchInput.value;
      applyFiltersAndRender();
    }, 250);

    searchInput.addEventListener('input', handleInput);
  }

  // Clear all filters button
  const clearFiltersBtn = document.getElementById('clear-filters') as HTMLButtonElement | null;
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      clearAllFilters();
    });
  }
}

/**
 * Renders the Research Outputs page
 */
function renderResearchOutputsPage(): void {
  if (!app) {
    throw new Error('App container not found');
  }

  const pageHtml = `
    <div class="container py-5">
      <header class="mb-4">
        <h1 class="mb-3">Research Outputs</h1>
        <p class="lead text-muted mb-2">Browse Beyond Prediction's research outputs</p>
        <p class="small text-muted mb-4"><em>This is an incomplete list, and is being actively added to.</em></p>
      </header>

      <div id="bp-active-filters" class="mb-3"></div>

      <div class="row">
        <div class="col-lg-3 mb-4 mb-lg-0" id="filter-sidebar">
          ${renderFilterControls()}
        </div>

        <div class="col-lg-9">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <p class="text-muted small mb-0" id="publications-count">
              Loading...
            </p>
          </div>
          <div id="publications-list" class="bp-publications-container">
            Loading...
          </div>
        </div>
      </div>
    </div>
  `;

  app.innerHTML = pageHtml;
}

/**
 * Initializes the Research Outputs page
 */
function initResearchOutputsPage(): void {
  // 1. Load all outputs
  allOutputs = loadResearchOutputsData();

  // 2. Initialize filters from URL (before rendering so UI reflects state)
  initFiltersFromUrl();

  // 3. Render the page structure
  renderResearchOutputsPage();

  // 4. Set up filter UI event listeners
  initFilterControls();

  // 5. Update filter UI to reflect URL state (buttons should already be correct, but ensure)
  updateFilterUI();

  // 6. Initial render
  applyFiltersAndRender();
}

// Initialize page when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initResearchOutputsPage);
} else {
  initResearchOutputsPage();
}
