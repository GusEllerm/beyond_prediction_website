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
import { createPublicationLookup, type PersonPublication } from './utils/publications';
import { getPublicationAuthors } from './utils/authorMatching';

// Import utilities
import { escapeHtml } from './utils/dom';
import { renderPublicationCard as renderPubCard } from './components/publicationCard';

const navbarContainer = document.querySelector<HTMLElement>('#navbar');
const main = document.querySelector<HTMLElement>('#bp-main');
const footerContainer = document.querySelector<HTMLElement>('#footer');

if (!navbarContainer || !main || !footerContainer) {
  throw new Error('Layout containers not found on Research Outputs page');
}

renderNavbar(navbarContainer);
footerContainer.innerHTML = renderFooter(partners);

/**
 * Extended publication with project association
 * Supports multiple projects/themes per publication
 */
interface PublicationWithProject extends PersonPublication {
  projectSlugs: string[];   // all projects/themes this publication belongs to
  projectTitles: string[];  // human-readable project/theme titles (same order as projectSlugs)
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
 * Aggregates multiple projects per publication
 */
function loadResearchOutputsData(): PublicationWithProject[] {
  const lookup = createPublicationLookup();
  const publicationsById = new Map<string, PublicationWithProject>();

  for (const project of researchProjects) {
    if (project.publicationIds && project.publicationIds.length > 0) {
      for (const pubId of project.publicationIds) {
        const pub = lookup.get(pubId);
        if (!pub) continue;

        const existing = publicationsById.get(pub.id);
        if (existing) {
          // Publication already exists, add this project if not already present
          if (!existing.projectSlugs.includes(project.slug)) {
            existing.projectSlugs.push(project.slug);
            existing.projectTitles.push(project.title);
          }
        } else {
          // First time seeing this publication
          publicationsById.set(pub.id, {
            ...pub,
            projectSlugs: [project.slug],
            projectTitles: [project.title],
          });
        }
      }
    }
  }

  // Convert map to array and sort by year (newest first), then by title
  const publications = Array.from(publicationsById.values());
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
    const hasMatchingTheme = output.projectSlugs.some((slug) => filters.themes.has(slug));
    if (!hasMatchingTheme) {
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
 * Renders a single publication card with multiple project associations
 */
function renderPublicationCard(pub: PublicationWithProject): string {
  // Build themes/projects links - show all associated projects
  const themesLinks = pub.projectTitles.length > 0
    ? pub.projectTitles
        .map((title, index) => {
          const slug = pub.projectSlugs[index];
          return `<a href="/project.html?project=${encodeURIComponent(slug)}" class="text-decoration-none">${escapeHtml(title)}</a>`;
        })
        .join(', ')
    : '';

  // Render the base card (without project context, we'll add custom themes display)
  const baseCardHtml = renderPubCard(pub, {
    showAuthors: true,
    showAuthorPhotos: true,
    showVenue: true,
    showYear: true,
    withMargin: true,
    projectContext: undefined, // We'll add custom themes display below
    allPeopleForMatching: allPeople,
  });

  // Add themes/projects line before closing card-body div
  if (themesLinks) {
    const themesLabel = pub.projectTitles.length > 1 ? 'Themes' : 'Theme';
    const themesLine = `        <p class="card-text small mb-0">
          <span class="text-muted">${themesLabel}:</span>
          ${themesLinks}
        </p>
`;
    // Insert themes line before the closing </div> of card-body
    // The card structure ends with card-body closing: </div>\n    </article>
    // We want to insert before the last </div> that's inside card-body
    // Pattern: match </div> followed by whitespace and </article>
    return baseCardHtml.replace(/(\s+)<\/div>\s+<\/article>/s, `${themesLine}$1</div>
    </article>`);
  }

  return baseCardHtml;
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
 * Renders active filter tags in the sidebar
 */
function renderActiveFilterTags(): void {
  const tagsContainer = document.getElementById('bp-active-filters');
  if (!tagsContainer) return;

  const tags: string[] = [];
  const totalActiveFilters = filters.years.size + filters.themes.size + filters.authors.size + (filters.titleQuery.trim() ? 1 : 0);

  if (totalActiveFilters === 0) {
    tagsContainer.innerHTML = '';
    return;
  }

  // Year tags
  Array.from(filters.years).sort((a, b) => b - a).forEach((year) => {
    tags.push(`
      <span class="badge rounded-pill text-bg-primary me-1 mb-1 d-inline-flex align-items-center">
        ${year}
        <button type="button" class="btn-close btn-close-white btn-sm ms-1" style="font-size: 0.65rem;" aria-label="Remove year ${year}" data-filter-type="year" data-filter-value="${year}"></button>
      </span>
    `);
  });

  // Theme tags
  Array.from(filters.themes).forEach((themeSlug) => {
    const theme = researchProjects.find((p) => p.slug === themeSlug);
    const themeName = theme?.title || themeSlug;
    // Truncate long theme names
    const displayName = themeName.length > 20 ? themeName.substring(0, 20) + '...' : themeName;
    tags.push(`
      <span class="badge rounded-pill text-bg-primary me-1 mb-1 d-inline-flex align-items-center" title="${escapeHtml(themeName)}">
        ${escapeHtml(displayName)}
        <button type="button" class="btn-close btn-close-white btn-sm ms-1" style="font-size: 0.65rem;" aria-label="Remove theme ${escapeHtml(themeName)}" data-filter-type="theme" data-filter-value="${escapeHtml(themeSlug)}"></button>
      </span>
    `);
  });

  // Author tags
  Array.from(filters.authors).forEach((authorSlug) => {
    const author = allPeople.find((p) => p.slug === authorSlug);
    const authorName = author?.name || authorSlug;
    // Truncate long author names
    const displayName = authorName.length > 15 ? authorName.substring(0, 15) + '...' : authorName;
    tags.push(`
      <span class="badge rounded-pill text-bg-primary me-1 mb-1 d-inline-flex align-items-center" title="${escapeHtml(authorName)}">
        ${escapeHtml(displayName)}
        <button type="button" class="btn-close btn-close-white btn-sm ms-1" style="font-size: 0.65rem;" aria-label="Remove author ${escapeHtml(authorName)}" data-filter-type="author" data-filter-value="${escapeHtml(authorSlug)}"></button>
      </span>
    `);
  });

  // Title search tag
  if (filters.titleQuery.trim()) {
    const query = filters.titleQuery;
    const displayQuery = query.length > 15 ? query.substring(0, 15) + '...' : query;
    tags.push(`
      <span class="badge rounded-pill text-bg-primary me-1 mb-1 d-inline-flex align-items-center" title="Search: ${escapeHtml(query)}">
        "${escapeHtml(displayQuery)}"
        <button type="button" class="btn-close btn-close-white btn-sm ms-1" style="font-size: 0.65rem;" aria-label="Clear search" data-filter-type="title"></button>
      </span>
    `);
  }

  tagsContainer.innerHTML = `
    <div class="mb-3 pb-3 border-bottom">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <small class="text-muted fw-semibold">Active Filters (${totalActiveFilters})</small>
        <button type="button" class="btn btn-link btn-sm p-0 text-decoration-none" id="clear-all-filters-inline" style="font-size: 0.75rem;">
          Clear all
        </button>
      </div>
      <div class="d-flex flex-wrap gap-1">
        ${tags.join('')}
      </div>
    </div>
  `;

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

  // Attach event listener to "Clear all" button in sidebar
  const clearAllInline = document.getElementById('clear-all-filters-inline');
  if (clearAllInline) {
    clearAllInline.addEventListener('click', () => {
      clearAllFilters();
    });
  }
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

  // Get projects with publications (excluding unassigned-publications from theme filter)
  const projectsWithPublications = researchProjects
    .filter((p) => p.slug !== 'unassigned-publications' && p.publicationIds && p.publicationIds.length > 0)
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
      <div id="bp-active-filters"></div>
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
  if (!main) {
    throw new Error('Main container not found');
  }

  const pageHtml = `
    <div class="container py-5">
      <header class="mb-4">
        <h1 class="mb-3">Research Outputs</h1>
        <p class="lead text-muted mb-2">Browse Beyond Prediction's research outputs</p>
        <p class="small text-muted mb-4"><em>This is an incomplete list, and is being actively added to.</em></p>
      </header>

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

  main.innerHTML = pageHtml;
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
