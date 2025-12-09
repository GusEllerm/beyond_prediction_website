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
import { findProjectDetail } from './data/researchProjects';
import type { ProjectExtensionMount } from './projects/extensions';

// Discover all extension modules under src/projects/*.ts
const extensionModules = import.meta.glob('./projects/*.ts', {
  eager: true,
}) as Record<string, { mountProjectExtension?: ProjectExtensionMount }>;

/**
 * Gets the project extension mount function for a given project slug
 * @param projectSlug - The project slug to find an extension for
 * @returns The mount function or null if no extension exists
 */
function getProjectExtension(projectSlug: string): ProjectExtensionMount | null {
  for (const [path, mod] of Object.entries(extensionModules)) {
    // Example path: "./projects/live-research-articles.ts"
    if (
      path.endsWith(`/projects/${projectSlug}.ts`) &&
      typeof mod.mountProjectExtension === 'function'
    ) {
      return mod.mountProjectExtension;
    }
  }
  return null;
}

/**
 * Parses the project slug from URL query parameters
 * @returns The project slug or null if not found
 */
function getProjectSlugFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('project');
  return slug;
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
 * Initializes the project detail page
 */
function initProjectPage(): void {
  const app = document.querySelector<HTMLDivElement>('#app');

  if (!app) {
    throw new Error('#app container not found');
  }

  const slug = getProjectSlugFromUrl();
  const project = findProjectDetail(slug);

  // Render navbar
  const navbarContainer = document.createElement('div');
  navbarContainer.id = 'navbar-container';
  app.appendChild(navbarContainer);
  renderNavbar(navbarContainer);

  if (!project) {
    // Project not found - render error page
    const breadcrumbHtml = renderBreadcrumb([
      { label: 'Home', href: '/' },
      { label: 'Research themes', href: '/' },
      { label: 'Project not found' },
    ]);

    const pageHeaderHtml = `
      <header class="bp-page-header">
        <div class="container py-3">
          ${breadcrumbHtml}
          <h1 class="h3 mb-0">Project not found</h1>
        </div>
      </header>
    `;

    const bodyHtml = `
      <main class="container py-4">
        <p class="text-muted mb-4">We couldn't find the requested project.</p>
        <a href="/" class="btn btn-outline-primary">Back to research themes</a>
      </main>
    `;

    app.innerHTML += pageHeaderHtml + bodyHtml;

    const footerContainer = document.createElement('div');
    footerContainer.id = 'footer-container';
    app.appendChild(footerContainer);
    footerContainer.innerHTML = renderFooter(partners);
    return;
  }

  // Get extension mount function if it exists
  const extensionMount = getProjectExtension(project.slug);

  // Build project page sections
  const questionsHtml =
    project.keyQuestions && project.keyQuestions.length > 0
      ? `
      <section class="mb-5">
        <h2 class="h4 mb-3">Key Questions</h2>
        <ul class="list-unstyled">
          ${project.keyQuestions.map((q) => `<li class="mb-2">• ${escapeHtml(q)}</li>`).join('')}
        </ul>
      </section>
    `
      : '';

  const highlightsHtml =
    project.highlights && project.highlights.length > 0
      ? `
      <section class="mb-5">
        <h2 class="h4 mb-3">Highlights</h2>
        <ul class="list-unstyled">
          ${project.highlights.map((h) => `<li class="mb-2">• ${escapeHtml(h)}</li>`).join('')}
        </ul>
      </section>
    `
      : '';

  const examplesHtml =
    project.examples && project.examples.length > 0
      ? `
      <section class="mb-5">
        <h2 class="h4 mb-3">Examples</h2>
        <div class="row g-3">
          ${project.examples
            .map(
              (example) => `
                <div class="col-md-6">
                  <div class="card h-100">
                    <div class="card-body">
                      <h3 class="h5 card-title">${escapeHtml(example.title)}</h3>
                      <p class="card-text">${escapeHtml(example.description)}</p>
                      ${
                        example.linkUrl
                          ? `<a href="${escapeHtml(example.linkUrl)}" class="btn btn-sm btn-outline-primary" target="_blank" rel="noopener noreferrer">View example</a>`
                          : ''
                      }
                    </div>
                  </div>
                </div>
              `
            )
            .join('')}
        </div>
      </section>
    `
      : '';

  const extraSectionsHtml =
    project.extraSections && project.extraSections.length > 0
      ? project.extraSections
          .map(
            (section) => `
        <section class="mb-5">
          <h2 class="h4 mb-3">${escapeHtml(section.heading)}</h2>
          <p>${escapeHtml(section.body)}</p>
        </section>
      `
          )
          .join('')
      : '';

  // Build breadcrumb and page header
  const breadcrumbHtml = renderBreadcrumb([
    { label: 'Home', href: '/' },
    { label: project.title },
  ]);

  const pageHeaderHtml = `
    <header class="bp-page-header">
      <div class="container py-3">
        ${breadcrumbHtml}
        <h1 class="h3 mb-0">${escapeHtml(project.title)}</h1>
      </div>
    </header>
  `;

  // Build body content
  const bodyHtml = `
    <main class="container py-4">
      <div class="mb-4">
        <p class="lead text-muted">${escapeHtml(project.shortDescription)}</p>
        ${
          project.longDescription
            ? `<p class="mt-3">${escapeHtml(project.longDescription)}</p>`
            : ''
        }
      </div>
      ${questionsHtml}
      ${highlightsHtml}
      ${examplesHtml}
      ${extraSectionsHtml}
      ${
        extensionMount
          ? '<section class="mt-5" id="project-extension-root"></section>'
          : ''
      }
    </main>
  `;

  app.innerHTML += pageHeaderHtml + bodyHtml;

  // Mount extension if it exists
  if (extensionMount) {
    const extensionRoot = document.getElementById('project-extension-root');
    if (extensionRoot) {
      extensionMount(extensionRoot, project);
    } else {
      console.warn('[Project] Extension root not found for', project.slug);
    }
  }

  // Render footer
  const footerContainer = document.createElement('div');
  footerContainer.id = 'footer-container';
  app.appendChild(footerContainer);
  footerContainer.innerHTML = renderFooter(partners);
}

// Initialize the page when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProjectPage);
} else {
  initProjectPage();
}

