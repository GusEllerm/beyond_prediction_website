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
          <h2 class="display-5 mb-4">Research and Development</h2>
          <p class="lead text-muted">Explore the research and case studies of Beyond Prediction</p>
        </div>
      </div>
      <div class="row g-4">
        <div class="col-md-4">
          <a href="#" class="text-decoration-none text-reset">
            <div class="card h-100">
              <div class="card-body">
                <h5 class="card-title">Live Research Articles (LivePublication)</h5>
                <p class="card-text">
                  Transform static papers into live, reproducible research objects that stay linked to their data, code, and workflows.
                </p>
              </div>
            </div>
          </a>
        </div>
        <div class="col-md-4">
          <a href="#" class="text-decoration-none text-reset">
            <div class="card h-100">
              <div class="card-body">
                <h5 class="card-title">Trustworthy & Explainable AI for Science</h5>
                <p class="card-text">
                  Develop AI methods that detect hallucinations, expose their reasoning, and make model decisions auditable in scientific contexts.
                </p>
              </div>
            </div>
          </a>
        </div>
        <div class="col-md-4">
          <a href="#" class="text-decoration-none text-reset">
            <div class="card h-100">
              <div class="card-body">
                <h5 class="card-title">AI for Research Literature & Dynamic Documents</h5>
                <p class="card-text">
                  Use AI-native document structures, knowledge graphs, and auto-updating reports to turn the research literature into a queryable, living resource.
                </p>
              </div>
            </div>
          </a>
        </div>
        <div class="col-md-4">
          <a href="#" class="text-decoration-none text-reset">
            <div class="card h-100">
              <div class="card-body">
                <h5 class="card-title">Genomics Data Science & Evolutionary Inference</h5>
                <p class="card-text">
                  Build Bayesian and phylogenetic methods that unlock new insights from genomic data—from single-cell tumours to human evolution.
                </p>
              </div>
            </div>
          </a>
        </div>
        <div class="col-md-4">
          <a href="#" class="text-decoration-none text-reset">
            <div class="card h-100">
              <div class="card-body">
                <h5 class="card-title">Biodiversity, Ecology & Biosecurity Modelling</h5>
                <p class="card-text">
                  Model adaptation, resilience, and invasion risk in species that matter for Aotearoa's ecosystems and biosecurity.
                </p>
              </div>
            </div>
          </a>
        </div>
        <div class="col-md-4">
          <a href="#" class="text-decoration-none text-reset">
            <div class="card h-100">
              <div class="card-body">
                <h5 class="card-title">Māori Genomics & Data Sovereignty</h5>
                <p class="card-text">
                  Co-develop genomic tools and population models that support Māori health, equity, and tino rangatiratanga over data.
                </p>
              </div>
            </div>
          </a>
        </div>
        <div class="col-md-4">
          <a href="#" class="text-decoration-none text-reset">
            <div class="card h-100">
              <div class="card-body">
                <h5 class="card-title">Digital Research Skills & Communities</h5>
                <p class="card-text">
                  Grow national capability through ResBaz, Carpentries, and open training in data, coding, and reproducible research.
                </p>
              </div>
            </div>
          </a>
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
