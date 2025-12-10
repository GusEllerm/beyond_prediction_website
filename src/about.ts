// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Import Bootstrap JS (for navbar toggle and other interactive components)
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Import custom styles
import './styles.css';

// Import components
import { renderNavbar } from './components/navbar';
import { renderFooter } from './components/footer';

// Import data
import { partners } from './data/partners';

const navbarContainer = document.querySelector<HTMLElement>('#navbar');
const app = document.querySelector<HTMLElement>('#app');
const footerContainer = document.querySelector<HTMLElement>('#footer');

if (!navbarContainer || !app || !footerContainer) {
  throw new Error('Layout containers not found on About page');
}

renderNavbar(navbarContainer);
footerContainer.innerHTML = renderFooter(partners);

/**
 * Loads the forward plan HTML partial
 * @returns Promise resolving to HTML content string
 */
async function loadForwardPlanHtml(): Promise<string> {
  try {
    const response = await fetch('/src/content/forward-plan-2025-2026.html');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading forward plan content:', error);
    return `
      <div class="alert alert-warning" role="alert">
        The 2025–2026 forward plan could not be loaded at this time. It will be added here soon.
      </div>
    `;
  }
}

/**
 * Renders the About page with overview and forward plan
 * @param forwardPlanHtml - HTML content for the forward plan section
 */
function renderAboutPage(forwardPlanHtml: string): void {
  if (!app) {
    throw new Error('App container not found');
  }

  const aboutHtml = `
    <header class="bp-page-header">
      <div class="container py-3">
        <h1 class="h3 mb-0">About Beyond Prediction</h1>
      </div>
    </header>
    <main class="container py-4">
      <div class="row">
        <div class="col-lg-10 col-xl-8">
          <section class="mb-5">
            <p class="lead">
              Beyond Prediction: Explanatory and Transparent Data Science is a seven-year national research programme designed to develop deep data science methods that connect data to meaning, causality and explanation, rather than just prediction.
            </p>
            <p>
              Its objectives are to create robust, transparent and reusable analytical tools and workflows that can be validated, maintained and explained automatically, and to embed these in "live" data science environments and journals so that analyses and publications can update as data and methods change.
            </p>
            <p>
              The programme aims to unlock the value of Aotearoa New Zealand's existing digital data assets in high-impact domains such as cancer and infectious disease, biodiversity and ecology, and human genomics, while explicitly advancing Vision Mātauranga through Māori-led data and genomics work.
            </p>
            <p>
              Alongside the research, Beyond Prediction is committed to lifting national capability by training researchers at scale, building communities of practice, and ensuring that modern data science methods can be applied in governance, industry, science and healthcare in a defensible and trustworthy way.
            </p>
          </section>

          <section class="mb-5">
            <h2 class="h4 mb-3">Forward plan 2025–2026</h2>
            <p class="text-muted small mb-3">
              The current forward-looking plan for the 2025–2026 funding year is summarised below.
            </p>
            <div class="bp-forward-plan">
              ${forwardPlanHtml}
            </div>
          </section>
        </div>
      </div>
    </main>
  `;

  app.innerHTML = aboutHtml;
}

// Load forward plan and render page
(async () => {
  const forwardPlanHtml = await loadForwardPlanHtml();
  renderAboutPage(forwardPlanHtml);
})();

