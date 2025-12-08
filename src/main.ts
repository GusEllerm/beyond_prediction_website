// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Import Bootstrap JS (for navbar toggle and other interactive components)
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Import custom styles
import './styles.css';

// Import components
import { renderNavbar } from './components/navbar';
import { renderHero } from './components/hero';

/**
 * Main application entry point
 */
function initApp(): void {
  const appElement = document.querySelector<HTMLDivElement>('#app');

  if (!appElement) {
    console.error('App container element not found');
    return;
  }

  // Create navbar container
  const navbarContainer = document.createElement('div');
  navbarContainer.id = 'navbar-container';
  appElement.appendChild(navbarContainer);
  renderNavbar(navbarContainer);

  // Create hero container
  const heroContainer = document.createElement('div');
  heroContainer.id = 'hero-container';
  appElement.appendChild(heroContainer);
  renderHero(heroContainer);

  // Create content section
  const contentContainer = document.createElement('div');
  contentContainer.id = 'content-container';
  contentContainer.className = 'content-section';
  appElement.appendChild(contentContainer);
  renderContent(contentContainer);
}

/**
 * Renders the main content section with Bootstrap cards
 */
function renderContent(container: HTMLElement): void {
  container.innerHTML = `
    <div class="container">
      <div class="row mb-5">
        <div class="col-12 text-center">
          <h2 class="display-5 mb-4">Our Services</h2>
          <p class="lead text-muted">Discover what we offer</p>
        </div>
      </div>
      <div class="row g-4">
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Data Analytics</h5>
              <p class="card-text">
                Transform your raw data into actionable insights with our advanced analytics platform.
              </p>
              <a href="#" class="btn btn-outline-primary">Learn More</a>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Predictive Modeling</h5>
              <p class="card-text">
                Leverage machine learning to forecast trends and make data-driven decisions.
              </p>
              <a href="#" class="btn btn-outline-primary">Learn More</a>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Custom Solutions</h5>
              <p class="card-text">
                Tailored software solutions designed to meet your specific business needs.
              </p>
              <a href="#" class="btn btn-outline-primary">Learn More</a>
            </div>
          </div>
        </div>
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
