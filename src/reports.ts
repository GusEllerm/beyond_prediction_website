// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Import Bootstrap JS (for navbar toggle and other interactive components)
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Import custom styles
import './styles.css';

// Import components
import { renderNavbar } from './components/navbar';
import { renderFooter } from './components/footer';
import { partners } from './data/partners';

// Import data
import { reports, getLatestReport, currentForwardPlan } from './data/reports';

const navbarContainer = document.querySelector<HTMLElement>('#navbar');
const app = document.querySelector<HTMLElement>('#app');
const footerContainer = document.querySelector<HTMLElement>('#footer');

if (!navbarContainer || !app || !footerContainer) {
  throw new Error('Layout containers not found on Reports page');
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
 * Renders the reports timeline
 */
function renderReportsTimeline(): void {
  if (!app) return;

  const sortedReports = [...reports].sort((a, b) => b.fromYear - a.fromYear);
  const latestReport = getLatestReport();

  // Build featured latest report card (entire card is clickable)
  const latestReportSection = latestReport
    ? `
      <div class="mb-4">
        <a href="/report.html?report=${encodeURIComponent(latestReport.slug)}" class="text-decoration-none text-reset d-block">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <span class="badge rounded-pill bg-primary-subtle text-primary mb-2">
                Latest report · ${latestReport.fromYear}–${latestReport.toYear}
              </span>
              <h2 class="h4 mb-2">${escapeHtml(latestReport.title)}</h2>
              ${
                latestReport.summary
                  ? `<p class="mb-0 text-muted">${escapeHtml(latestReport.summary)}</p>`
                  : `<p class="mb-0 text-muted">Read the latest annual report for Beyond Prediction.</p>`
              }
            </div>
          </div>
        </a>
      </div>
    `
    : '';

  // Build timeline items
  const timelineItemsHtml = sortedReports
    .map(
      (report) => `
        <li class="bp-timeline-item d-flex">
          <div class="bp-timeline-marker"></div>
          <div class="bp-timeline-content mb-3">
            <span class="text-muted small d-block mb-1">
              ${report.fromYear}–${report.toYear}
            </span>
            <h3 class="h6 mb-1">Beyond Prediction annual report</h3>
            ${
              report.summary
                ? `<p class="mb-2 small text-muted">${escapeHtml(report.summary)}</p>`
                : ''
            }
            <a
              href="/report.html?report=${encodeURIComponent(report.slug)}"
              class="btn btn-outline-primary btn-sm"
            >
              View report
            </a>
          </div>
        </li>
      `
    )
    .join('');



  const forwardPlanBannerHtml = `
    <div class="alert alert-secondary d-flex flex-wrap align-items-center justify-content-between mb-4" role="alert">
      <div class="me-3">
        <strong>Looking for the current forward plan?</strong><br />
        Read the ${currentForwardPlan.fromYear}–${currentForwardPlan.toYear} SSIF forward-looking plan for Beyond Prediction.
      </div>
      <a href="/forward-plan.html" class="btn btn-outline-primary btn-sm">
        View forward plan
      </a>
    </div>
  `;

  app.innerHTML = `
    <div class="container py-5">
      <div class="row">
        <div class="col-lg-10 col-xl-8">
          <header class="mb-5">
            <h1 class="mb-3">Annual Reports</h1>
            <p class="text-muted">
              Browse Beyond Prediction annual reports from 2020–2021${latestReport ? ` through ${latestReport.fromYear}–${latestReport.toYear}` : ''}.
            </p>
          </header>
          ${forwardPlanBannerHtml}
        ${latestReportSection}
        </div>
      </div>
      <div class="row">
        <div class="col-lg-10 col-xl-8">
          <section class="mb-4" id="all-reports-section">
            <h2 class="h5 mb-3">All annual reports</h2>
            <div class="bp-timeline-wrapper">
              <ul class="bp-timeline list-unstyled mb-0">
                ${timelineItemsHtml}
              </ul>
            </div>
          </section>
        </div>
        <aside class="col-lg-2 col-xl-4 mb-4">
          <div class="card border-0 bg-light bp-no-hover bp-sticky-sidebar">
            <div class="card-body">
              <h2 class="h6">About these reports</h2>
              <p class="small text-muted mb-2">
                These annual reports summarise progress, outcomes, and impact of the
                Beyond Prediction: Explanatory and Transparent Data Science programme
                for each reporting period.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  `;
}

// Initialize the page when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderReportsTimeline);
} else {
  renderReportsTimeline();
}

