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

// Import data
import { partners } from './data/partners';
import { allPeople, type Person, type PublicationSource } from './data/people';
import type { PersonPublication, PersonPublicationsSnapshot } from './data/publications';
import { researchProjects, type ResearchProject } from './data/researchProjects';

// Import utilities
import { escapeHtml } from './utils/dom';
import { renderPublicationCard } from './components/publicationCard';

const navbarContainer = document.querySelector<HTMLElement>('#navbar');
const main = document.querySelector<HTMLElement>('#bp-main');
const footerContainer = document.querySelector<HTMLElement>('#footer');

if (!navbarContainer || !main || !footerContainer) {
  throw new Error('Layout containers not found on Person page');
}

renderNavbar(navbarContainer);
footerContainer.innerHTML = renderFooter(partners);

// Load all publication snapshots from both sources
const openAlexSnapshots = import.meta.glob('./data/publications/openalex/*.json', {
  eager: true,
}) as Record<string, { default: PersonPublicationsSnapshot }>;

const orcidSnapshots = import.meta.glob('./data/publications/orcid/*.json', {
  eager: true,
}) as Record<string, { default: PersonPublicationsSnapshot }>;

/**
 * Gets publications snapshot for a person based on their publicationSource
 * @param person - The person object
 * @returns The publications snapshot or null if not found
 */
function getSnapshotForPerson(person: Person): PersonPublicationsSnapshot | null {
  const source: PublicationSource = person.publicationSource ?? 'openalex';

  const modules = source === 'orcid' ? orcidSnapshots : openAlexSnapshots;

  const targetSuffix = `/${person.slug}.json`;
  for (const [path, mod] of Object.entries(modules)) {
    if (path.endsWith(targetSuffix)) {
      const data =
        (mod && typeof mod === 'object' && 'default' in mod)
          ? (mod as { default: PersonPublicationsSnapshot }).default
          : (mod as PersonPublicationsSnapshot);
      return data as PersonPublicationsSnapshot;
    }
  }

  return null;
}

/**
 * Gets publications for a person
 * @param person - The person object
 * @returns Array of publications or null if not found
 */
function getPublicationsForPerson(person: Person): PersonPublication[] | null {
  const snapshot = getSnapshotForPerson(person);
  return snapshot?.works ?? null;
}

/**
 * Renders the publications section HTML as Bootstrap cards
 * @param person - The person object (to determine source)
 * @param publications - Array of publications or null
 * @returns HTML string for the publications section
 */
function renderPublicationsSection(
  person: Person,
  publications: PersonPublication[] | null
): string {
  const source: PublicationSource = person.publicationSource ?? 'openalex';
  const sourceLabel = source === 'orcid' ? 'ORCID' : 'OpenAlex';

  if (!publications || publications.length === 0) {
    return `
      <section class="mt-4" aria-labelledby="recent-publications-heading">
        <h2 id="recent-publications-heading" class="h5 mb-2">Recent publications (${sourceLabel})</h2>
        <p class="text-muted mb-0">No publications found.</p>
      </section>
    `;
  }

  const cardsHtml = publications
    .slice(0, 10) // show up to 10
    .map((work) => {
      const cardHtml = renderPublicationCard(work, {
        showAuthors: true,
        showAuthorPhotos: true,
        showVenue: true,
        showYear: true,
        compact: false,
        headingLevel: 'h5',
        withMargin: true,
      });
      // Wrap in column div for grid layout
      return `<div class="col">${cardHtml}</div>`;
    })
    .join('');

  return `
    <section class="mt-4" aria-labelledby="recent-publications-heading">
      <h2 id="recent-publications-heading" class="h5 mb-3">Recent publications (${sourceLabel})</h2>
      <div class="row row-cols-1 g-3">
        ${cardsHtml}
      </div>
      <p class="text-muted small mt-2 mb-0">
        Publications retrieved from the ${sourceLabel} API (snapshot updated periodically).
      </p>
    </section>
  `;
}

/**
 * Gets research projects/themes associated with a person
 * @param person - The person object
 * @param allProjects - Array of all research projects
 * @returns Array of research projects the person is involved in
 */
function getProjectsForPerson(person: Person, allProjects: ResearchProject[]): ResearchProject[] {
  if (!person.themeSlugs || person.themeSlugs.length === 0) {
    return [];
  }

  const themeSlugSet = new Set(person.themeSlugs);

  return allProjects.filter((project) => themeSlugSet.has(project.slug));
}

/**
 * Renders the research themes & projects section for a person
 * @param personProjects - Array of research projects associated with the person
 * @returns HTML string for the themes section, or empty string if no projects
 */
