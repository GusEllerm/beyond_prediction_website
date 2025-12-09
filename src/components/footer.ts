/**
 * Partner interface for footer logos
 * 
 * To add a new partner, create a Partner object with:
 * - name: The partner's display name (required for accessibility)
 * - url: Optional URL to link to the partner's website
 * - logoSrc: Optional path to logo image (e.g., '/logos/partner-name.png')
 *   If not provided, a placeholder will be shown instead.
 * 
 * Logo images should be placed in the `public/logos/` directory.
 * They will be accessible at the root path (e.g., `/logos/partner-name.png`).
 */
export interface Partner {
  name: string;
  url?: string;
  logoSrc?: string; // Path to logo image, e.g., '/logos/university-logo.png'
}

/**
 * Renders the site footer with partner logos
 * 
 * @param partners - Array of partner objects to display as logos
 * @returns HTML string for the footer
 */
export function renderFooter(partners: Partner[] = []): string {
  // Default partners if none provided (for demonstration)
  const defaultPartners: Partner[] = [
    { name: 'Partner One' },
    { name: 'Partner Two' },
    { name: 'Partner Three' },
    { name: 'Partner Four' },
    { name: 'Partner Five' },
  ];

  const partnersToRender = partners.length > 0 ? partners : defaultPartners;

  const partnerLogosHtml = partnersToRender
    .map((partner) => {
      // Render logo image if provided, otherwise use placeholder
      const logoElement = partner.logoSrc
        ? `<img src="${escapeHtml(partner.logoSrc)}" alt="${escapeHtml(partner.name)} logo" class="footer-logo-image" />`
        : `<span class="footer-logo-placeholder" aria-hidden="true">Logo</span>`;

      const logoContent = `
        ${logoElement}
        <span class="footer-logo-name">${escapeHtml(partner.name)}</span>
      `;

      // Render as link if URL provided, otherwise as div
      if (partner.url) {
        return `
          <a 
            class="footer-logo d-flex flex-column align-items-center text-decoration-none" 
            href="${escapeHtml(partner.url)}" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="${escapeHtml(partner.name)} - opens in new window"
          >
            ${logoContent}
          </a>
        `;
      } else {
        return `
          <div 
            class="footer-logo d-flex flex-column align-items-center"
            aria-label="${escapeHtml(partner.name)}"
          >
            ${logoContent}
          </div>
        `;
      }
    })
    .join('');

  return `
    <footer class="site-footer mt-5 pt-4 pb-4 border-top" role="contentinfo" aria-label="Site footer">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <h2 class="site-footer-heading text-center mb-3">Project Partners</h2>
            <p class="text-center text-muted mb-4" style="font-size: 0.9rem;">
              Collaborative organizations supporting Beyond Prediction research and development.
            </p>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <div class="footer-logo-grid">
              ${partnerLogosHtml}
            </div>
          </div>
        </div>
        <div class="row mt-4">
          <div class="col-12 text-center">
            <p class="text-muted small mb-0">
              &copy; ${new Date().getFullYear()} Beyond Prediction.
            </p>
          </div>
        </div>
      </div>
    </footer>
  `;
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

