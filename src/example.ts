// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Import Bootstrap JS (for navbar toggle and other interactive components)
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Import custom styles
import './styles.css';

// Import components
import { renderNavbar } from './components/navbar';
import { renderFooter } from './components/footer';
import { renderBreadcrumb } from './components/breadcrumb';
import { partners } from './data/partners';

// Import project data
import { findProjectDetail, type ExampleShowcaseKind } from './data/researchProjects';
import type { PersonPublication } from './data/publications';

const navbarContainer = document.querySelector<HTMLElement>('#navbar');
const app = document.querySelector<HTMLElement>('#app');
const footerContainer = document.querySelector<HTMLElement>('#footer');

if (!navbarContainer || !app || !footerContainer) {
  throw new Error('Layout containers not found on Example page');
}

renderNavbar(navbarContainer);
footerContainer.innerHTML = renderFooter(partners);

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
 * Parses the project and example slugs from URL query parameters
 * @returns Object with project and example slugs, or null if not found
 */
function getSlugsFromUrl(): { projectSlug: string; exampleSlug: string } | null {
  const params = new URLSearchParams(window.location.search);
  const projectSlug = params.get('project');
  const exampleSlug = params.get('example');
  
  if (!projectSlug || !exampleSlug) {
    return null;
  }
  
  return { projectSlug, exampleSlug };
}

// Load all publication snapshots to create a lookup by publication ID
const openAlexSnapshots = import.meta.glob(
  './data/publications/openalex/*.json',
  {
    eager: true,
  }
) as Record<string, { default: { works: PersonPublication[] } }>;

const orcidSnapshots = import.meta.glob('./data/publications/orcid/*.json', {
  eager: true,
}) as Record<string, { default: { works: PersonPublication[] } }>;

/**
 * Creates a lookup map of publications by their ID
 * @returns Map of publication ID to publication object
 */
