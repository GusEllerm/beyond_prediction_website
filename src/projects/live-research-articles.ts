import type { ProjectExtensionMount } from './extensions';

export const mountProjectExtension: ProjectExtensionMount = (root, project) => {
  // Example: embed a demo iframe and some custom explanatory text
  root.innerHTML = `
    <section>
      <h2 class="h4 mb-3">Live demo</h2>
      <p class="text-muted mb-3">
        This section is specific to <strong>${project.title}</strong> and demonstrates a live example.
      </p>
      <div class="ratio ratio-16x9 mb-3">
        <iframe
          src="https://example.com/your-live-demo"
          title="${project.title} demo"
          loading="lazy"
          allowfullscreen
        ></iframe>
      </div>
      <p class="small text-muted mb-0">
        This iframe is just an example; this extension file can render any custom DOM or interactive widget.
      </p>
    </section>
  `;
};

