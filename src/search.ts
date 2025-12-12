// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Import Bootstrap JS (for navbar toggle and other interactive components)
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Import custom styles
import './styles.css';

// Import components
import { renderNavbar } from './components/navbar';
import { renderFooter } from './components/footer';
import { renderPersonCard } from './components/personCard';
import { partners } from './data/partners';

// Import search utilities
import { searchItems, type SearchItem, type SearchItemType } from './data/searchIndex';
import { allPeople, type Person } from './data/people';

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
 * Parses the search query and type filter from URL query parameters
 * @returns Object with query string and optional type filter
 */
function getSearchParamsFromUrl(): { query: string; typeFilter?: SearchItemType } {
  const params = new URLSearchParams(window.location.search);
  const query = (params.get('q') ?? '').trim();
  const typeParam = params.get('type');
  const typeFilter: SearchItemType | undefined =
    typeParam === 'people' ? 'person' 
    : typeParam === 'projects' ? 'project' 
    : typeParam === 'publications' ? 'publication'
    : undefined;
  return { query, typeFilter };
}

/**
 * Renders the projects section
 * @param container - The container element to render into
 * @param results - Array of project search items
 */
function renderProjectsSection(
  container: HTMLElement,
  results: SearchItem[]
): void {
  if (!results.length) return;

  const cardsHtml = results
    .map(
      (item) => `
        <div class="col-md-4 mb-3">
          <a href="${escapeHtml(item.url)}" class="text-decoration-none text-reset">
            <div class="card h-100">
              <div class="card-body">
                <h5 class="card-title">${escapeHtml(item.title)}</h5>
                <p class="card-text">${escapeHtml(item.summary)}</p>
              </div>
            </div>
          </a>
        </div>
      `
    )
    .join('');

  container.innerHTML += `
    <section class="mt-4">
      <h2 class="h5 mb-3">Projects</h2>
      <div class="row g-3">
        ${cardsHtml}
      </div>
    </section>
  `;
}

/**
 * Renders the publications section
 * @param container - The container element to render into
 * @param results - Array of publication search items
 */
function renderPublicationsSection(
  container: HTMLElement,
  results: SearchItem[]
): void {
  if (!results.length) return;

  const cardsHtml = results
    .map(
      (item) => `
        <div class="col-md-6 mb-3">
          <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="text-decoration-none text-reset">
            <div class="card h-100">
              <div class="card-body">
                <h5 class="card-title">${escapeHtml(item.title)}</h5>
                <p class="card-text small text-muted mb-0">${escapeHtml(item.summary)}</p>
              </div>
            </div>
          </a>
        </div>
      `
    )
    .join('');

  container.innerHTML += `
    <section class="mt-4">
      <h2 class="h5 mb-3">Publications</h2>
      <div class="row g-3">
        ${cardsHtml}
      </div>
    </section>
  `;
}

/**
 * Renders the people section
 * @param container - The container element to render into
 * @param results - Array of person search items
 */
function renderPeopleSection(
  container: HTMLElement,
  results: SearchItem[]
): void {
  if (!results.length) return;

  // Build a slug → Person map
  const personBySlug = new Map<string, Person>(
    allPeople.map((p) => [p.slug, p])
  );

  const cardsHtml = results
    .map((item) => {
      const person = personBySlug.get(item.id);
      if (!person) return '';
      return renderPersonCard(person);
    })
    .join('');

  container.innerHTML += `
    <section class="mt-4">
      <h2 class="h5 mb-3">People</h2>
      <div class="row g-4">
        ${cardsHtml}
      </div>
    </section>
  `;
}

/**
 * Renders search results in the container
 * @param container - The container element to render results into
 * @param query - The search query string
 * @param typeFilter - Optional type filter
 */
