import type { ProjectExtensionMount } from './extensions';

export const mountProjectExtension: ProjectExtensionMount = (root, _project) => {
  root.innerHTML = `
    <section class="mb-5">
      <div class="mb-4">
        <!-- Template space for text above the image -->
        <p class="text-muted">
          The LivePublication framework provides a structured way to connect evolving computational experiments with equally evolving research articles. Instead of treating the paper as a static snapshot at the end of a project, LivePublication treats it as part of the research system: computational workflows continue to run, data and results continue to change, and the article updates procedurally in response. At a high level, the framework defines how in-situ experiments, their provenance and outputs, and the narrative and presentation of a paper are coordinated so that each LivePublication instance can produce versioned, FAIR-aligned containers that remain reproducible and interpretable over time.
        </p>
      </div>
      
      <figure class="mb-4">
        <img
          src="/projects/live-research-articles/LP_framework_illustrated.webp"
          alt="LivePublication Conceptual Framework"
          class="img-fluid rounded"
          loading="lazy"
        />
        <figcaption class="text-muted small mt-2 text-center">
          The LivePublication Framework illustrated
        </figcaption>
      </figure>
      
      <div class="mt-4">
        <!-- Template space for text below the image -->
        <p class="text-muted">
          As the illustration shows, the framework is divided into three main components: an Experiment Infrastructure that acquires data and runs workflows, an Interface that packages their outputs into portable research objects, and a LivePaper that uses these objects to drive a dynamic narrative and final publication. This separation means that researchers can swap or extend individual technologies—such as workflow systems, data sources, or document engines—without redesigning the whole system, while still preserving liveness, reproducibility, and completeness. Each execution of the framework results in a new LivePublication container that bundles the experimental context and the resulting article, allowing readers to both trust and, where appropriate, re-run or extend the underlying research.
        </p>
      </div>
    </section>
  `;
};
