// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Import Bootstrap JS (for navbar toggle and other interactive components)
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Import custom styles
import './styles.css';

// Import components
import { renderNavbar } from './components/navbar';
import { renderHero } from './components/hero';
import { renderFooter } from './components/footer';

// Import data
import { researchProjects } from './data/researchProjects';
import { partners } from './data/partners';

// Import utilities
import { escapeHtml } from './utils/dom';

/**
 * Main application entry point
 */
function initApp(): void {
  const appElement = document.querySelector<HTMLDivElement>('#app');
  const mainElement = document.querySelector<HTMLElement>('#bp-main');

  if (!appElement || !mainElement) {
    console.error('App container or main element not found');
    return;
  }

  // Create navbar container
  const navbarContainer = document.createElement('div');
  navbarContainer.id = 'navbar-container';
  appElement.insertBefore(navbarContainer, mainElement);
  renderNavbar(navbarContainer);

  // Create hero container
  const heroContainer = document.createElement('div');
  heroContainer.id = 'hero-container';
  mainElement.appendChild(heroContainer);
  renderHero(heroContainer);

  // Create content section
  const contentContainer = document.createElement('div');
  contentContainer.id = 'content-container';
  contentContainer.className = 'content-section';
  mainElement.appendChild(contentContainer);
  renderContent(contentContainer);

  // Create footer container
  // Note: renderFooter returns HTML string, so we set innerHTML directly
  const footerContainer = document.createElement('div');
  footerContainer.id = 'footer-container';
  appElement.appendChild(footerContainer);

  // Render footer with partners from data file
  footerContainer.innerHTML = renderFooter(partners);
}

/**
 * Renders the main content section with Bootstrap cards
 * Each card links to a project detail page using the project's slug
 */
function renderContent(container: HTMLElement): void {
  const cardsHtml = researchProjects
    .map((project) => {
      const href = `/project.html?project=${encodeURIComponent(project.slug)}`;
      return `
      <div class="col-md-4">
        <a href="${href}" class="text-decoration-none text-reset">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">${escapeHtml(project.title)}</h5>
              <p class="card-text">
                ${escapeHtml(project.shortDescription)}
              </p>
            </div>
          </div>
        </a>
      </div>
    `;
    })
    .join('');

  container.innerHTML = `
    <div class="container">
      <div class="row mb-5">
        <div class="col-12 text-center">
          <h2 class="display-5 mb-4">Research and Development</h2>
          <p class="lead text-muted">Explore the research and case studies of Beyond Prediction</p>
        </div>
      </div>
      <div class="row g-4">
        ${cardsHtml}
      </div>
    </div>
  `;
}

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