function renderPersonThemesSection(personProjects: ResearchProject[]): string {
  if (!personProjects.length) {
    return '';
  }

  const cardsHtml = personProjects
    .map((project) => {
      const title = escapeHtml(project.title);
      const description = project.shortDescription ? escapeHtml(project.shortDescription) : '';
      const slug = escapeHtml(project.slug);

      return `
        <div class="col-md-6">
          <article class="card h-100">
            <div class="card-body">
              <h3 class="h5 card-title mb-1">${title}</h3>
              ${description ? `<p class="card-text small text-muted mb-2">${description}</p>` : ''}
              <a
                href="/project.html?project=${slug}"
                class="btn btn-sm btn-outline-primary"
              >
                View theme
              </a>
            </div>
          </article>
        </div>
      `;
    })
    .join('');

  return `
    <section class="mb-4" aria-labelledby="bp-person-themes-heading">
      <h2 id="bp-person-themes-heading" class="h4 mb-3">Research Themes &amp; Projects</h2>
      <div class="row g-3">
        ${cardsHtml}
      </div>
    </section>
  `;
}

/**
 * Renders the biography section for a person
 * @param person - The person object
 * @returns HTML string for the biography section
 */
function renderBiographySection(person: Person): string {
  if (!person.bio) {
    return `
      <section class="mb-4">
        <h2 class="h5 mb-2">Biography</h2>
        <p class="text-muted mb-0">
          Profile details will be added soon.
        </p>
      </section>
    `;
  }

  const bioSourcesHtml = renderBioSources(person);

  return `
    <section class="mb-4">
      <h2 class="h5 mb-2">Biography</h2>
      <p class="mb-0">
        ${escapeHtml(person.bio)}
      </p>
      ${bioSourcesHtml}
    </section>
  `;
}

/**
 * Renders the biography sources section
 * @param person - The person object
 * @returns HTML string for the sources section, or empty string if no sources
 */
function renderBioSources(person: Person): string {
  if (!person.bioSources || person.bioSources.length === 0) {
    return '';
  }

  const items = person.bioSources
    .map(
      (source) => `
        <li class="small">
          <a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">
            ${escapeHtml(source.label)}
          </a>
        </li>
      `
    )
    .join('');

  return `
    <div class="mt-2">
      <h3 class="visually-hidden">Biography sources</h3>
      <ul class="mb-0 ps-3">
        ${items}
      </ul>
    </div>
  `;
}

/**
 * Parses the person slug from the URL query parameters
 * @returns The person slug or null if not found
 */
function getPersonSlugFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('person');
  return slug;
}

/**
 * Finds a person by their slug
 * @param slug - The person slug to search for
 * @returns The person object or null if not found
 */
function findPersonBySlug(slug: string | null): Person | null {
  if (!slug) return null;
  return allPeople.find((person) => person.slug === slug) ?? null;
}

/**
 * Renders the body content for "person not found" view
 * @returns HTML string for the body content
 */
function renderPersonNotFoundBody(): string {
  return `
    <div class="container py-4">
      <p class="text-muted mb-4">We couldn't find the requested profile.</p>
      <a href="/people.html" class="btn btn-outline-primary">Back to People</a>
    </div>
  `;
}

/**
 * Renders the body content for a person detail view
 * @param p - The person object to render
 * @returns HTML string for the body content
 */
