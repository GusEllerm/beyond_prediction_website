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

// Import search utilities
import { searchRecords, type SearchRecord } from './searchIndex';

/**
 * Parses the search query from URL query parameters
 * @returns The search query string or empty string if not found
 */
function getSearchQueryFromUrl(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get('q') ?? '';
}

/**
 * Escapes HTML special characters to prevent XSS
 * @param text - Text to escape
 * @returns Escaped HTML string
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Renders search results in the container
 * @param container - The container element to render results into
 * @param q - The search query string
 * @param records - Array of search result records
 */
function renderResults(
  container: HTMLElement,
  q: string,
  records: SearchRecord[]
): void {
  if (!q) {
    container.innerHTML = `
      <div class="container py-5">
        <h1 class="mb-4">Search</h1>
        <p class="text-muted">Enter a term in the search bar above to find research themes and projects.</p>
      </div>
    `;
    return;
  }

  if (records.length === 0) {
    container.innerHTML = `
      <div class="container py-5">
        <h1 class="mb-4">Search results</h1>
        <p class="text-muted">No results found for "<strong>${escapeHtml(q)}</strong>".</p>
        <p class="text-muted">Try a different keyword, or browse the main research themes.</p>
        <a href="/" class="btn btn-outline-primary mt-3">Back to research themes</a>
      </div>
    `;
    return;
  }

  const itemsHtml = records
    .map(
      (record) => `
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-body">
              <h2 class="h5 card-title">${escapeHtml(record.title)}</h2>
              <p class="card-text">${escapeHtml(record.summary)}</p>
              <a href="${escapeHtml(record.href)}" class="stretched-link">View project</a>
            </div>
          </div>
        </div>
      `
    )
    .join('');

  container.innerHTML = `
    <div class="container py-5">
      <h1 class="mb-4">Search results</h1>
      <p class="text-muted mb-4">Showing ${records.length} result(s) for "<strong>${escapeHtml(q)}</strong>".</p>
      <div class="row g-4">
        ${itemsHtml}
      </div>
    </div>
  `;
}

/**
 * Initializes the search page
 */
function initSearchPage(): void {
  const app = document.querySelector<HTMLDivElement>('#app');

  if (!app) {
    throw new Error('#app container not found');
  }

  // Create navbar container
  const navbarContainer = document.createElement('div');
  navbarContainer.id = 'navbar-container';
  app.appendChild(navbarContainer);
  renderNavbar(navbarContainer);

  // Get search query from URL
  const query = getSearchQueryFromUrl();

  // Sync the search input with the query if present
  const searchInput = navbarContainer.querySelector<HTMLInputElement>('#bp-search-input');
  if (searchInput && query) {
    searchInput.value = query;
  }

  // Perform search
  const results = query ? searchRecords(query) : [];

  // Create main content container
  const mainContainer = document.createElement('div');
  mainContainer.id = 'search-results-container';
  app.appendChild(mainContainer);
  renderResults(mainContainer, query, results);

  // Create footer container
  const footerContainer = document.createElement('div');
  footerContainer.id = 'footer-container';
  app.appendChild(footerContainer);
  footerContainer.innerHTML = renderFooter(partners);
}

// Initialize the page when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSearchPage);
} else {
  initSearchPage();
}

