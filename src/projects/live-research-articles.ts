import type { ProjectExtensionMount } from './extensions';

export const mountProjectExtension: ProjectExtensionMount = (root, project) => {
  // Example: embed demo iframes with sticky annotations in right column
  root.innerHTML = `
    <section>
      <div class="row">
        <div class="col-lg-10 col-xl-8">
          <h2 class="h4 mb-3">Live demos</h2>
          <p class="text-muted mb-3">
            This section is specific to <strong>${project.title}</strong> and demonstrates live examples of the LivePublication framework.
          </p>
        </div>
      </div>
      
      <div class="bp-iframe-section mb-5">
        <div class="row">
          <div class="col-lg-10 col-xl-8">
            <h3 class="h5 mb-2">Language identification method comparison</h3>
            <p class="text-muted small mb-3">
              An early example of LivePublication demonstrating live, updating components and generative content for computationally driven sciences.
            </p>
            <div class="ratio ratio-16x9">
              <iframe
                src="https://livepublication.github.io/LP_Pub_LID/"
                title="Language identification method comparison - LivePublication demo"
                loading="lazy"
                allowfullscreen
              ></iframe>
            </div>
          </div>
          <div class="col-lg-2 col-xl-4">
            <div class="bp-iframe-annotation">
              <h3 class="h5 mb-3">Language identification method comparison</h3>
              <p class="text-muted">
                An early example of LivePublication demonstrating live, updating components and generative content for computationally driven sciences.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bp-iframe-section mb-5">
        <div class="row">
          <div class="col-lg-10 col-xl-8">
            <h3 class="h5 mb-2">CoastSat LivePublication</h3>
            <p class="text-muted small mb-3">
              A live article that updates automatically as new satellite data arrives, with interactive visualizations.
            </p>
            <div class="ratio ratio-16x9">
              <iframe
                src="https://coastsat.livepublication.org/#6/-42.000/172.000"
                title="CoastSat LivePublication demo"
                loading="lazy"
                allowfullscreen
              ></iframe>
            </div>
          </div>
          <div class="col-lg-2 col-xl-4">
            <div class="bp-iframe-annotation">
              <h3 class="h5 mb-3">CoastSat LivePublication</h3>
              <p class="text-muted">
                A live article that updates automatically as new satellite data arrives, with interactive visualizations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
};