function renderPersonDetailBody(p: Person): string {
  const safeName = escapeHtml(p.name);

  // Build badges for the left column (under image)
  const badges: string[] = [];

  // Compute badge URLs for role and organisation
  const roleQuery = p.roleLabel ? encodeURIComponent(p.roleLabel) : '';
  const orgQuery = p.affiliation ? encodeURIComponent(p.affiliation) : '';

  const roleHref = roleQuery ? `/search.html?q=${roleQuery}&type=people` : null;
  const orgHref = orgQuery ? `/search.html?q=${orgQuery}&type=people` : null;

  if (p.roleLabel) {
    if (roleHref) {
      badges.push(
        `<a href="${roleHref}" class="badge rounded-pill bg-secondary me-1 mb-1 text-decoration-none">${escapeHtml(p.roleLabel)}</a>`
      );
    } else {
      badges.push(
        `<span class="badge rounded-pill bg-secondary me-1 mb-1">${escapeHtml(p.roleLabel)}</span>`
      );
    }
  }

  if (p.affiliation) {
    if (orgHref) {
      badges.push(
        `<a href="${orgHref}" class="badge rounded-pill bg-primary me-1 mb-1 text-decoration-none">${escapeHtml(p.affiliation)}</a>`
      );
    } else {
      badges.push(
        `<span class="badge rounded-pill bg-primary me-1 mb-1">${escapeHtml(p.affiliation)}</span>`
      );
    }
  }

  if (p.orcidId) {
    badges.push(
      `<a href="https://orcid.org/${escapeHtml(p.orcidId)}" target="_blank" rel="noopener noreferrer" class="badge rounded-pill bg-success text-decoration-none me-1 mb-1">ORCID: ${escapeHtml(p.orcidId)}</a>`
    );
  }

  const badgesHtml = badges.length
    ? `<div class="d-flex flex-wrap gap-2">${badges.join('')}</div>`
    : '';

  // Biography section
  const biographySectionHtml = renderBiographySection(p);

  // Contact section (for aside column)
  const contactItems: string[] = [];

  if (p.email) {
    contactItems.push(
      `<li class="mb-1"><strong>Email:</strong> <a href="mailto:${escapeHtml(p.email)}">${escapeHtml(p.email)}</a></li>`
    );
  }
  if (p.website) {
    contactItems.push(
      `<li class="mb-1"><strong>Website:</strong> <a href="${escapeHtml(p.website)}" target="_blank" rel="noopener noreferrer">${escapeHtml(p.website)}</a></li>`
    );
  }

  const contactSectionHtml = contactItems.length
    ? `
      <section class="mt-3">
        <h2 class="h6 mb-2">Contact</h2>
        <ul class="list-unstyled mb-0 small">
          ${contactItems.join('')}
        </ul>
      </section>
    `
    : '';

  // Tags section (for aside column)
  const tagsSectionHtml =
    p.tags && p.tags.length
      ? `
        <section class="mt-3">
          <h2 class="h6 mb-2">Research areas & interests</h2>
          <div class="d-flex flex-wrap gap-2">
            ${p.tags.map((tag) => `<span class="badge bg-light text-dark border">${escapeHtml(tag)}</span>`).join('')}
          </div>
        </section>
      `
      : '';

  // Left column: image, badges, tags, and contact
  const asideColumn =
    p.photoUrl || badges.length || tagsSectionHtml || contactSectionHtml
      ? `
      <aside class="col-md-4 col-lg-3 mb-4">
        ${
          p.photoUrl
            ? `<img 
          src="${escapeHtml(p.photoUrl)}" 
          class="img-fluid rounded mb-3" 
          alt="${safeName}" 
        />`
            : ''
        }
        ${badgesHtml}
        ${tagsSectionHtml}
        ${contactSectionHtml}
      </aside>
    `
      : '';

  // Right column: name, bio, themes, publications
  // Get projects for this person
  const personProjects = getProjectsForPerson(p, researchProjects);
  const themesSectionHtml = renderPersonThemesSection(personProjects);

  // Get publications for this person
  const publications = getPublicationsForPerson(p);
  const publicationsSectionHtml = renderPublicationsSection(p, publications);

  const mainColumn = `
    <section class="col-md-8 col-lg-9 mb-4">
      <h1 class="display-5 mb-2">${safeName}</h1>
      ${p.title ? `<p class="text-muted mb-3">${escapeHtml(p.title)}</p>` : ''}
      ${biographySectionHtml}
      ${themesSectionHtml}
      ${publicationsSectionHtml}
    </section>
  `;

  return `
    <div class="container py-4">
      <div class="row">
        ${asideColumn}
        ${mainColumn}
      </div>
    </div>
  `;
}

const slug = getPersonSlugFromUrl();
const person = findPersonBySlug(slug);

const breadcrumbHtml = person
  ? renderBreadcrumb([
      { label: 'Home', href: '/' },
      { label: 'People', href: '/people.html' },
      { label: person.name },
    ])
  : renderBreadcrumb([
      { label: 'Home', href: '/' },
      { label: 'People', href: '/people.html' },
      { label: 'Person not found' },
    ]);

const pageHeaderHtml = person
  ? `
    <header class="bp-page-header">
      <div class="container py-3">
        ${breadcrumbHtml}
      </div>
    </header>
  `
  : `
    <header class="bp-page-header">
      <div class="container py-3">
        ${breadcrumbHtml}
        <h1 class="h3 mb-0">Person not found</h1>
      </div>
    </header>
  `;

if (!person) {
  const notFoundBody = renderPersonNotFoundBody();
  main.innerHTML = pageHeaderHtml + notFoundBody;
} else {
  const bodyHtml = renderPersonDetailBody(person);
  main.innerHTML = pageHeaderHtml + bodyHtml;
}
