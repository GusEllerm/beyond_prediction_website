import type { ProjectExtensionMount } from './extensions';

export const mountProjectExtension: ProjectExtensionMount = (root, project) => {
  // Simple example extension for live-research-articles project
  root.innerHTML = `
    <section class="mb-5">
      <h2 class="h4 mb-3">Project-specific content</h2>
      <p class="text-muted mb-3">
        This is an example extension for <strong>${project.title}</strong>. 
        Project-specific content and custom functionality can be added here.
      </p>
    </section>
  `;
};