function renderResults(
  container: HTMLElement,
  query: string,
  typeFilter?: SearchItemType
): void {
  if (!query) {
    container.innerHTML = `
      <div class="container py-5">
        <h1 class="mb-4">Search</h1>
        <p class="text-muted">Enter a term in the search bar above to find research themes, projects, and people.</p>
      </div>
    `;
    return;
  }

  // Perform search
  const allMatches = searchItems(query, typeFilter);

  // Split results by type
  let projectResults = allMatches.filter((item) => item.type === 'project');
  let publicationResults = allMatches.filter((item) => item.type === 'publication');
  let personResults = allMatches.filter((item) => item.type === 'person');

  // If type filter was passed, hide other results
  if (typeFilter === 'person') {
    projectResults = [];
    publicationResults = [];
  } else if (typeFilter === 'project') {
    publicationResults = [];
    personResults = [];
  } else if (typeFilter === 'publication') {
    projectResults = [];
    personResults = [];
  }

  if (allMatches.length === 0) {
    container.innerHTML = `
      <div class="container py-5">
        <h1 class="mb-4">Search results</h1>
        <p class="text-muted">No results found for "<strong>${escapeHtml(query)}</strong>".</p>
        <p class="text-muted">Try a different keyword, or browse the main research themes.</p>
        <a href="/" class="btn btn-outline-primary mt-3">Back to research themes</a>
      </div>
    `;
    return;
  }

  // Create a wrapper div for the results
  const wrapper = document.createElement('div');
  wrapper.className = 'container py-5';
  wrapper.innerHTML = `
    <h1 class="mb-4">Search results</h1>
    <p class="text-muted mb-4">Showing ${allMatches.length} result(s) for "<strong>${escapeHtml(query)}</strong>".</p>
  `;

  // Render projects first, then publications, then people
  renderProjectsSection(wrapper, projectResults);
  renderPublicationsSection(wrapper, publicationResults);
  renderPeopleSection(wrapper, personResults);

  container.innerHTML = '';
  container.appendChild(wrapper);
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

  // Get search parameters from URL
  const { query, typeFilter } = getSearchParamsFromUrl();

  // Sync the search input with the query if present
  const searchInput = navbarContainer.querySelector<HTMLInputElement>(
    '#bp-search-input'
  );
  if (searchInput && query) {
    searchInput.value = query;
  }

  // Create main content container
  const mainContainer = document.createElement('div');
  mainContainer.id = 'search-results-container';
  app.appendChild(mainContainer);
  renderResults(mainContainer, query, typeFilter);

  // Create footer container
  const footerContainer = document.createElement('div');
  footerContainer.id = 'footer-container';
  app.appendChild(footerContainer);
  footerContainer.innerHTML = renderFooter(partners);
}

// Initialize the page when DOM is ready
try {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      try {
        initSearchPage();
      } catch (error) {
        console.error('Error initializing search page:', error);
        const app = document.querySelector<HTMLDivElement>('#app');
        if (app) {
          app.innerHTML = `
            <div class="container py-5">
              <h1 class="mb-4">Search</h1>
              <p class="text-danger">An error occurred while loading the search page. Please try refreshing the page.</p>
              <pre class="bg-light p-3 rounded">${escapeHtml(String(error))}</pre>
            </div>
          `;
        }
      }
    });
  } else {
    try {
      initSearchPage();
    } catch (error) {
      console.error('Error initializing search page:', error);
      const app = document.querySelector<HTMLDivElement>('#app');
      if (app) {
        app.innerHTML = `
          <div class="container py-5">
            <h1 class="mb-4">Search</h1>
            <p class="text-danger">An error occurred while loading the search page. Please try refreshing the page.</p>
            <pre class="bg-light p-3 rounded">${escapeHtml(String(error))}</pre>
          </div>
        `;
      }
    }
  }
} catch (error) {
  console.error('Fatal error in search page:', error);
  const app = document.querySelector<HTMLDivElement>('#app');
  if (app) {
    app.innerHTML = `
      <div class="container py-5">
        <h1 class="mb-4">Search</h1>
        <p class="text-danger">A fatal error occurred. Please try refreshing the page.</p>
        <pre class="bg-light p-3 rounded">${escapeHtml(String(error))}</pre>
      </div>
    `;
  }
}
