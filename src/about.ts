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
import { currentForwardPlan } from './data/reports';
import { principalInvestigators, coInvestigators } from './data/people';
import { renderPersonCard } from './components/personCard';

const navbarContainer = document.querySelector<HTMLElement>('#navbar');
const main = document.querySelector<HTMLElement>('#bp-main');
const footerContainer = document.querySelector<HTMLElement>('#footer');

if (!navbarContainer || !main || !footerContainer) {
  throw new Error('Layout containers not found on About page');
}

renderNavbar(navbarContainer);
footerContainer.innerHTML = renderFooter(partners);

/**
 * Renders the About page
 */
function renderAboutPage(): void {
  if (!main) {
    throw new Error('Main container not found');
  }

  const plan = currentForwardPlan;

  const forwardPlanCalloutHtml = `
    <div class="alert alert-light border mt-4" role="alert">
      <div class="d-flex flex-wrap align-items-center justify-content-between">
        <div class="me-3">
          <strong>Current priorities</strong><br />
          See the ${plan.fromYear}–${plan.toYear} SSIF forward-looking plan for our latest goals and milestones.
        </div>
        <a href="/forward-plan.html" class="btn btn-outline-primary btn-sm">
          Read the forward plan
        </a>
      </div>
    </div>
  `;

  const aboutHtml = `
    <div class="container py-5">
      <header class="mb-5">
        <h1 class="mb-3">About Beyond Prediction</h1>
        <p class="text-muted">
          Beyond Prediction: Explanatory and Transparent Data Science is a seven-year national research programme designed to develop deep data science methods that connect data to meaning, causality and explanation, rather than just prediction.
        </p>
      </header>
      <section class="mb-5">
        <p>
          Its objectives are to create robust, transparent and reusable analytical tools and workflows that can be validated, maintained and explained automatically, and to embed these in "live" data science environments and journals so that analyses and publications can update as data and methods change.
        </p>
        <p>
          The programme aims to unlock the value of Aotearoa New Zealand's existing digital data assets in high-impact domains such as cancer and infectious disease, biodiversity and ecology, and human genomics, while explicitly advancing Vision Mātauranga through Māori-led data and genomics work.
        </p>
        <p>
          Alongside the research, Beyond Prediction is committed to lifting national capability by training researchers at scale, building communities of practice, and ensuring that modern data science methods can be applied in governance, industry, science and healthcare in a defensible and trustworthy way.
        </p>
        ${forwardPlanCalloutHtml}
      </section>
      ${(() => {
        // Filter to only include Co-Principal Investigators (exclude Co-Investigators)
        const coPrincipalInvestigators = coInvestigators.filter(
          (person) => person.roleLabel === 'Co-PI' || person.title === 'Co-Principal Investigator'
        );
        const allPIs = [...principalInvestigators, ...coPrincipalInvestigators];
        return allPIs.length > 0 ? `
          <section class="mt-5">
            <h2 class="h4 mb-3">Principal and Co-Principal Investigators</h2>
            <div class="row g-3">
              ${allPIs.map(renderPersonCard).join('')}
            </div>
          </section>
        ` : '';
      })()}
    </div>
  `;

  main.innerHTML = aboutHtml;
}

// Render page
renderAboutPage();

