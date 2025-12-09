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
import { allPeople, type Person } from './data/people';

const navbarContainer = document.querySelector<HTMLElement>('#navbar');
const app = document.querySelector<HTMLElement>('#app');
const footerContainer = document.querySelector<HTMLElement>('#footer');

if (!navbarContainer || !app || !footerContainer) {
  throw new Error('Layout containers not found on Person page');
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
    <main class="container py-4">
      <p class="text-muted mb-4">We couldn't find the requested profile.</p>
      <a href="/people.html" class="btn btn-outline-primary">Back to People</a>
    </main>
  `;
}

/**
 * Renders the body content for a person detail view
 * @param p - The person object to render
 * @returns HTML string for the body content
 */
function renderPersonDetailBody(p: Person): string {
  const safeName = escapeHtml(p.name);

  const roleLabel = p.roleLabel
    ? `<span class="badge bg-secondary me-2">${escapeHtml(p.roleLabel)}</span>`
    : '';
  const affiliationBadge = p.affiliation
    ? `<span class="badge bg-primary me-2">${escapeHtml(p.affiliation)}</span>`
    : '';
  // Only show title if it's different from roleLabel to avoid duplication
  const title = p.title && p.title !== p.roleLabel
    ? `<p class="mb-1 text-muted">${escapeHtml(p.title)}</p>`
    : '';
  const bioLong = p.bioLong
    ? `<p>${escapeHtml(p.bioLong)}</p>`
    : p.bioShort
      ? `<p>${escapeHtml(p.bioShort)}</p>`
      : '<p class="text-muted">Profile details will be added soon.</p>';

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

  const contactSection = contactItems.length
    ? `
      <section class="mt-4">
        <h2 class="h5 mb-2">Contact</h2>
        <ul class="list-unstyled mb-0">
          ${contactItems.join('')}
        </ul>
      </section>
    `
    : '';

  const tagsSection =
    p.tags && p.tags.length
      ? `
        <section class="mt-4">
          <h2 class="h6 mb-2">Research areas & interests</h2>
          <div class="d-flex flex-wrap gap-2">
            ${p.tags.map((tag) => `<span class="badge bg-light text-dark border">${escapeHtml(tag)}</span>`).join('')}
          </div>
        </section>
      `
      : '';

  const photoColumn = p.photoUrl
    ? `
      <div class="mb-4 mb-md-0" style="flex: 0 0 20%; max-width: 20%;">
        <div class="card">
          <img 
            src="${escapeHtml(p.photoUrl)}" 
            class="person-detail-photo" 
            alt="${safeName}" 
          />
        </div>
      </div>
    `
    : '';

  const textColumn = `
    <div class="${p.photoUrl ? '' : 'col-12'}" style="${p.photoUrl ? 'flex: 0 0 80%; max-width: 80%;' : ''}">
      <div class="mb-3">
        <div class="mb-2">
          ${roleLabel}
          ${affiliationBadge}
        </div>
        ${title}
      </div>
      ${bioLong}
      ${contactSection}
      ${tagsSection}
    </div>
  `;

  return `
    <main class="container py-4">
      <div class="row">
        ${photoColumn}
        ${textColumn}
      </div>
    </main>
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

const headerTitle = person ? person.name : 'Person not found';

const pageHeaderHtml = `
  <header class="bp-page-header">
    <div class="container py-3">
      ${breadcrumbHtml}
      <h1 class="h3 mb-0">${escapeHtml(headerTitle)}</h1>
    </div>
  </header>
`;

if (!person) {
  const notFoundBody = renderPersonNotFoundBody();
  app.innerHTML = pageHeaderHtml + notFoundBody;
} else {
  const bodyHtml = renderPersonDetailBody(person);
  app.innerHTML = pageHeaderHtml + bodyHtml;
}

