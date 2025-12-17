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
import { getReportBySlug, getReportDocxPath } from './data/reports';

// Import utilities
import { escapeHtml } from './utils/dom';

const navbarContainer = document.querySelector<HTMLElement>('#navbar');
const main = document.querySelector<HTMLElement>('#bp-main');
const footerContainer = document.querySelector<HTMLElement>('#footer');

if (!navbarContainer || !main || !footerContainer) {
  throw new Error('Layout containers not found on Report page');
}

renderNavbar(navbarContainer);
footerContainer.innerHTML = renderFooter(partners);

/**
 * Parses the report slug from URL query parameters
 * @returns The report slug or null if not found
 */
function getSlugFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('report');
  return slug;
}

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
    console.error('Error loading report partial:', error);
    return `
      <div class="alert alert-warning" role="alert">
        Report content placeholder could not be loaded. It will be added later.
      </div>
    `;
  }
}

/**
 * Renders the report detail page
 */
async function renderReport(): Promise<void> {
  if (!main) return;

  const slug = getSlugFromUrl();
  if (!slug) {
    const breadcrumbHtml = renderBreadcrumb([
      { label: 'Home', href: '/' },
      { label: 'Annual Reports', href: '/reports.html' },
      { label: 'Report not found' },
    ]);

    main.innerHTML = `
      <header class="bp-page-header">
        <div class="container py-3">
          ${breadcrumbHtml}
          <h1 class="h3 mb-0">Report not found</h1>
        </div>
      </header>
      <div class="container py-4">
        <div class="alert alert-danger" role="alert">
          No report specified.
        </div>
      </div>
    `;
    return;
  }

  const report = getReportBySlug(slug);
  if (!report) {
    const breadcrumbHtml = renderBreadcrumb([
      { label: 'Home', href: '/' },
      { label: 'Annual Reports', href: '/reports.html' },
      { label: 'Report not found' },
    ]);

    main.innerHTML = `
      <header class="bp-page-header">
        <div class="container py-3">
          ${breadcrumbHtml}
          <h1 class="h3 mb-0">Report not found</h1>
        </div>
      </header>
      <div class="container py-4">
        <div class="alert alert-danger" role="alert">
          The requested report could not be found.
        </div>
      </div>
    `;
    return;
  }

  const htmlContent = report.htmlPartialPath
    ? await loadHtmlPartial(report.htmlPartialPath)
    : `
      <div class="alert alert-info" role="alert">
        Placeholder content for ${escapeHtml(report.title)} will be added soon.
      </div>
    `;

  const docxPath = getReportDocxPath(report);
  const pdfPath = report.pdfPath;

  const downloadButtons: string[] = [];
  if (docxPath) {
    downloadButtons.push(
      `<a href="${escapeHtml(docxPath)}" class="btn btn-outline-primary btn-sm" download>Download .docx</a>`
    );
  }
  if (pdfPath) {
    downloadButtons.push(
      `<a href="${escapeHtml(pdfPath)}" class="btn btn-outline-secondary btn-sm" target="_blank" rel="noopener noreferrer">Download PDF</a>`
    );
  }

  const docxBannerHtml =
    docxPath || pdfPath
      ? `
    <div class="alert alert-info d-flex flex-wrap align-items-center justify-content-between mb-4" role="alert">
      <div class="me-3">
        <strong>Download this report</strong><br />
        ${
          docxPath && pdfPath
            ? 'Get the full annual report as a Word document (.docx) or PDF.'
            : docxPath
              ? 'Get the full annual report as a Word document (.docx).'
              : 'Get the full annual report as a PDF document.'
        }
      </div>
      <div class="d-flex gap-2">
        ${downloadButtons.join('')}
      </div>
    </div>
    `
      : '';

  const breadcrumbHtml = renderBreadcrumb([
    { label: 'Home', href: '/' },
    { label: 'Annual Reports', href: '/reports.html' },
    { label: report.title },
  ]);

  main.innerHTML = `
    <header class="bp-page-header">
      <div class="container py-3">
        ${breadcrumbHtml}
      </div>
    </header>
    <div class="container py-4">
      <header class="mb-4">
        <p class="text-muted mb-1">${report.fromYear}–${report.toYear}</p>
        <h1 class="display-5 mb-2">${escapeHtml(report.title)}</h1>
        ${report.summary ? `<p class="lead text-muted mb-2">${escapeHtml(report.summary)}</p>` : ''}
      </header>

      ${docxBannerHtml}

      <section class="bp-report-content">
        ${htmlContent}
      </section>
    </div>
  `;
}

// Initialize the page when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    void renderReport();
  });
} else {
  void renderReport();
}
