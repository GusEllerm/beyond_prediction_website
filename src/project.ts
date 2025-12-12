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
import { getPeopleForTheme } from './data/peopleByTheme';
import { renderPersonCard } from './components/personCard';
import { getPublicationsByIds, renderPublicationsSection } from './utils/publications';

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
 * Sets up the rotating key question spotlight card
 * @param questions - Array of key questions to cycle through
 */
function setupKeyQuestionSpotlight(questions: string[]): void {
  if (!questions || questions.length === 0) {
    return;
  }

  const contentEl = document.querySelector<HTMLElement>('#bp-key-question-content');
  const counterEl = document.querySelector<HTMLElement>('#bp-key-question-counter');
  const cardEl = document.querySelector<HTMLElement>('.bp-key-question-card');

  if (!contentEl || !counterEl || !cardEl) {
    return;
  }

  let index = 0;

  const total = questions.length;
  const displayDurationMs = 6000; // time each question is shown
  const fadeDurationMs = 200; // should match CSS transition

  const updateQuestion = (newIndex: number): void => {
    const question = questions[newIndex];
    if (contentEl) {
      contentEl.textContent = question;
    }
    counterEl.textContent = `${newIndex + 1} of ${total}`;
  };

  // Initial render
  updateQuestion(index);

  let intervalId: number | undefined;

  const advanceQuestion = (): void => {
    // fade out
    cardEl.classList.add('bp-key-question-fade-out');
    window.setTimeout(() => {
      index = (index + 1) % total;
      updateQuestion(index);
      // fade back in
      cardEl.classList.remove('bp-key-question-fade-out');
    }, fadeDurationMs);
  };

  const startRotation = (): void => {
    intervalId = window.setInterval(() => {
      advanceQuestion();
    }, displayDurationMs);
  };

  const stopRotation = (): void => {
    if (intervalId !== undefined) {
      window.clearInterval(intervalId);
      intervalId = undefined;
    }
  };

  const resetRotation = (): void => {
    stopRotation();
    startRotation();
  };

  // Start automatic rotation
  startRotation();

  // Optional: pause rotation on hover for readability
  cardEl.addEventListener('mouseenter', () => {
    stopRotation();
  });

  cardEl.addEventListener('mouseleave', () => {
    if (!intervalId) {
      startRotation();
    }
  });

  // Click to advance to next question
  cardEl.addEventListener('click', () => {
    advanceQuestion();
    // Reset the rotation timer so it doesn't immediately advance again
    resetRotation();
  });
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

  // Get people working on this theme
  const themePeople = getPeopleForTheme(project.slug);

  // Get publications for this project and sort by year (newest first)
  const publications = project.publicationIds
    ? getPublicationsByIds(project.publicationIds).sort((a, b) => {
        // Sort by year descending (newest first)
        // Publications without years go to the end
        if (!a.year && !b.year) return 0;
        if (!a.year) return 1;
        if (!b.year) return -1;
        return b.year - a.year;
      })
    : [];
  const publicationsHtml = renderPublicationsSection(publications);

  // Build project page sections
  const questionsCardHtml =
    project.keyQuestions && project.keyQuestions.length > 0
      ? `
            <div class="col-lg-4 d-flex">
              <div class="card shadow-sm bp-key-question-card w-100 h-100">
                <div class="card-body d-flex flex-column justify-content-center h-100 position-relative">
                  <span
                    class="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center position-absolute top-0 start-0 bp-key-question-icon"
                    style="width: 32px; height: 32px; font-size: 1.1rem; margin: 1rem;"
                  >
                    <span class="fw-bold">?</span>
                  </span>
                  <p class="lead mb-1" id="bp-key-question-text" style="padding-left: 32px;">
                    <span id="bp-key-question-content"></span>
                  </p>
                  <p class="text-muted small mb-0 position-absolute bottom-0 end-0 me-3 mb-3" id="bp-key-question-counter"></p>
                </div>
              </div>
            </div>
    `
      : '';


  const examplesHtml =
    project.examples && project.examples.length > 0
      ? `
      <section class="mt-5">
        <h2 class="h4 mb-2">Research</h2>
        <div class="row g-3">
          ${project.examples
            .map(
              (example) => {
                const exampleUrl = `/example.html?project=${encodeURIComponent(project.slug)}&example=${encodeURIComponent(example.slug)}`;
                return `
                <div class="col-md-6">
                  <a href="${exampleUrl}" class="text-decoration-none text-reset d-block h-100">
                    <div class="card h-100">
                      <div class="card-body">
                        <h3 class="h5 card-title">${escapeHtml(example.title)}</h3>
                        <p class="card-text">${escapeHtml(example.shortDescription ?? example.description)}</p>
                      </div>
                    </div>
                  </a>
                </div>
              `;
              }
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

  // Build people section
  const peopleSectionHtml =
    themePeople.length === 0
      ? `
        <section class="mt-5">
          <h2 class="h4 mb-2">People</h2>
          <p class="text-muted small mb-0">
            Theme members will be listed here soon.
          </p>
        </section>
      `
      : `
        <section class="mt-5">
          <h2 class="h4 mb-2">People</h2>
          <div class="row g-3">
            ${themePeople.map(renderPersonCard).join('')}
          </div>
        </section>
      `;

  // Build body content
  const bodyHtml = `
    <main class="container py-4">
      <div class="row align-items-stretch" id="bp-key-questions">
        <div class="col-lg-8 mb-4 mb-lg-0 d-flex">
          <div class="flex-grow-1">
            <p class="lead text-muted">${escapeHtml(project.shortDescription)}</p>
            ${
              project.longDescription
                ? `<p class="mt-3">${escapeHtml(project.longDescription)}</p>`
                : ''
            }
          </div>
        </div>
        ${questionsCardHtml}
      </div>
      ${
        extensionMount
          ? '<section class="mt-5" id="project-extension-root"></section>'
          : ''
      }
      ${examplesHtml ? `
        <div class="row">
          <div class="col-12">
            ${examplesHtml}
          </div>
        </div>
      ` : ''}
      ${publicationsHtml ? `
        <div class="row">
          <div class="col-12">
            ${publicationsHtml}
          </div>
        </div>
      ` : ''}
      <div class="row">
        <div class="col-lg-10 col-xl-8">
          ${extraSectionsHtml}
        </div>
      </div>
      ${peopleSectionHtml ? `
        <div class="row">
          <div class="col-12">
            ${peopleSectionHtml}
          </div>
        </div>
      ` : ''}
    </main>
  `;

  app.innerHTML += pageHeaderHtml + bodyHtml;

  // Initialise key question spotlight
  if (project.keyQuestions && project.keyQuestions.length > 0) {
    setupKeyQuestionSpotlight(project.keyQuestions);
  }

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

