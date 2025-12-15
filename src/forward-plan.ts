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

// Import data
import { currentForwardPlan } from './data/reports';

// Import utilities
import { escapeHtml } from './utils/dom';

const navbarContainer = document.querySelector<HTMLElement>('#navbar');
const main = document.querySelector<HTMLElement>('#bp-main');
const footerContainer = document.querySelector<HTMLElement>('#footer');

if (!navbarContainer || !main || !footerContainer) {
  throw new Error('Layout containers not found on Forward Plan page');
}

renderNavbar(navbarContainer);
footerContainer.innerHTML = renderFooter(partners);

/**
 * Loads HTML partial content
 * @param path - Path to the HTML partial file
 * @returns Promise resolving to HTML content string
 */
async function loadHtmlPartial(path: string): Promise<string> {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading forward plan partial:', error);
    return `
      <div class="alert alert-warning" role="alert">
        Forward plan content could not be loaded. It will be added later.
      </div>
    `;
  }
}

/**
 * Initializes the forward plan page
 */
async function initForwardPlanPage(): Promise<void> {
  if (!main) return;

  const plan = currentForwardPlan;

  const breadcrumbHtml = renderBreadcrumb([
    { label: 'Home', href: '/' },
    { label: 'Reports', href: '/reports.html' },
    { label: 'Forward plan' },
  ]);

  const bannerHtml = `
    <div class="alert alert-info d-flex flex-wrap align-items-center justify-content-between mb-4" role="alert">
      <div class="me-3">
        <strong>Download the ${plan.fromYear}–${plan.toYear} forward plan</strong><br />
        Download the official SSIF forward-looking plan as a Word document (.docx).
      </div>
      <a href="${escapeHtml(plan.docxPath)}" class="btn btn-outline-primary btn-sm" download>
        Download .docx
      </a>
    </div>
  `;

  const htmlContent = await loadHtmlPartial(plan.htmlPartialPath);

  main.innerHTML = `
    <header class="bp-page-header">
      <div class="container py-3">
        ${breadcrumbHtml}
      </div>
    </header>
    <div class="container py-4">
      <header class="mb-4">
        <p class="text-muted mb-1">${plan.fromYear}–${plan.toYear}</p>
        <h1 class="display-5 mb-2">${escapeHtml(plan.title)}</h1>
        <p class="lead text-muted mb-2">
          The current forward-looking plan for the ${plan.fromYear}–${plan.toYear} funding year.
        </p>
      </header>

      ${bannerHtml}

      <section class="bp-forward-plan-content">
        ${htmlContent}
      </section>
    </div>
  `;
}

// Initialize the page when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    void initForwardPlanPage();
  });
} else {
  void initForwardPlanPage();
}

