/**
 * Hero section component that renders a Bootstrap hero section
 * @param container - The container element to render the hero into
 */
export function renderHero(container: HTMLElement): void {
  container.innerHTML = `
    <section class="hero-section bg-light py-5">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <h1 class="display-4 fw-bold mb-4">Welcome to Beyond Prediction</h1>
            <p class="lead mb-4">
              Building the future with data-driven insights and innovative solutions.
            </p>
            <a href="#contact" class="btn btn-primary btn-lg">
              Get Started
            </a>
          </div>
          <div class="col-lg-6">
            <div class="hero-image-placeholder">
              <div class="bg-secondary rounded p-5 text-white text-center">
                <i class="bi bi-graph-up-arrow" style="font-size: 4rem;"></i>
                <p class="mt-3 mb-0">Visualization Placeholder</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
