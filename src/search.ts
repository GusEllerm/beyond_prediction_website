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
import { createPublicationLookup, getPublicationUrl } from './utils/publications';
import { getPublicationAuthors } from './utils/authorMatching';
import { researchProjects } from './data/researchProjects';
import type { PersonPublication } from './data/publications';

// Import utilities
import { escapeHtml } from './utils/dom';

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
 * Gets all publications from all projects
 */
function getAllPublications(): Array<PersonPublication & { projectSlug: string; projectTitle: string }> {
  const publications: Array<PersonPublication & { projectSlug: string; projectTitle: string }> = [];
  const lookup = createPublicationLookup();
  const seenPublicationIds = new Set<string>();

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

  return publications;
}

/**
 * Renders publications by matched authors
 * @param container - The container element to render into
 * @param matchedPersonSlugs - Array of person slugs that matched the search
 */
function renderAuthorPublicationsSection(
  container: HTMLElement,
  matchedPersonSlugs: string[]
): void {
  if (!matchedPersonSlugs.length) return;

  const allPublications = getAllPublications();
  const matchedPublications = new Map<string, PersonPublication & { projectSlug: string; projectTitle: string }>();

  // Find publications by matched authors
  for (const pub of allPublications) {
    const authors = getPublicationAuthors(pub, allPeople);
    const hasMatchedAuthor = authors.some((author) => matchedPersonSlugs.includes(author.slug));
    
    if (hasMatchedAuthor) {
      matchedPublications.set(pub.id, pub);
    }
  }

  if (matchedPublications.size === 0) return;

  // Get person names for the heading
  const personBySlug = new Map<string, Person>(
    allPeople.map((p) => [p.slug, p])
  );
  const matchedPersonNames = matchedPersonSlugs
    .map((slug) => personBySlug.get(slug)?.name)
    .filter(Boolean) as string[];

  const headingText = matchedPersonNames.length === 1
    ? `Research Outputs by ${matchedPersonNames[0]}`
    : `Research Outputs by ${matchedPersonNames.join(', ')}`;

  const cardsHtml = Array.from(matchedPublications.values())
    .sort((a, b) => {
      // Sort by year (newest first), then by title
      if (a.year !== b.year) {
        if (!a.year) return 1;
        if (!b.year) return -1;
        return b.year - a.year;
      }
      return a.title.localeCompare(b.title);
    })
    .map((pub) => {
      const url = getPublicationUrl(pub);
      const yearDisplay = pub.year ? ` (${pub.year})` : '';
      const venueDisplay = pub.venue ? ` ${escapeHtml(pub.venue)}` : '';
      const projectUrl = `/project.html?project=${encodeURIComponent(pub.projectSlug)}`;

      // Get matched authors for this publication
      const authors = getPublicationAuthors(pub, allPeople);
      const authorsHtml = authors.length > 0
        ? `<p class="card-text small mb-2">
            <span class="text-muted">Authors:</span>
            ${authors.map((author) => 
              `<a href="/person.html?person=${encodeURIComponent(author.slug)}" class="text-decoration-none">${escapeHtml(author.name)}</a>`
            ).join(', ')}
          </p>`
        : '';

      return `
        <div class="card mb-3">
          <div class="card-body">
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
        </div>
      `;
    })
    .join('');

  container.innerHTML += `
    <section class="mt-4">
      <h2 class="h5 mb-3">${escapeHtml(headingText)}</h2>
      <div class="bp-publications-container">
        ${cardsHtml}
      </div>
    </section>
  `;
}

/**
 * Renders search results in the container
 * @param container - The container element to render results into (should be #bp-main)
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

  // Build HTML content directly (container is #bp-main)
  const wrapperHtml = `
    <div class="container py-5">
      <h1 class="mb-4">Search results</h1>
      <p class="text-muted mb-4">Showing ${allMatches.length} result(s) for "<strong>${escapeHtml(query)}</strong>".</p>
    </div>
  `;

  container.innerHTML = wrapperHtml;
  const wrapper = container.querySelector<HTMLElement>('.container');

  if (!wrapper) return;

  // Render projects first, then publications, then people
  renderProjectsSection(wrapper, projectResults);
  renderPublicationsSection(wrapper, publicationResults);
  renderPeopleSection(wrapper, personResults);

  // If people matched, also show their publications
  if (personResults.length > 0 && !typeFilter) {
    const matchedPersonSlugs = personResults.map((item) => item.id);
    renderAuthorPublicationsSection(wrapper, matchedPersonSlugs);
  }
}

/**
 * Initializes the search page
 */
function initSearchPage(): void {
  const app = document.querySelector<HTMLDivElement>('#app');
  const main = document.querySelector<HTMLElement>('#bp-main');

  if (!app || !main) {
    throw new Error('#app container or #bp-main not found');
  }

  // Create navbar container
  const navbarContainer = document.createElement('div');
  navbarContainer.id = 'navbar-container';
  app.insertBefore(navbarContainer, main);
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

  // Render results into main element
  renderResults(main, query, typeFilter);

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
        const main = document.querySelector<HTMLElement>('#bp-main');
        if (main) {
          main.innerHTML = `
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
      const main = document.querySelector<HTMLElement>('#bp-main');
      if (main) {
        main.innerHTML = `
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
  const main = document.querySelector<HTMLElement>('#bp-main');
  if (main) {
    main.innerHTML = `
      <div class="container py-5">
        <h1 class="mb-4">Search</h1>
        <p class="text-danger">A fatal error occurred. Please try refreshing the page.</p>
        <pre class="bg-light p-3 rounded">${escapeHtml(String(error))}</pre>
      </div>
    `;
  }
}
