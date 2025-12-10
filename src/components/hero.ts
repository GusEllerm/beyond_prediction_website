import { heroShowcases } from '../data/heroShowcases';
import type { HeroShowcase } from '../data/heroShowcases';

/**
 * Helper function to escape HTML entities for safe rendering
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Renders the content for a showcase slide based on its kind
 */
function renderShowcaseContent(showcase: HeroShowcase): string {
  switch (showcase.kind) {
    case 'image':
      if (!showcase.imageUrl) return '';
      return `
        <div class="ratio ratio-16x9">
          <img
            src="${escapeHtml(showcase.imageUrl)}"
            alt="${escapeHtml(showcase.imageAlt ?? '')}"
            class="img-fluid rounded"
          />
        </div>
      `;
    case 'iframe':
      if (!showcase.iframeSrc) return '';
      return `
        <div class="ratio ratio-16x9">
          <iframe
            src="${escapeHtml(showcase.iframeSrc)}"
            loading="lazy"
            class="border-0 rounded w-100 h-100"
            allowfullscreen
          ></iframe>
        </div>
      `;
    case 'video':
      if (!showcase.videoSrc) return '';
      return `
        <div class="ratio ratio-16x9">
          <video class="w-100 h-100 rounded" controls preload="metadata">
            <source src="${escapeHtml(showcase.videoSrc)}" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      `;
    case 'html':
    default:
      return showcase.html ?? '';
  }
}

/**
 * Hero section component that renders a Bootstrap hero section
 * @param container - The container element to render the hero into
 */
export function renderHero(container: HTMLElement): void {
  const indicators = heroShowcases
    .map(
      (item, index) => `
        <button
          type="button"
          data-bs-target="#bp-hero-carousel"
          data-bs-slide-to="${index}"
          ${index === 0 ? 'class="active" aria-current="true"' : ''}
          aria-label="${escapeHtml(item.title)}"
        ></button>
      `
    )
    .join('');

  const slides = heroShowcases
    .map(
      (item, index) => `
        <div class="carousel-item ${index === 0 ? 'active' : ''}">
          <div class="bp-hero-slide p-3 p-lg-4 bg-white border rounded-3 shadow-sm">
            <h2 class="h5 mb-2">${escapeHtml(item.title)}</h2>
            <p class="small text-muted mb-3">${escapeHtml(item.summary)}</p>
            ${renderShowcaseContent(item)}
            ${
              item.ctaLabel && item.ctaHref
                ? `
                  <div class="mt-3">
                    <a href="${escapeHtml(item.ctaHref)}" class="btn btn-outline-primary btn-sm">
                      ${escapeHtml(item.ctaLabel)}
                    </a>
                  </div>
                `
                : ''
            }
          </div>
        </div>
      `
    )
    .join('');

  container.innerHTML = `
    <section class="hero-section bg-light py-5">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <h1 class="display-4 fw-bold mb-4">Beyond Prediction: explanatory and transparent data science </h1>
            <p class="lead mb-4">
              Developing explainable, auditable data science methods for Aotearoa New Zealand's environment, health and society.
            </p>
          </div>
          <div class="col-lg-6">
            <div id="bp-hero-carousel" class="carousel carousel-dark slide carousel-fade">
              <div class="carousel-indicators">
                ${indicators}
              </div>
              <div class="carousel-inner">
                ${slides}
              </div>
              <button
                class="carousel-control-prev"
                type="button"
                data-bs-target="#bp-hero-carousel"
                data-bs-slide="prev"
              >
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
              </button>
              <button
                class="carousel-control-next"
                type="button"
                data-bs-target="#bp-hero-carousel"
                data-bs-slide="next"
              >
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