function createPublicationLookup(): Map<string, PersonPublication> {
  const lookup = new Map<string, PersonPublication>();
  
  // Process OpenAlex snapshots
  for (const mod of Object.values(openAlexSnapshots)) {
    const snapshot = mod.default;
    if (snapshot?.works) {
      for (const work of snapshot.works) {
        if (work.id) {
          lookup.set(work.id, work);
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
      }
    }
  }
  
  return lookup;
}

/**
 * Gets publications by their IDs
 * @param publicationIds - Array of publication IDs (OpenAlex work IDs)
 * @returns Array of publication objects
 */
function getPublicationsByIds(publicationIds: string[]): PersonPublication[] {
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
function getPublicationUrl(work: PersonPublication): string {
  if (work.openAccessUrl) return work.openAccessUrl;
  if (work.doi) {
    const cleanDoi = work.doi.replace(/^doi:/i, '').trim();
    return `https://doi.org/${cleanDoi}`;
  }
  if (work.id) return work.id;
  return '#';
}

/**
 * Renders the showcase feature based on its kind
 * @param kind - The showcase kind
 * @param source - The showcase source (URL or HTML)
 * @returns HTML string for the showcase content (without description)
 */
function renderShowcaseContent(
  kind: ExampleShowcaseKind | undefined,
  source: string | undefined
): string {
  if (!kind || !source) {
    return '';
  }

  switch (kind) {
    case 'iframe':
      return `
        <div class="ratio ratio-16x9">
          <iframe
            src="${escapeHtml(source)}"
            title="Example showcase"
            loading="lazy"
            class="border-0 rounded w-100 h-100"
            allowfullscreen
          ></iframe>
        </div>
      `;
    case 'image':
      return `
        <img
          src="${escapeHtml(source)}"
          alt="Example showcase"
          class="img-fluid rounded"
          loading="lazy"
        />
      `;
    case 'video':
      return `
        <div class="ratio ratio-16x9">
          <video
            src="${escapeHtml(source)}"
            controls
            class="rounded w-100 h-100"
          ></video>
        </div>
      `;
    case 'html':
      return source;
    default:
      return '';
  }
}

/**
 * Renders the publications section
 * @param publications - Array of publications
 * @returns HTML string for the publications section
 */
function renderPublicationsSection(publications: PersonPublication[]): string {
  if (!publications || publications.length === 0) {
    return '';
  }

  const cardsHtml = publications
    .map((work) => {
      const metaParts: string[] = [];
      if (typeof work.year === 'number') metaParts.push(String(work.year));
      if (work.venue) metaParts.push(work.venue);

      const metaHtml = metaParts.length
        ? `<p class="card-text mb-1 text-muted small">${escapeHtml(metaParts.join(' · '))}</p>`
        : '';

      const url = getPublicationUrl(work);

      return `
        <div class="col">
          <a href="${escapeHtml(url)}" class="text-decoration-none text-reset" target="_blank" rel="noopener noreferrer">
            <article class="card h-100">
              <div class="card-body">
                <h3 class="h6 card-title mb-1">${escapeHtml(work.title)}</h3>
                ${metaHtml}
              </div>
            </article>
          </a>
        </div>
      `;
    })
    .join('');

  return `
    <section class="mt-4">
      <h2 class="h4 mb-2">Associated publications</h2>
      <div class="row row-cols-1 g-3">
        ${cardsHtml}
      </div>
    </section>
  `;
}

/**
 * Renders the example detail page
 */
function renderExample(): void {
  if (!app) return;

  const slugs = getSlugsFromUrl();
  if (!slugs) {
    app.innerHTML = `
      <div class="container py-5">
        <div class="alert alert-danger" role="alert">
          <h1 class="h4">Example not found</h1>
          <p>Please provide both project and example parameters in the URL.</p>
          <a href="/" class="btn btn-primary">Return to home</a>
        </div>
      </div>
    `;
    return;
  }

  const { projectSlug, exampleSlug } = slugs;
  const project = findProjectDetail(projectSlug);
  
  if (!project) {
    app.innerHTML = `
      <div class="container py-5">
        <div class="alert alert-danger" role="alert">
          <h1 class="h4">Project not found</h1>
          <p>The project "${escapeHtml(projectSlug)}" could not be found.</p>
          <a href="/" class="btn btn-primary">Return to home</a>
        </div>
      </div>
    `;
    return;
  }

  // Find the example in the project by slug
  const example = project.examples?.find(
    (ex) => ex.slug === exampleSlug
  );

  if (!example) {
    app.innerHTML = `
      <div class="container py-5">
        <div class="alert alert-danger" role="alert">
          <h1 class="h4">Example not found</h1>
          <p>The example "${escapeHtml(exampleSlug)}" could not be found for this project.</p>
          <a href="/project.html?project=${encodeURIComponent(projectSlug)}" class="btn btn-primary">Return to project</a>
        </div>
      </div>
    `;
    return;
  }

  // Get publications for this example
  const publications = example.publicationIds
    ? getPublicationsByIds(example.publicationIds)
    : [];

  // Render showcase content
  const showcaseContent = renderShowcaseContent(
    example.showcaseKind,
    example.showcaseSource
  );

  // Render publications section
  const publicationsHtml = renderPublicationsSection(publications);

  const breadcrumbHtml = renderBreadcrumb([
    { label: 'Home', href: '/' },
    { label: project.title, href: `/project.html?project=${encodeURIComponent(projectSlug)}` },
    { label: example.title },
  ]);

  const pageHeaderHtml = `
    <header class="bp-page-header">
      <div class="container py-3">
        ${breadcrumbHtml}
      </div>
    </header>
  `;

  app.innerHTML = `
    ${pageHeaderHtml}
    <main class="container py-4">
      <header class="mb-4">
        <h1 class="h3 mb-1">${escapeHtml(example.title)}</h1>
        <p class="text-muted mb-0">Project from ${escapeHtml(project.title)}</p>
      </header>
      <div class="row">
        <div class="col-lg-10 col-xl-8">
          <section class="bp-example-content">
            <p class="lead">${escapeHtml(example.description)}</p>
          </section>
        </div>
      </div>
      ${showcaseContent
        ? example.showcaseDescription
          ? `
            <div class="row">
              <div class="col-lg-10 col-xl-8">
                <div class="bp-showcase-section mb-0">
                  ${showcaseContent}
                </div>
              </div>
              <div class="col-lg-2 col-xl-4">
                <div class="bp-showcase-annotation">
                  <p class="text-muted mb-0">${escapeHtml(example.showcaseDescription)}</p>
                </div>
              </div>
            </div>
          `
          : `
            <div class="row">
              <div class="col-lg-10 col-xl-8">
                <div class="mb-4">
                  ${showcaseContent}
                </div>
              </div>
            </div>
          `
        : ''}
      ${publicationsHtml ? `
        <div class="row">
          <div class="col-12">
            ${publicationsHtml}
          </div>
        </div>
      ` : ''}
    </main>
  `;
}

// Initialize the page when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderExample);
} else {
  renderExample();
}

